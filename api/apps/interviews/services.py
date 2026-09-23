from __future__ import annotations

import json
import logging
import re
from decimal import Decimal
from typing import Dict, Iterable, Optional

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.html import strip_tags
from django.core.exceptions import ValidationError

from apps.content.system_settings import (
    get_interview_minimum_silence_seconds,
    get_interview_question_gap_seconds,
    get_tts_speed,
)
from .livekit_service import LiveKitService
from .models import InterviewSession, InterviewTranscript, Question, VoiceProfile, VoiceProfileGrant

logger = logging.getLogger(__name__)


class SessionNotJoinableError(ValueError):
    """Exception raised when an interview session is not in a joinable state."""


def get_session_questions(session: InterviewSession) -> Iterable[Question]:
    script = getattr(session, "interview_script", None) or getattr(getattr(session, "job_post", None), "interview_script", None)

    if not getattr(session, "pk", None):
        if session.question_group_id and session.question_group:
            return session.question_group.questions.all()
        if session.job_post_id and getattr(session.job_post, "interview_template_id", None):
            return session.job_post.interview_template.questions.all()
        if script:
            if script.questions.exists():
                return script.questions.all()
            if script.question_group_id and script.question_group:
                return script.question_group.questions.all()
        return Question.objects.none()

    questions = session.questions.all()
    if questions.exists():
        return questions
    if session.question_group_id:
        return session.question_group.questions.all()
    if session.job_post_id and getattr(session.job_post, "interview_template_id", None):
        return session.job_post.interview_template.questions.all()
    if script:
        if script.questions.exists():
            return script.questions.all()
        if script.question_group_id and script.question_group:
            return script.question_group.questions.all()
    return questions


def _clean_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(strip_tags(value).split())


def _truncate_text(value: str, limit: int) -> str:
    if len(value) <= limit:
        return value
    return value[: max(0, limit - 1)].rstrip() + "..."


def _sanitize_transcript_text(value: str | None) -> str:
    if not value:
        return ""

    text = strip_tags(value)
    text = re.sub(r"<function=[^>]+>[\s\S]*?</function>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"</?function[^>]*>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\{\s*\"stage_name\"\s*:\s*\"[^\"]+\"\s*\}", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"```[\s\S]*?```", " ", text)
    return " ".join(text.split())


def _build_interview_subject(
    session: InterviewSession,
    job_description: str,
    question_group_description: str,
) -> str:
    parts: list[str] = []

    if session.job_post and session.job_post.job_name:
        parts.append(session.job_post.job_name)
    if session.question_group and session.question_group.name:
        parts.append(session.question_group.name)
    if session.job_post and getattr(session.job_post, "interview_template_id", None):
        template_name = getattr(session.job_post.interview_template, "name", "")
        if template_name:
            parts.append(template_name)

    if parts:
        return " - ".join(parts)

    fallback = job_description or question_group_description
    return fallback[:120] if fallback else "Phong van tuyen dung"


def resolve_voice_profile_for_session(session: InterviewSession) -> VoiceProfile | None:
    direct_profile = getattr(session, "voice_profile", None)
    if direct_profile and direct_profile.status == VoiceProfile.STATUS_READY:
        return direct_profile

    job_post = getattr(session, "job_post", None)
    company_id = getattr(job_post, "company_id", None) if job_post else None

    grants = (
        VoiceProfileGrant.objects.select_related("profile")
        .prefetch_related("profile__samples", "profile__samples__audio_file")
        .filter(is_active=True, profile__status=VoiceProfile.STATUS_READY)
    )

    if job_post:
        job_grant = grants.filter(job_post=job_post, is_default=True).order_by("-update_at", "-create_at").first()
        if job_grant:
            return job_grant.profile

    if company_id:
        company_grant = grants.filter(company_id=company_id, job_post__isnull=True, is_default=True).order_by("-update_at", "-create_at").first()
        if company_grant:
            return company_grant.profile

    if job_post:
        job_grant = grants.filter(job_post=job_post).order_by("-update_at", "-create_at").first()
        if job_grant:
            return job_grant.profile

    if company_id:
        company_grant = grants.filter(company_id=company_id, job_post__isnull=True).order_by("-update_at", "-create_at").first()
        if company_grant:
            return company_grant.profile

    return None


def build_tts_voice_profile_payload(profile: VoiceProfile | None) -> dict | None:
    if not profile or profile.status != VoiceProfile.STATUS_READY:
        return None

    samples = []
    total_duration = Decimal("0")
    for sample in profile.samples.all():
        audio_url = ""
        try:
            audio_url = sample.audio_file.get_full_url() if sample.audio_file else ""
        except Exception:
            audio_url = ""
        if not audio_url:
            continue
        if sample.duration_seconds is not None:
            total_duration += sample.duration_seconds
        samples.append(
            {
                "id": sample.id,
                "audioUrl": audio_url,
                "referenceText": sample.reference_text,
                "durationSeconds": float(sample.duration_seconds) if sample.duration_seconds is not None else None,
                "sortOrder": sample.sort_order,
            }
        )

    return {
        "id": profile.id,
        "name": profile.name,
        "voiceType": profile.voice_type,
        "status": profile.status,
        "language": profile.language,
        "presetEngine": profile.preset_engine,
        "presetVoiceId": profile.preset_voice_id,
        "samples": samples,
        "sampleCount": len(samples),
        "totalDurationSeconds": float(total_duration),
        "isReadyForTts": True,
    }

def get_voice_profile_preparation_summary(profile: VoiceProfile, *, status: str | None = None) -> dict:
    samples = list(profile.samples.all())
    total_duration = Decimal("0")
    sample_count = len(samples)
    for sample in samples:
        if sample.duration_seconds is not None:
            total_duration += sample.duration_seconds

    metadata = dict(profile.metadata or {})
    resolved_status = status or profile.status
    is_ready_for_tts = resolved_status == VoiceProfile.STATUS_READY
    if profile.voice_type == VoiceProfile.TYPE_CLONED:
        is_ready_for_tts = is_ready_for_tts and sample_count > 0
    metadata.update({
        "sampleCount": sample_count,
        "totalDurationSeconds": float(total_duration),
        "isReadyForTts": is_ready_for_tts,
    })
    return metadata

def validate_voice_profile_samples(profile: VoiceProfile) -> None:
    if profile.voice_type != VoiceProfile.TYPE_CLONED:
        return

    samples = list(profile.samples.all())
    if not samples:
        raise ValidationError({"samples": "At least one reference sample is required."})

    missing_transcript_ids = [sample.id for sample in samples if not str(sample.reference_text or "").strip()]
    if missing_transcript_ids:
        raise ValidationError({"samples": "Every sample needs a transcript before preparation."})

def prepare_voice_profile(profile: VoiceProfile, *, prepared_by=None) -> VoiceProfile:
    if profile.voice_type == VoiceProfile.TYPE_PRESET:
        if not profile.preset_voice_id:
            raise ValidationError({"presetVoiceId": "Preset voice id is required for preset profiles."})
        profile.status = VoiceProfile.STATUS_READY
        profile.metadata = get_voice_profile_preparation_summary(profile, status=VoiceProfile.STATUS_READY)
        profile.save(update_fields=["status", "metadata", "update_at"])
        return profile

    profile.status = VoiceProfile.STATUS_PROCESSING
    profile.save(update_fields=["status", "update_at"])

    try:
        validate_voice_profile_samples(profile)
        profile.status = VoiceProfile.STATUS_READY
        profile.metadata = get_voice_profile_preparation_summary(profile, status=VoiceProfile.STATUS_READY)
        profile.metadata["preparedById"] = getattr(prepared_by, "id", None)
        profile.metadata["preparedAt"] = timezone.now().isoformat()
        profile.metadata["lastError"] = ""
        profile.save(update_fields=["status", "metadata", "update_at"])
        return profile
    except ValidationError:
        profile.status = VoiceProfile.STATUS_DRAFT
        profile.metadata = get_voice_profile_preparation_summary(profile, status=VoiceProfile.STATUS_DRAFT)
        profile.metadata["lastError"] = "Voice profile validation failed."
        profile.save(update_fields=["status", "metadata", "update_at"])
        raise
    except Exception as exc:
        profile.status = VoiceProfile.STATUS_FAILED
        profile.metadata = get_voice_profile_preparation_summary(profile, status=VoiceProfile.STATUS_FAILED)
        profile.metadata["lastError"] = str(exc)
        profile.save(update_fields=["status", "metadata", "update_at"])
        raise


def _get_candidate_resume_summary(session: InterviewSession) -> Dict[str, object]:
    candidate = getattr(session, "candidate", None)
    if not candidate:
        return {}

    resume = None
    try:
        from apps.profiles.models import Resume
        resume = Resume.objects.filter(user=candidate).order_by("-is_active", "-update_at").first()
        if not resume and hasattr(candidate, "job_seeker_profile"):
            resume = Resume.objects.filter(job_seeker_profile=candidate.job_seeker_profile).order_by("-is_active", "-update_at").first()
        if not resume and session.job_post_id:
            from apps.jobs.models import JobPostActivity
            activity = JobPostActivity.objects.filter(job_post=session.job_post, user=candidate).exclude(resume__isnull=True).first()
            if activity:
                resume = activity.resume
    except Exception as e:
        logger.warning("Error fetching candidate resume for session %s: %s", getattr(session, "id", None), e)

    if not resume:
        return {}

    cv_title = _clean_text(getattr(resume, "title", ""))
    cv_skills = _clean_text(getattr(resume, "skills_summary", ""))

    exp_list = []
    try:
        if hasattr(resume, "experience_details"):
            for exp in resume.experience_details.all()[:3]:
                comp = getattr(exp, "company_name", "")
                role = getattr(exp, "job_name", "")
                desc = _clean_text(getattr(exp, "description", ""))
                item = f"{role} tại {comp}".strip()
                if desc:
                    item += f": {_truncate_text(desc, 120)}"
                exp_list.append(item)
    except Exception:
        pass

    cv_experience = "; ".join(exp_list) if exp_list else _truncate_text(_clean_text(getattr(resume, "description", "")), 300)

    edu_list = []
    try:
        if hasattr(resume, "education_details"):
            for edu in resume.education_details.all()[:2]:
                school = getattr(edu, "training_place_name", "")
                grade = getattr(edu, "grade_or_rank", "") or ""
                desc = _clean_text(getattr(edu, "description", ""))
                edu_item = f"{school} {grade} {desc}".strip()
                if edu_item:
                    edu_list.append(edu_item)
    except Exception:
        pass
    cv_education = "; ".join(edu_list)

    semantic_data = {}
    if session.job_post:
        try:
            from apps.profiles.services.semantic_matching import evaluate_cv_jd_semantic_match
            semantic_data = evaluate_cv_jd_semantic_match(resume=resume, job_post=session.job_post)
        except Exception as exc:
            logger.warning("Error evaluating semantic match in context: %s", exc)

    return {
        "candidateCvTitle": cv_title or None,
        "candidateCvSkills": cv_skills or None,
        "candidateCvExperience": cv_experience or None,
        "candidateCvEducation": cv_education or None,
        "candidateFitLevel": semantic_data.get("fit_level") or None,
        "candidateSemanticScore": semantic_data.get("semantic_score"),
        "candidateMatchedSkills": semantic_data.get("matched_skills") or [],
        "candidateMissingSkills": semantic_data.get("missing_skills") or [],
        "candidateAiRecommendation": semantic_data.get("ai_recommendation") or None,
    }


def build_interview_context(session: InterviewSession) -> Dict[str, object]:
    questions = list(get_session_questions(session).order_by("sort_order", "create_at", "id"))
    template = getattr(getattr(session, "job_post", None), "interview_template", None)
    question_group = session.question_group or template
    job_description = _truncate_text(_clean_text(getattr(session.job_post, "job_description", "")), 1200)
    job_requirement = _truncate_text(_clean_text(getattr(session.job_post, "job_requirement", "")), 900)
    question_group_description = _truncate_text(_clean_text(getattr(question_group, "description", "")), 900)
    notes = _truncate_text(_clean_text(session.notes), 500)
    session_meta = session.session_metadata if isinstance(session.session_metadata, dict) else {}

    company = (
        getattr(session, "company", None)
        or getattr(getattr(session, "job_post", None), "company", None)
        or getattr(getattr(session, "interview_script", None), "company", None)
    )
    ai_settings = {}
    if company and hasattr(company, "get_ai_settings"):
        try:
            ai_settings = company.get_ai_settings() or {}
        except Exception:
            ai_settings = {}

    avatar_image_url = (
        session_meta.get("avatar_image_url")
        or session_meta.get("avatarImageUrl")
        or ai_settings.get("custom_avatar_url")
    )
    avatar_backdrop = (
        session_meta.get("avatar_backdrop")
        or session_meta.get("avatarBackdrop")
        or ai_settings.get("selected_background_id")
        or "modern_office"
    )
    avatar_background_url = (
        session_meta.get("avatar_background_url")
        or session_meta.get("avatarBackgroundUrl")
        or ai_settings.get("custom_background_url")
    )
    interviewer_name = (
        session_meta.get("interviewer_name")
        or session_meta.get("interviewerName")
        or ai_settings.get("interviewer_name")
        or "Trợ lý AI Ly"
    )
    custom_speed = (
        session_meta.get("ai_speed")
        or session_meta.get("ttsSpeed")
        or session_meta.get("tts_speed")
        or ai_settings.get("tts_speed")
    )
    custom_voice = (
        session_meta.get("ai_voice")
        or session_meta.get("ttsVoice")
        or session_meta.get("tts_voice")
        or ai_settings.get("tts_voice")
    )
    voice_aliases = {
        "vi-VN-Standard-A": "Trúc Ly",
        "vi-VN-Standard-B": "Mạnh Dũng",
        "vi-VN-Standard-C": "Thùy Dung",
        "vi-VN-Standard-D": "Quang Sơn",
        "Nam Minh": "Mạnh Dũng",
        "Mai Phương": "Thùy Dung",
        "Quang Dũng": "Quang Sơn",
        "Minh Quang": "Minh Triết",
    }
    if custom_voice and custom_voice in voice_aliases:
        custom_voice = voice_aliases[custom_voice]

    speed_value = get_tts_speed()
    if custom_speed is not None:
        try:
            speed_value = float(custom_speed)
        except (ValueError, TypeError):
            pass

    candidate = getattr(session, "candidate", None)
    candidate_id = getattr(session, "candidate_id", None) or getattr(candidate, "id", None) or "anonymous"
    candidate_name = (
        getattr(candidate, "full_name", None)
        or getattr(candidate, "email", None)
        or getattr(candidate, "phone_number", None)
        or getattr(candidate, "phone", None)
        or getattr(candidate, "username", None)
        or f"candidate-{candidate_id}"
    )
    candidate_email = getattr(candidate, "email", None) or ""
    company_name = getattr(company, "company_name", None) if company else None

    payload = {
        "participantIdentity": f"candidate-{candidate_id}",
        "candidateName": str(candidate_name).strip() or f"candidate-{candidate_id}",
        "candidateEmail": candidate_email,
        "companyName": company_name,
        "company_name": company_name,
        "jobTitle": session.job_post.job_name if session.job_post else None,
        "jobDescription": job_description or None,
        "jobRequirement": job_requirement or None,
        "questionGroupName": question_group.name if question_group else None,
        "questionGroupDescription": question_group_description or None,
        "interviewNotes": notes or None,
        "interviewSubject": _build_interview_subject(
            session,
            job_description,
            question_group_description,
        ),
        "questionCount": len(questions),
        "questions": [
            {
                "text": q.text,
                "category": q.category,
                "difficulty": q.difficulty,
            }
            for q in questions
        ],
        "interviewType": session.type,
        "interviewLanguage": getattr(session, "interview_language", "vi") or "vi",
        "ttsSpeed": speed_value,
        "tts_speed": speed_value,
        "interviewQuestionGapSeconds": get_interview_question_gap_seconds(),
        "interviewMinimumSilenceSeconds": get_interview_minimum_silence_seconds(),
        "avatarImageUrl": avatar_image_url,
        "avatar_image_url": avatar_image_url,
        "avatarBackdrop": avatar_backdrop,
        "avatar_backdrop": avatar_backdrop,
        "avatarBackgroundUrl": avatar_background_url,
        "avatar_background_url": avatar_background_url,
        "interviewerName": interviewer_name,
        "interviewer_name": interviewer_name,
        "status": session.status,
        "questionCursor": getattr(session, "question_cursor", 0),
        "hasTranscripts": session.transcripts.exists() if hasattr(session, "transcripts") else False,
    }
    payload.update(_get_candidate_resume_summary(session))
    voice_profile_payload = (
        build_tts_voice_profile_payload(getattr(session, "voice_profile", None))
        if getattr(session, "voice_profile", None)
        else None
    )
    if voice_profile_payload:
        payload["ttsVoice"] = f"profile:{voice_profile_payload['id']}"
        payload["tts_voice"] = payload["ttsVoice"]
        payload["ttsVoiceProfile"] = voice_profile_payload
    elif custom_voice:
        payload["ttsVoice"] = custom_voice
        payload["tts_voice"] = custom_voice

    script = getattr(session, "interview_script", None) or getattr(getattr(session, "job_post", None), "interview_script", None)
    if script:
        payload.update({
            "script_id": script.id,
            "script_name": script.name,
            "scenario_type": script.scenario_type,
            "hr_persona": script.hr_persona,
            "system_prompt": script.system_prompt,
            "greeting_message": script.greeting_message,
            "closing_message": script.closing_message,
            "time_limit_per_question": script.time_limit_per_question,
            "allow_ai_followup": script.allow_ai_followup,
            "max_followup_questions": script.max_followup_questions,
            "scriptId": script.id,
            "scriptName": script.name,
            "scenarioType": script.scenario_type,
            "hrPersona": script.hr_persona,
            "systemPrompt": script.system_prompt,
            "greetingMessage": script.greeting_message,
            "closingMessage": script.closing_message,
            "timeLimitPerQuestion": script.time_limit_per_question,
            "allowAiFollowup": script.allow_ai_followup,
            "maxFollowupQuestions": script.max_followup_questions,
            "characterId": script.character_id,
            "voiceName": script.voice_name,
            "evaluationRubric": script.evaluation_rubric,
        })
        if not payload.get("ttsVoice") and script.voice_name:
            payload["ttsVoice"] = script.voice_name
            payload["tts_voice"] = script.voice_name
        if not custom_speed and script.voice_speed:
            payload["ttsSpeed"] = float(script.voice_speed)
            payload["tts_speed"] = float(script.voice_speed)
    else:
        sys_prompt = session_meta.get("system_prompt") or session_meta.get("systemPrompt") or ""
        greet_msg = session_meta.get("greeting_message") or session_meta.get("greetingMessage") or ""
        close_msg = session_meta.get("closing_message") or session_meta.get("closingMessage") or ""
        allow_followup = session_meta.get("allow_ai_followup")
        if allow_followup is None:
            allow_followup = session_meta.get("allowAiFollowup", True)
        max_followup = session_meta.get("max_followup_questions")
        if max_followup is None:
            max_followup = session_meta.get("maxFollowupQuestions", 2)

        payload.update({
            "system_prompt": sys_prompt,
            "systemPrompt": sys_prompt,
            "greeting_message": greet_msg,
            "greetingMessage": greet_msg,
            "closing_message": close_msg,
            "closingMessage": close_msg,
            "allow_ai_followup": allow_followup,
            "allowAiFollowup": allow_followup,
            "max_followup_questions": max_followup,
            "maxFollowupQuestions": max_followup,
        })

    return payload


def _build_public_livekit_url(request) -> str:
    explicit = getattr(settings, "LIVEKIT_PUBLIC_URL", "") or ""
    if explicit:
        return explicit.rstrip("/")

    # Fallback: construct from request host (standard Nginx proxy /livekit -> LiveKit)
    host = request.get_host()
    scheme = "https" if request.is_secure() else "http"
    return f"{scheme}://{host}/livekit"


def create_livekit_participant_token(session: InterviewSession, request) -> Dict[str, str]:
    # Security: only allow when the session is joinable.
    # Cho phép mock session (luyện tập phỏng vấn) tự động reset về scheduled khi ứng viên vào lại phòng
    if session.session_type == InterviewSession.SESSION_TYPE_MOCK and (session.status or "").lower() in {"completed", "cancelled"}:
        session.status = "scheduled"
        session.save(update_fields=["status"])

    allowed_statuses = ("scheduled", "calibration", "in_progress", "interrupted")
    if (session.status or "").lower() not in allowed_statuses:
        raise SessionNotJoinableError(
            f"Khong the tham gia buoi phong van nay vi trang thai hien tai la: {session.get_status_display()}"
        )

    candidate = getattr(session, "candidate", None)
    candidate_id = getattr(session, "candidate_id", None) or getattr(candidate, "id", None) or "anonymous"
    participant_identity = f"candidate-{candidate_id}"
    participant_name = (
        getattr(candidate, "full_name", None)
        or getattr(candidate, "email", None)
        or getattr(candidate, "phone_number", None)
        or getattr(candidate, "phone", None)
        or getattr(candidate, "username", None)
        or participant_identity
    )
    participant_name = str(participant_name).strip() or participant_identity

    # Reset question_cursor if session is in scheduled/calibration or is mock so entering doesn't start at the end
    if session.status in ("scheduled", "calibration") or getattr(session, "session_type", None) == "mock":
        if (session.question_cursor or 0) > 0 and getattr(session, "pk", None):
            session.question_cursor = 0
            session.save(update_fields=["question_cursor", "update_at"])

    LiveKitService.ensure_room_with_agent(session.room_name)
    token = LiveKitService.create_token(
        room_name=session.room_name,
        participant_identity=participant_identity,
        participant_name=participant_name,
        is_agent=False,
    )
    server_url = _build_public_livekit_url(request)
    return {
        "token": token,
        "room_name": session.room_name,
        "participant_identity": participant_identity,
        "server_url": server_url,
    }


def broadcast_interview_event(session_id: int, event_type: str, data: dict) -> None:
    """Publish an event to Redis Pub/Sub for SSE streaming to employer."""
    try:
        import redis as _redis

        r = _redis.Redis(
            host=settings.SERVICE_REDIS_HOST,
            port=settings.SERVICE_REDIS_PORT,
            password=settings.SERVICE_REDIS_PASSWORD or None,
            db=settings.SERVICE_REDIS_DB,
            decode_responses=True,
            socket_connect_timeout=3,
        )
        channel = f"interview:{session_id}:events"
        payload = {"_event_type": event_type, **data}
        r.publish(channel, json.dumps(payload, ensure_ascii=False, default=str))
        r.close()
    except Exception as exc:
        logger.warning("broadcast_interview_event failed: %s", exc)


def update_interview_status(
    session: InterviewSession,
    new_status: str,
    *,
    max_duration_seconds: Optional[int] = None,
) -> str:
    new_status = str(new_status).lower()
    if (session.status or "").lower() == new_status:
        return session.status

    old_status = session.status
    was_started = session.start_time is not None
    with transaction.atomic():
        fresh_session = InterviewSession.objects.select_for_update().get(id=session.id)
        if (fresh_session.status or "").lower() == new_status:
            return fresh_session.status
        session.status = fresh_session.status
        session.start_time = fresh_session.start_time
        session.end_time = fresh_session.end_time
        session.duration = fresh_session.duration

        apply_status_transition(session, new_status)

    run_status_side_effects(
        session,
        new_status,
        was_started=was_started,
        max_duration_seconds=max_duration_seconds,
    )
    # Broadcast status change to SSE subscribers after transaction commits successfully
    broadcast_interview_event(
        session.id,
        "status_changed",
        {
            "sessionId": session.id,
            "oldStatus": old_status,
            "newStatus": new_status,
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        },
    )
    return new_status


def apply_status_transition(session: InterviewSession, new_status: str) -> None:
    if session.status == "draft" and new_status == "in_progress":
        # Keep compatibility with existing flows/tests that start directly.
        session.status = "scheduled"
        session.save(update_fields=["status", "update_at"])

    session.status = new_status

    if new_status == "in_progress" and not session.start_time:
        session.start_time = timezone.now()
    elif new_status == "completed" and not session.end_time:
        session.end_time = timezone.now()
        if session.start_time:
            session.duration = int((session.end_time - session.start_time).total_seconds())

    session.save()


def run_status_side_effects(
    session: InterviewSession,
    new_status: str,
    *,
    was_started: bool,
    max_duration_seconds: Optional[int] = None,
) -> None:
    if new_status == "completed":
        queue_ai_evaluation(session)

    is_persistent = bool((session.session_metadata or {}).get("persistent"))

    if new_status == "in_progress" and not was_started and not is_persistent:
        from .tasks import end_interview_session, start_room_recording_task

        timeout = int(max_duration_seconds or getattr(settings, "INTERVIEW_MAX_DURATION_SECONDS", 1800))
        end_interview_session.apply_async(args=[session.id, "max_duration"], countdown=timeout)
        try:
            start_room_recording_task.apply_async(args=[session.room_name])
        except Exception as exc:
            logger.warning("Failed to dispatch start_room_recording_task: %s", exc)

    if new_status == "interrupted" and not is_persistent:
        from .tasks import finalize_disconnected_session

        grace_seconds = int(getattr(settings, "INTERVIEW_DISCONNECT_GRACE_SECONDS", 300))
        finalize_disconnected_session.apply_async(args=[session.id], countdown=grace_seconds)


def append_transcript(session: InterviewSession, payload: Dict[str, object]) -> InterviewTranscript:
    content = _sanitize_transcript_text(payload.get("content") if isinstance(payload, dict) else None)
    transcript = InterviewTranscript.objects.create(
        interview=session,
        speaker_role=str(payload.get("speaker_role", "")),
        content=content,
        speech_duration_ms=payload.get("speech_duration_ms"),
    )
    # Broadcast new transcript to SSE subscribers
    broadcast_interview_event(
        session.id,
        "transcript_added",
        {
            "sessionId": session.id,
            "transcript": {
                "id": transcript.id,
                "speakerRole": transcript.speaker_role,
                "content": transcript.content,
                "speechDurationMs": transcript.speech_duration_ms,
                "createAt": transcript.create_at.isoformat() if transcript.create_at else None,
            },
        },
    )
    return transcript


def get_next_question_payload(session: InterviewSession, cursor: Optional[int] = None) -> Dict[str, object]:
    questions = get_session_questions(session).order_by("sort_order", "create_at", "id")
    total = questions.count()
    current_cursor = session.question_cursor if cursor is None else cursor
    current_cursor = current_cursor or 0

    if current_cursor >= total:
        return {
            "done": True,
            "question": None,
            "index": current_cursor,
            "total": total,
        }

    question = questions[current_cursor]

    return {
        "done": False,
        "question": {"id": question.id, "text": question.text},
        "index": current_cursor,
        "total": total,
    }


def advance_question_cursor(session: InterviewSession) -> int:
    session.question_cursor = (session.question_cursor or 0) + 1
    session.save(update_fields=["question_cursor", "update_at"])
    return session.question_cursor


def queue_invitation_email(session_id: int) -> None:
    from .tasks import send_interview_invitation

    send_interview_invitation.delay(session_id)


def queue_ai_evaluation(session: InterviewSession) -> None:
    from .tasks import evaluate_interview_session

    old_status = session.status
    session.status = "processing"
    session.save(update_fields=["status", "update_at"])

    broadcast_interview_event(
        session.id,
        "status_changed",
        {
            "sessionId": session.id,
            "oldStatus": old_status,
            "newStatus": "processing",
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "duration": session.duration,
        },
    )

    evaluate_interview_session.delay(session.id)


def create_observer_livekit_token(session: InterviewSession, request) -> Dict[str, str]:
    """Create a hidden LiveKit token for employer to observe interview silently."""
    allowed_statuses = ("scheduled", "calibration", "in_progress", "interrupted")
    if (session.status or "").lower() not in allowed_statuses:
        raise SessionNotJoinableError(
            f"Khong the quan sat buoi phong van nay vi trang thai hien tai la: {session.get_status_display()}"
        )

    user = getattr(request, "user", None)
    user_id = getattr(user, "id", None) or "anonymous"
    observer_identity = f"observer-{user_id}"
    observer_name = (
        getattr(user, "full_name", None)
        or getattr(user, "email", None)
        or getattr(user, "phone_number", None)
        or getattr(user, "phone", None)
        or getattr(user, "username", None)
        or observer_identity
    )
    observer_display = f"[Observer] {str(observer_name).strip() or observer_identity}"

    token = LiveKitService.create_observer_token(
        room_name=session.room_name,
        observer_identity=observer_identity,
        observer_name=observer_display,
    )

    server_url = _build_public_livekit_url(request)

    return {
        "token": token,
        "room_name": session.room_name,
        "participant_identity": observer_identity,
        "server_url": server_url,
        "mode": "observer",
    }


def create_hr_presence_livekit_token(session: InterviewSession, request) -> Dict[str, object]:
    """
    Tạo token cho HR tham gia hiện diện — ứng viên thấy HR trong phòng.

    - identity = employer-{user.id}  → AIInterviewLayout nhận diện badge "Nhà tuyển dụng"
    - hidden = False                 → ứng viên thấy participant này
    - can_publish = False            → HR không publish audio/video (không làm rối AI)
    - can_publish_data = True        → HR gửi được chat message
    - can_subscribe = True           → HR nghe/xem được toàn bộ phòng
    """
    allowed_statuses = ("scheduled", "calibration", "in_progress", "interrupted")
    if (session.status or "").lower() not in allowed_statuses:
        raise SessionNotJoinableError(
            f"Khong the tham gia buoi phong van nay vi trang thai hien tai la: {session.get_status_display()}"
        )

    user = getattr(request, "user", None)
    user_id = getattr(user, "id", None) or "anonymous"
    hr_identity = f"employer-{user_id}"
    hr_name = (
        getattr(user, "full_name", None)
        or getattr(user, "email", None)
        or getattr(user, "phone_number", None)
        or getattr(user, "phone", None)
        or getattr(user, "username", None)
        or hr_identity
    )
    hr_name = str(hr_name).strip() or hr_identity
    company = getattr(user, "active_company", None)
    company_name = getattr(company, "company_name", None) if company else None
    if not company_name and session.job_post and getattr(session.job_post, "company", None):
        company_name = getattr(session.job_post.company, "company_name", None)

    token = LiveKitService.create_hr_presence_token(
        room_name=session.room_name,
        hr_identity=hr_identity,
        hr_name=hr_name,
        company_name=company_name,
    )

    server_url = _build_public_livekit_url(request)

    return {
        "token": token,
        "room_name": session.room_name,
        "participant_identity": hr_identity,
        "participant_name": hr_name,
        "company_name": company_name,
        "server_url": server_url,
        "mode": "hr_presence",
    }


def sync_salary_benchmarks_from_jobs() -> int:
    """
    Đồng bộ dữ liệu bảng project_interview_salary_benchmark từ các tin tuyển dụng (JobPost)
    thực tế đang hoạt động trên hệ thống InfoHR.
    Tuyệt đối không sử dụng dữ liệu ảo, bám sát các tin đã được duyệt và có thông tin mức lương.
    """
    from apps.jobs.models import JobPost
    from apps.interviews.models import SalaryBenchmark
    from apps.common.models import Career
    from shared.configs.variable_system import JobPostStatus

    approved_jobs = JobPost.objects.filter(
        status=JobPostStatus.APPROVED,
        salary_min__gt=0
    ).select_related('career')

    if not approved_jobs.exists():
        return 0

    careers = list(Career.objects.all())
    career_by_name = {c.name.lower(): c for c in careers}

    groups: Dict[tuple, Dict[str, object]] = {}
    for job in approved_jobs:
        raw_title = (job.job_name or "").strip()
        # Loại bỏ các tiền tố/hậu tố thông báo như [TUYỂN GẤP], [HOT], (Tuyển gấp)
        cleaned_title = re.sub(r'\[.*?\]|\(.*?(gấp|hot|tuyển).*?\)', '', raw_title, flags=re.IGNORECASE).strip()
        cleaned_title = cleaned_title or raw_title

        career = job.career
        if not career:
            lower_title = cleaned_title.lower()
            if 'nội thất' in lower_title:
                career = career_by_name.get('nội thất') or career_by_name.get('thiết kế nội thất')
            elif 'xây dựng' in lower_title or 'công trình' in lower_title or 'hiện trường' in lower_title:
                career = career_by_name.get('xây dựng') or career_by_name.get('xây dựng - kiến trúc')
            elif 'kiến trúc' in lower_title:
                career = career_by_name.get('kiến trúc') or career_by_name.get('xây dựng - kiến trúc')
            elif 'bất động sản' in lower_title or 'tư vấn khách hàng' in lower_title or 'kinh doanh' in lower_title:
                career = career_by_name.get('bất động sản') or career_by_name.get('kinh doanh - bán hàng')
            if career:
                JobPost.objects.filter(id=job.id).update(career=career)

        # Map kinh nghiệm / cấp bậc
        pos = getattr(job, 'position', 5)
        exp = getattr(job, 'experience', 3)
        if pos in [1, 2, 3]:
            experience_level = 'lead'
        elif exp in [1, 2]:
            experience_level = 'entry'
        elif exp in [3, 4]:
            experience_level = 'junior'
        elif exp in [5, 6]:
            experience_level = 'mid'
        elif exp >= 7:
            experience_level = 'senior'
        else:
            experience_level = 'mid'

        career_id = career.id if career else None
        key = (cleaned_title, career_id, experience_level)
        if key not in groups:
            groups[key] = {
                'title': cleaned_title,
                'career': career,
                'experience_level': experience_level,
                'jobs': []
            }
        groups[key]['jobs'].append(job)

    current_ids = set()
    for (title, career_id, exp_level), g_data in groups.items():
        job_list = g_data['jobs']
        mins = [j.salary_min for j in job_list if j.salary_min and j.salary_min > 0]
        maxs = [j.salary_max for j in job_list if j.salary_max and j.salary_max > 0]
        if not mins or not maxs:
            continue

        sal_min = min(mins)
        sal_max = max(maxs)
        sal_avg = int(sum((j.salary_min + j.salary_max) / 2 for j in job_list) / len(job_list))
        sample_count = len(job_list)
        is_hot = any(getattr(j, 'is_hot', False) or getattr(j, 'is_urgent', False) for j in job_list)

        sb, _ = SalaryBenchmark.objects.update_or_create(
            position_title=title,
            career=g_data['career'],
            experience_level=exp_level,
            year=2026,
            defaults={
                'salary_min': sal_min,
                'salary_max': sal_max,
                'salary_avg': sal_avg,
                'sample_count': sample_count,
                'is_hot': is_hot,
            }
        )
        current_ids.add(sb.id)

    # Loại bỏ các bản ghi salary benchmark ảo không thuộc tin tuyển dụng hiện có
    SalaryBenchmark.objects.exclude(id__in=current_ids).delete()
    return len(current_ids)

