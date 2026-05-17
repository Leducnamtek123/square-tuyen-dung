"""
Interview Module — DRF Serializers
"""

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewTranscript, InterviewEvaluation,
    VoiceProfile, VoiceProfileSample, VoiceProfileGrant
)
from apps.jobs.models import JobPost
from common import serializers as common_serializers

class QuestionSerializer(serializers.ModelSerializer):
    questionText = serializers.CharField(source="text", read_only=True)
    careerDict = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'text', 'questionText', 'difficulty',
            'career', 'careerDict', 'sort_order', 'author', 'company', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'author', 'company', 'create_at', 'update_at']

    def get_careerDict(self, obj):
        try:
            career = obj.career
        except ObjectDoesNotExist:
            return None
        except Exception:
            return None

        if not career:
            return None
        return common_serializers.CareerSerializer(career).data

class QuestionGroupSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    evaluation_rubric = serializers.SerializerMethodField()
    evaluation_rubric_input = serializers.JSONField(
        write_only=True, required=False, allow_null=True
    )
    question_ids = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(),
        many=True, write_only=True, required=False, source='questions'
    )

    class Meta:
        model = QuestionGroup
        fields = [
            'id', 'name', 'description', 'evaluation_rubric', 'questions', 'questions_count',
            'evaluation_rubric_input', 'question_ids', 'author', 'company', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'author', 'company', 'create_at', 'update_at']

    def get_evaluation_rubric(self, obj):
        return getattr(obj, "evaluation_rubric", None)

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_questions(self, obj):
        items = []
        for question in obj.questions.all():
            try:
                items.append(QuestionSerializer(question, context=self.context).data)
            except Exception:
                continue
        return items

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, "copy") else dict(data)
        if "evaluation_rubric" in payload and "evaluation_rubric_input" not in payload:
            payload["evaluation_rubric_input"] = payload.get("evaluation_rubric")
        return super().to_internal_value(payload)

    def create(self, validated_data):
        rubric = validated_data.pop("evaluation_rubric_input", serializers.empty)
        instance = super().create(validated_data)
        if rubric is not serializers.empty and hasattr(instance, "evaluation_rubric"):
            instance.evaluation_rubric = rubric
            instance.save(update_fields=["evaluation_rubric", "update_at"])
        return instance

    def update(self, instance, validated_data):
        rubric = validated_data.pop("evaluation_rubric_input", serializers.empty)
        instance = super().update(instance, validated_data)
        if rubric is not serializers.empty and hasattr(instance, "evaluation_rubric"):
            instance.evaluation_rubric = rubric
            instance.save(update_fields=["evaluation_rubric", "update_at"])
        return instance


class VoiceProfileSampleSerializer(serializers.ModelSerializer):
    audioUrl = serializers.SerializerMethodField()
    referenceText = serializers.CharField(source="reference_text", read_only=True)
    originalFilename = serializers.CharField(source="original_filename", read_only=True)
    durationSeconds = serializers.DecimalField(source="duration_seconds", max_digits=8, decimal_places=2, read_only=True)
    sortOrder = serializers.IntegerField(source="sort_order", read_only=True)

    class Meta:
        model = VoiceProfileSample
        fields = [
            "id", "profile", "reference_text", "referenceText",
            "audio_file", "audioUrl", "original_filename", "originalFilename",
            "duration_seconds", "durationSeconds", "sort_order", "sortOrder",
            "create_at", "update_at",
        ]
        read_only_fields = [
            "id", "profile", "audio_file", "audioUrl", "original_filename",
            "duration_seconds", "sort_order", "create_at", "update_at",
        ]

    def get_audioUrl(self, obj):
        try:
            return obj.audio_file.get_full_url() if obj.audio_file else None
        except Exception:
            return None


class VoiceProfileGrantSerializer(serializers.ModelSerializer):
    profileName = serializers.CharField(source="profile.name", read_only=True)
    companyName = serializers.CharField(source="company.company_name", read_only=True)
    jobName = serializers.CharField(source="job_post.job_name", read_only=True)
    jobPost = serializers.PrimaryKeyRelatedField(
        source="job_post",
        queryset=JobPost.objects.all(),
        required=False,
        allow_null=True,
    )
    isDefault = serializers.BooleanField(source="is_default", required=False)
    isActive = serializers.BooleanField(source="is_active", required=False)
    grantedBy = serializers.IntegerField(source="granted_by_id", read_only=True)

    class Meta:
        model = VoiceProfileGrant
        fields = [
            "id", "profile", "profileName", "company", "companyName",
            "job_post", "jobPost", "jobName", "is_default", "isDefault",
            "is_active", "isActive", "note", "granted_by", "grantedBy",
            "create_at", "update_at",
        ]
        read_only_fields = ["id", "profileName", "companyName", "jobName", "granted_by", "grantedBy", "create_at", "update_at"]

    def validate(self, attrs):
        company = attrs.get("company", getattr(self.instance, "company", None))
        job_post = attrs.get("job_post", getattr(self.instance, "job_post", None))

        if not company and not job_post:
            raise serializers.ValidationError({"target": "Grant requires a company or job post."})
        if job_post and not company:
            attrs["company"] = job_post.company
        return attrs


class VoiceProfileSerializer(serializers.ModelSerializer):
    voiceType = serializers.CharField(source="voice_type", required=False)
    presetEngine = serializers.CharField(source="preset_engine", required=False, allow_blank=True)
    presetVoiceId = serializers.CharField(source="preset_voice_id", required=False, allow_blank=True)
    consentConfirmed = serializers.BooleanField(source="consent_confirmed", required=False)
    samples = VoiceProfileSampleSerializer(many=True, read_only=True)
    grants = serializers.SerializerMethodField()
    sampleCount = serializers.SerializerMethodField()
    grantCount = serializers.SerializerMethodField()
    createdBy = serializers.IntegerField(source="created_by_id", read_only=True)

    class Meta:
        model = VoiceProfile
        fields = [
            "id", "name", "description", "language", "voice_type", "voiceType",
            "status", "preset_engine", "presetEngine", "preset_voice_id",
            "presetVoiceId", "consent_confirmed", "consentConfirmed",
            "metadata", "samples", "grants", "sampleCount", "grantCount",
            "created_by", "createdBy", "create_at", "update_at",
        ]
        read_only_fields = ["id", "samples", "grants", "sampleCount", "grantCount", "created_by", "createdBy", "create_at", "update_at"]

    def get_sampleCount(self, obj):
        try:
            return obj.samples.count()
        except Exception:
            return 0

    def _visible_grants_queryset(self, obj):
        qs = obj.grants.select_related("company", "job_post", "profile")
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return qs.none()

        role = str(getattr(user, "role_name", "") or "").upper()
        if role == "ADMIN" or getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return qs

        try:
            company = user.get_active_company()
        except Exception:
            company = None
        if not company:
            return qs.none()

        return qs.filter(is_active=True).filter(
            Q(company=company, job_post__isnull=True) | Q(job_post__company=company)
        )

    def get_grants(self, obj):
        try:
            qs = self._visible_grants_queryset(obj)
            return VoiceProfileGrantSerializer(qs, many=True, context=self.context).data
        except Exception:
            return []

    def get_grantCount(self, obj):
        try:
            return self._visible_grants_queryset(obj).filter(is_active=True).count()
        except Exception:
            return 0

    def validate(self, attrs):
        voice_type = attrs.get("voice_type", getattr(self.instance, "voice_type", VoiceProfile.TYPE_CLONED))
        preset_voice_id = attrs.get("preset_voice_id", getattr(self.instance, "preset_voice_id", ""))
        consent_confirmed = attrs.get("consent_confirmed", getattr(self.instance, "consent_confirmed", False))

        if voice_type == VoiceProfile.TYPE_PRESET and not preset_voice_id:
            raise serializers.ValidationError({"presetVoiceId": "Preset voice id is required for preset profiles."})
        if voice_type == VoiceProfile.TYPE_CLONED and not consent_confirmed:
            raise serializers.ValidationError({"consentConfirmed": "Consent confirmation is required for cloned voices."})
        return attrs

class InterviewTranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewTranscript
        fields = ['id', 'interview', 'speaker_role', 'content', 'speech_duration_ms', 'create_at']
        read_only_fields = ['id', 'create_at']

class InterviewEvaluationSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.full_name', read_only=True)

    class Meta:
        model = InterviewEvaluation
        fields = [
            'id', 'interview', 'evaluator', 'evaluator_name',
            'attitude_score', 'professional_score', 'overall_score',
            'result', 'comments', 'proposed_salary',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'evaluator', 'create_at', 'update_at']

    def validate(self, attrs):
        attitude = attrs.get("attitude_score")
        professional = attrs.get("professional_score")

        if attitude is not None and professional is not None:
            attrs["overall_score"] = (attitude + professional) / 2
        return attrs

class InterviewSessionListSerializer(serializers.ModelSerializer):
    """Serializer for list endpoint."""
    candidate = serializers.SerializerMethodField()
    job_post = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    job_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    voice_profile = serializers.SerializerMethodField()
    voice_profile_name = serializers.SerializerMethodField()
    evaluations_count = serializers.SerializerMethodField()

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'room_name', 'invite_token', 'status', 'type',
            'candidate', 'candidate_name', 'candidate_email',
            'job_post', 'job_name', 'company_name',
            'voice_profile', 'voice_profile_name',
            'scheduled_at', 'start_time', 'end_time', 'duration',
            'ai_overall_score', 'evaluations_count',
            'recording_url',
            'create_at', 'update_at'
        ]

    def get_candidate_name(self, obj):
        try:
            return obj.candidate.full_name if obj.candidate else None
        except Exception:
            return None

    def get_candidate(self, obj):
        try:
            return obj.candidate_id
        except Exception:
            return None

    def get_candidate_email(self, obj):
        try:
            return obj.candidate.email if obj.candidate else None
        except Exception:
            return None

    def get_job_post(self, obj):
        try:
            return obj.job_post_id
        except Exception:
            return None

    def get_job_name(self, obj):
        try:
            return obj.job_post.job_name if obj.job_post else None
        except Exception:
            return None

    def get_company_name(self, obj):
        try:
            if obj.job_post and obj.job_post.company:
                return obj.job_post.company.company_name
        except Exception:
            pass

        try:
            if obj.question_group and obj.question_group.company:
                return obj.question_group.company.company_name
        except Exception:
            pass

        return None

    def get_voice_profile(self, obj):
        try:
            return obj.voice_profile_id
        except Exception:
            return None

    def get_voice_profile_name(self, obj):
        try:
            return obj.voice_profile.name if obj.voice_profile else None
        except Exception:
            return None

    def get_evaluations_count(self, obj):
        try:
            return obj.evaluations.count()
        except Exception:
            return 0


class InterviewSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer for detail endpoint."""
    candidate = serializers.SerializerMethodField()
    job_post = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    question_group = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    job_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    voice_profile = serializers.PrimaryKeyRelatedField(
        queryset=VoiceProfile.objects.all(),
        required=False,
        allow_null=True,
    )
    voice_profile_name = serializers.SerializerMethodField()
    questions = QuestionSerializer(many=True, read_only=True)
    transcripts = InterviewTranscriptSerializer(many=True, read_only=True)
    evaluations = InterviewEvaluationSerializer(many=True, read_only=True)

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'room_name', 'invite_token', 'status', 'type',
            'candidate', 'candidate_name', 'candidate_email',
            'job_post', 'job_name', 'company_name',
            'voice_profile', 'voice_profile_name',
            'scheduled_at', 'start_time', 'end_time', 'duration',
            'recording_url', 'transcript_url', 'notes',
            'ai_overall_score', 'ai_technical_score', 'ai_communication_score',
            'ai_summary', 'ai_strengths', 'ai_weaknesses', 'ai_detailed_feedback',
            'created_by', 'question_group',
            'questions', 'transcripts', 'evaluations',
            'create_at', 'update_at'
        ]
        read_only_fields = [
            'id', 'room_name', 'invite_token',
            'created_by', 'create_at', 'update_at'
        ]

    def get_candidate_name(self, obj):
        try:
            return obj.candidate.full_name if obj.candidate else None
        except Exception:
            return None

    def get_candidate(self, obj):
        try:
            return obj.candidate_id
        except Exception:
            return None

    def get_candidate_email(self, obj):
        try:
            return obj.candidate.email if obj.candidate else None
        except Exception:
            return None

    def get_job_post(self, obj):
        try:
            return obj.job_post_id
        except Exception:
            return None

    def get_created_by(self, obj):
        try:
            return obj.created_by_id
        except Exception:
            return None

    def get_question_group(self, obj):
        try:
            return obj.question_group_id
        except Exception:
            return None

    def get_voice_profile_name(self, obj):
        try:
            return obj.voice_profile.name if obj.voice_profile else None
        except Exception:
            return None

    def get_job_name(self, obj):
        try:
            return obj.job_post.job_name if obj.job_post else None
        except Exception:
            return None

    def get_company_name(self, obj):
        try:
            if obj.job_post and obj.job_post.company:
                return obj.job_post.company.company_name
        except Exception:
            pass

        try:
            if obj.question_group and obj.question_group.company:
                return obj.question_group.company.company_name
        except Exception:
            pass

        return None


class InterviewSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer tạo mới interview."""
    question_ids = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(),
        many=True, write_only=True, required=False
    )

    class Meta:
        model = InterviewSession
        fields = [
            'candidate', 'job_post', 'type',
            'scheduled_at', 'notes',
            'question_group', 'question_ids', 'voice_profile'
        ]

    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        # Set status to scheduled by default for new interviews created via this serializer
        validated_data.setdefault('status', 'scheduled')
        session = InterviewSession.objects.create(**validated_data)
        if question_ids:
            session.questions.set(question_ids)
        elif session.question_group:
            session.questions.set(session.question_group.questions.all())
        return session

class InterviewContextSerializer(serializers.Serializer):
    """Context cho AI Agent khi join room (follow SquareAI)."""
    candidateName = serializers.CharField()
    candidateEmail = serializers.CharField()
    jobTitle = serializers.CharField(allow_null=True)
    questions = serializers.ListField()
    interviewType = serializers.CharField()

class AppendTranscriptSerializer(serializers.Serializer):
    """Serializer cho agent gửi transcript."""
    speaker_role = serializers.ChoiceField(choices=['ai_agent', 'candidate'])
    content = serializers.CharField()
    speech_duration_ms = serializers.IntegerField(required=False, allow_null=True)

class UpdateStatusSerializer(serializers.Serializer):
    """Serializer cập nhật status."""
    status = serializers.ChoiceField(
        choices=['scheduled', 'calibration', 'in_progress', 'completed', 'cancelled', 'interrupted']
    )

