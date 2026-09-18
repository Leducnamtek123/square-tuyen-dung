import asyncio
import hashlib
import json
import logging
import os
import pathlib
import re
from collections.abc import Awaitable
from typing import Any

import httpx
import openai as openai_lib
from dotenv import load_dotenv
from livekit.agents import (
    AgentServer,
    AgentSession,
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    room_io,
)
from livekit.agents.job import get_job_context
from livekit.agents.llm import ChatMessage
from livekit.agents.voice.events import CloseEvent, SessionUsageUpdatedEvent
from livekit.plugins import openai, silero
from livekit.plugins.openai import tts as openai_tts

from .backend_auth import auth_event_hook
from .config import config
from .interviewer import Interviewer
from .session_settings import build_session_kwargs

load_dotenv()

# Configure logging
logger = logging.getLogger("square-ai-interviewer")
logger.setLevel(logging.INFO)

CHAT_TOPIC = "lk.chat"
AI_CONTROL_TOPIC = "square.interview.ai_control"
AI_TAKEOVER_TOPIC = "square.interview.ai_takeover"
QUESTION_CONTROL_TOPIC = "square.interview.question_control"
QUESTION_CHANGE_TOPIC = "square.interview.question_change"
EMPLOYER_CONTROL_ROLES = {"employer", "observer"}
_BACKGROUND_TASKS: set[asyncio.Task[Any]] = set()


def _create_background_task(coro: Awaitable[Any]) -> None:
    task = asyncio.create_task(coro)
    _BACKGROUND_TASKS.add(task)
    task.add_done_callback(_BACKGROUND_TASKS.discard)


# --- Helper Functions ---
async def _update_backend_status(room_name: str, status: str) -> None:
    """Update the interview status in the central backend."""
    try:
        url = f"{config.BACKEND_API_URL}/v1/interview/compat/{room_name}/status"
        async with httpx.AsyncClient(
            event_hooks={"request": [auth_event_hook()]}
        ) as client:
            await client.patch(url, json={"status": status}, timeout=5.0)
    except Exception as e:
        logger.warning(f"Failed to update backend status for {room_name}: {e}")


def _clean_tts_text(text: str) -> str:
    if not text:
        return ""
    cleaned = text.replace("\u200b", " ").replace("\ufeff", " ")
    cleaned = re.sub(r"<think>[\s\S]*?</think>", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"```[\s\S]*?```", " ", cleaned)
    return " ".join(cleaned.split()).strip()


# --- Resilient Transport for Voice Providers with Disk Cache ---
class RetryRateLimitTransport(httpx.AsyncBaseTransport):
    """
    Intelligent rate limit (429) backoff transport with local TTS audio disk cache.
    1. Checks local cache (/tmp/tts_cache/<hash>.mp3) for repeated phrases, returning instantly with 0ms latency.
    2. Automatically handles voice provider concurrency caps and 429 limits with exponential backoff & jitter.
    3. Saves successful TTS responses to disk cache so subsequent candidates hit cache immediately.
    """
    def __init__(self, transport: httpx.AsyncBaseTransport, max_retries: int = 12):
        self._transport = transport
        self._max_retries = max_retries

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        import random
        body = await request.aread()

        # Check if this is an audio synthesis request
        is_tts_request = request.method == "POST" and ("/audio/speech" in str(request.url.path))
        cache_file: str | None = None

        if is_tts_request:
            try:
                data = json.loads(body.decode("utf-8"))
                model = str(data.get("model") or "")
                voice = str(data.get("voice") or "")
                speed = round(float(data.get("speed") or 1.0), 2)
                text = _clean_tts_text(str(data.get("input") or ""))

                key_str = f"{model}:{voice}:{speed}:{text}"
                cache_key = hashlib.sha256(key_str.encode("utf-8")).hexdigest()

                cache_dir = os.getenv("TTS_CACHE_DIR", "/tmp/tts_cache")
                os.makedirs(cache_dir, exist_ok=True)
                cache_file = os.path.join(cache_dir, f"{cache_key}.mp3")

                if os.path.exists(cache_file) and os.path.getsize(cache_file) > 100:
                    cached_bytes = await asyncio.to_thread(pathlib.Path(cache_file).read_bytes)
                    logger.info("TTS Cache HIT for key %s (%d bytes): '%s...'", cache_key[:10], len(cached_bytes), text[:30])
                    return httpx.Response(
                        status_code=200,
                        headers={"content-type": "audio/mpeg", "x-cache": "HIT"},
                        content=cached_bytes,
                    )
                logger.info("TTS Cache MISS for key %s: '%s...'", cache_key[:10], text[:30])
            except Exception as parse_exc:
                logger.debug("TTS Cache inspection skipped: %s", parse_exc)

        # Retry loop for upstream calls
        headers = httpx.Headers(request.headers)
        headers["User-Agent"] = "curl/7.68.0"

        for attempt in range(self._max_retries):
            retry_req = httpx.Request(
                method=request.method,
                url=request.url,
                headers=headers,
                content=body,
            )
            resp = await self._transport.handle_async_request(retry_req)
            if resp.status_code == 429 and attempt < self._max_retries - 1:
                wait = 1.0 + random.uniform(0.3, 1.2) * min(attempt + 1, 5)
                retry_header = resp.headers.get("Retry-After")
                if retry_header:
                    try:
                        wait = max(1.0, float(retry_header))
                    except ValueError:
                        pass
                logger.warning(
                    "Voice AI Provider returned HTTP 429 (Rate Limit). Retrying attempt %d/%d after %.2fs...",
                    attempt + 1,
                    self._max_retries,
                    wait,
                )
                await resp.aclose()
                await asyncio.sleep(wait)
                continue

            if resp.status_code == 200 and cache_file:
                resp_content = await resp.aread()
                if len(resp_content) > 100:
                    try:
                        def _save_to_disk():
                            tmp_f = f"{cache_file}.tmp.{os.getpid()}"
                            pathlib.Path(tmp_f).write_bytes(resp_content)
                            os.replace(tmp_f, cache_file)
                            try:
                                os.chmod(cache_file, 0o666)
                            except Exception:
                                pass
                        await asyncio.to_thread(_save_to_disk)
                        logger.info("TTS Cache SAVED to %s (%d bytes)", cache_file, len(resp_content))
                    except Exception as save_exc:
                        logger.warning("Failed to save TTS cache: %s", save_exc)
                return httpx.Response(
                    status_code=200,
                    headers=resp.headers,
                    content=resp_content,
                )

            return resp
        return resp


# --- AgentServer Setup (1.5.x Pattern) ---
server = AgentServer(load_threshold=float(os.getenv("LIVEKIT_LOAD_THRESHOLD", "0.9")))


def prewarm(proc: JobProcess) -> None:
    """Pre-load heavy models in the main (prewarm) process to save time on job startup."""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


def _build_llm_extra_body() -> dict:
    if not config.LLM_USE_VLLM_PARAMS:
        return {}

    return {
        "top_k": config.LLM_TOP_K,
        "min_p": config.LLM_MIN_P,
        "presence_penalty": config.LLM_PRESENCE_PENALTY,
        "repetition_penalty": config.LLM_REPETITION_PENALTY,
        "chat_template_kwargs": {"enable_thinking": config.LLM_ENABLE_THINKING},
    }


def _participant_identity(value) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return str(value.get("identity") or "")
    return str(getattr(value, "identity", "") or "")


def _participant_metadata(participant) -> dict:
    metadata = getattr(participant, "metadata", None)
    if not metadata:
        return {}
    try:
        parsed = json.loads(metadata)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _participant_role(participant, identity_hint: str = "") -> str:
    identity = (getattr(participant, "identity", None) or identity_hint or "").lower()
    name = (getattr(participant, "name", None) or "").lower()
    attributes = getattr(participant, "attributes", None) or {}
    metadata = _participant_metadata(participant)

    values = [identity, name]
    values.extend(str(value).lower() for value in attributes.values() if value)
    values.extend(str(value).lower() for value in metadata.values() if value)
    haystack = " ".join(values)

    role_values = [
        str(attributes.get("role", "")).lower(),
        str(attributes.get("participant_role", "")).lower(),
        str(metadata.get("role", "")).lower(),
    ]
    for role in role_values:
        if role in {"candidate", "employer", "observer", "agent"}:
            return role

    if identity.startswith("candidate-") or "candidate" in haystack:
        return "candidate"
    if (
        identity.startswith("employer-")
        or "employer" in haystack
        or "admin" in haystack
    ):
        return "employer"
    if identity.startswith("observer-") or "observer" in haystack:
        return "observer"
    if "agent" in haystack or "interviewer" in haystack:
        return "agent"
    return "guest"


def _participant_display_name(participant, fallback: str = "") -> str:
    if participant is None:
        return fallback
    metadata = _participant_metadata(participant)
    return (
        str(getattr(participant, "name", "") or "")
        or str(metadata.get("name", "") or "")
        or str(metadata.get("company_name", "") or "")
        or fallback
    ).strip()

def _parse_optional_float(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def _clamp_tts_speed(value: float | None) -> float | None:
    if value is None:
        return None
    return max(0.5, min(2.0, value))

def resolve_tts_speed(agent_context: dict[str, Any]) -> float | None:
    context_speed = _parse_optional_float(agent_context.get("ttsSpeed"))
    if context_speed is not None:
        return _clamp_tts_speed(context_speed)
    return _clamp_tts_speed(config.TTS_SPEED)


def _takeover_action_from_text(text: str) -> str | None:
    normalized = (text or "").strip()
    if not normalized:
        return None

    try:
        payload = json.loads(normalized)
    except Exception:
        payload = None

    if isinstance(payload, dict):
        normalized = str(payload.get("action") or "").strip()

    action = normalized.lower()
    if action in {"acquire", "hold", "takeover", "start"}:
        return "acquire"
    if action in {"release", "resume", "stop", "end"}:
        return "release"
    return None


@server.rtc_session(agent_name="square-ai-interviewer")
async def entrypoint(ctx: JobContext) -> None:
    # Set log context for better debugging
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info(f"Starting interview agent for room: {ctx.room.name}")

    # 1. Context Preparation from room metadata
    agent_context = {
        "candidateName": "Ứng viên",
        "jobTitle": "đang ứng tuyển",
        "jobDescription": "",
        "backendApiUrl": config.BACKEND_API_URL,
        "roomName": ctx.room.name,
        "participantIdentity": "",
        "interviewLanguage": "vi",
    }
    try:
        metadata = ctx.room.metadata
        if metadata:
            pm = json.loads(metadata)
            agent_context.update(
                {
                    "candidateName": pm.get("candidate_name", "Ứng viên"),
                    "jobTitle": pm.get("job_title", "đang ứng tuyển"),
                    "jobDescription": pm.get("job_description", ""),
                    "interviewLanguage": pm.get("interview_language") or pm.get("interviewLanguage", "vi"),
                }
            )
    except Exception as e:
        logger.warning(f"Failed to parse room metadata: {e}")

    # Fetch pre-loaded questions from context endpoint
    try:
        url = f"{config.BACKEND_API_URL}/v1/interview/compat/{ctx.room.name}/context"
        async with httpx.AsyncClient(
            event_hooks={"request": [auth_event_hook()]}
        ) as client:
            resp = await client.get(url, timeout=5.0)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict):
                agent_context.update(data)
                agent_context["questions"] = data.get("questions", [])
                logger.info(
                    "Loaded interview context for room %s: questionCount=%s, candidate=%s, job=%s, lang=%s",
                    ctx.room.name,
                    data.get("questionCount", len(data.get("questions", []))),
                    data.get("candidateName"),
                    data.get("jobTitle"),
                    data.get("interviewLanguage", "vi"),
                )
    except Exception as e:
        logger.warning(f"Failed to fetch predefined questions: {e}")

    session_lang = str(agent_context.get("interviewLanguage") or "vi").lower()
    stt_lang = session_lang if session_lang in {"vi", "en", "ja", "ko"} else config.STT_LANGUAGE

    # 2. Initialize Models
    curl_headers = {"User-Agent": "curl/7.68.0"}
    stt_transport = RetryRateLimitTransport(httpx.AsyncHTTPTransport(verify=False))
    stt_model = openai.STT(
        client=openai_lib.AsyncOpenAI(
            api_key=config.STT_API_KEY or "dummy",
            base_url=config.STT_BASE_URL,
            default_headers=curl_headers,
            http_client=httpx.AsyncClient(transport=stt_transport, headers=curl_headers),
        ),
        model=config.STT_MODEL,
        language=stt_lang,
    )

    llm_model = openai.LLM(
        client=openai_lib.AsyncOpenAI(
            api_key=config.LLM_API_KEY or "dummy",
            base_url=config.LLM_BASE_URL,
            http_client=httpx.AsyncClient(timeout=httpx.Timeout(600.0, connect=15.0)),
        ),
        model=config.LLM_MODEL,
        temperature=config.LLM_TEMPERATURE,
        top_p=config.LLM_TOP_P,
        max_completion_tokens=config.LLM_MAX_COMPLETION_TOKENS,
        extra_body=_build_llm_extra_body(),
    )

    tts_voice = str(agent_context.get("ttsVoice") or "").strip()
    if not tts_voice:
        if session_lang in {"en", "ja", "ko"}:
            tts_voice = "alloy"
        else:
            tts_voice = config.TTS_VOICE
    if tts_voice in {"TrAc Ly", "TrÃºc Ly", "Trc Ly", "Trc Ly", "Tr?c Ly"}:
        tts_voice = "Trúc Ly"
    logger.info("Using TTS voice for room %s (%s): %s", ctx.room.name, session_lang, tts_voice)
    tts_speed = resolve_tts_speed(agent_context)
    if tts_speed is not None:
        logger.info("Using TTS speed for room %s: %s", ctx.room.name, tts_speed)

    # Ensure custom audio stream models stream raw audio chunks instead of expecting SSE events
    openai_tts.AUDIO_STREAM_MODELS.add(config.TTS_MODEL)
    openai_tts.AUDIO_STREAM_MODELS.add("tts-vi")

    tts_transport = RetryRateLimitTransport(httpx.AsyncHTTPTransport(verify=False))
    tts_kwargs = {
        "client": openai_lib.AsyncOpenAI(
            api_key=config.TTS_API_KEY or "dummy",
            base_url=config.TTS_BASE_URL,
            default_headers=curl_headers,
            max_retries=config.TTS_MAX_RETRIES,
            http_client=httpx.AsyncClient(
                headers=curl_headers,
                transport=tts_transport,
                timeout=httpx.Timeout(
                    connect=config.TTS_CONNECT_TIMEOUT_SECONDS,
                    read=config.TTS_READ_TIMEOUT_SECONDS,
                    write=config.TTS_WRITE_TIMEOUT_SECONDS,
                    pool=config.TTS_POOL_TIMEOUT_SECONDS,
                ),
            ),
        ),
        "model": config.TTS_MODEL,
        "voice": tts_voice,
        "response_format": "mp3",
    }
    if tts_speed is not None:
        tts_kwargs["speed"] = tts_speed
    tts_model = openai.TTS(**tts_kwargs)

    # 3. Create Interviewer Agent (greeting is handled in on_enter)
    interviewer = Interviewer(context=agent_context)

    async def _wait_for_participant(
        participant_identity: str | None, timeout_seconds: float = 2.0
    ):
        if not participant_identity:
            return None

        deadline = asyncio.get_event_loop().time() + timeout_seconds
        while True:
            participant = ctx.room.remote_participants.get(participant_identity)
            if participant is not None:
                return participant
            if asyncio.get_event_loop().time() >= deadline:
                return None
            await asyncio.sleep(0.1)

    async def _handle_candidate_chat_stream(reader, participant_identity) -> None:
        participant_identity = _participant_identity(participant_identity)
        text = (await reader.read_all()).strip()
        if not text:
            return

        participant = await _wait_for_participant(participant_identity)
        if participant is None:
            logger.warning(
                "participant not found after retry, ignoring text input for room %s from %s",
                ctx.room.name,
                participant_identity,
            )
            return

        participant_role = _participant_role(participant, participant_identity)
        if participant_role != "candidate":
            logger.info(
                "Ignoring public chat for AI input in room %s from %s role=%s",
                ctx.room.name,
                participant_identity,
                participant_role,
            )
            return

        logger.info(
            "Received text interview input for room %s from %s: %s",
            ctx.room.name,
            participant_identity,
            text,
        )
        await interviewer.record_transcript("candidate", text)
        try:
            await session.interrupt(force=True)
        except Exception as exc:
            logger.info(
                "Skipping interrupt before text reply for room %s: %s",
                ctx.room.name,
                exc,
            )
        # Text-chat turns should stay on the conversational path only.
        # Disabling tool selection here avoids function-call failures from the
        # LLM when a candidate sends a plain text answer.
        session.generate_reply(user_input=text, tools=[], tool_choice="none")

    async def _handle_employer_control_stream(reader, participant_identity) -> None:
        participant_identity = _participant_identity(participant_identity)
        text = (await reader.read_all()).strip()
        if not text:
            return

        participant = await _wait_for_participant(participant_identity)
        participant_role = _participant_role(participant, participant_identity)
        if participant_role not in EMPLOYER_CONTROL_ROLES:
            logger.info(
                "Ignoring AI control text in room %s from %s role=%s",
                ctx.room.name,
                participant_identity,
                participant_role,
            )
            return

        speaker_name = _participant_display_name(participant, "Nhà tuyển dụng")
        logger.info(
            "Received employer AI control for room %s from %s: %s",
            ctx.room.name,
            participant_identity,
            text,
            )
        await interviewer.handle_employer_instruction(text, speaker_name=speaker_name)

    async def _handle_employer_takeover_stream(reader, participant_identity) -> None:
        participant_identity = _participant_identity(participant_identity)
        text = (await reader.read_all()).strip()
        action = _takeover_action_from_text(text)
        if action is None:
            logger.info(
                "Ignoring unknown AI takeover control in room %s from %s: %s",
                ctx.room.name,
                participant_identity,
                text,
            )
            return

        participant = await _wait_for_participant(participant_identity)
        participant_role = _participant_role(participant, participant_identity)
        if participant_role not in EMPLOYER_CONTROL_ROLES:
            logger.info(
                "Ignoring AI takeover control in room %s from %s role=%s",
                ctx.room.name,
                participant_identity,
                participant_role,
            )
            return

        speaker_name = _participant_display_name(participant, "Nhà tuyển dụng")
        logger.info(
            "Received employer takeover %s for room %s from %s",
            action,
            ctx.room.name,
            participant_identity,
        )
        if action == "acquire":
            try:
                await session.interrupt(force=True)
            except Exception as exc:
                logger.info(
                    "Skipping interrupt before employer takeover for room %s: %s",
                    ctx.room.name,
                    exc,
                )
            interviewer.pause_for_employer_takeover(speaker_name)
            return

        interviewer.resume_from_employer_takeover(speaker_name)

    async def _handle_question_control_stream(reader, participant_identity) -> None:
        participant_identity = _participant_identity(participant_identity)
        text = (await reader.read_all()).strip()
        if not text:
            return

        try:
            payload = json.loads(text)
        except Exception:
            payload = {"action": text}

        action = str(payload.get("action") or payload.get("type") or "").strip().lower()
        logger.info(
            "Received question control event for room %s from %s: action=%s",
            ctx.room.name,
            participant_identity,
            action,
        )

        target_index = payload.get("question_index")
        if not isinstance(target_index, int):
            target_index = None

        if action in {"time_up", "timeout"}:
            next_idx = target_index + 1 if target_index is not None else None
            await interviewer.handle_question_timeout(target_index=next_idx)
        elif action in {"next_question", "skip_question", "done_question"}:
            await interviewer.handle_candidate_next_question(target_index=target_index)
        elif action in {"finish_interview", "end_session", "complete_interview"}:
            await interviewer.handle_candidate_finish_interview()

    async def _handle_question_change_stream(reader, participant_identity) -> None:
        text = (await reader.read_all()).strip()
        if not text:
            return
        try:
            payload = json.loads(text)
        except Exception:
            return
        q_idx = payload.get("question_index")
        if isinstance(q_idx, int) and 0 <= q_idx < len(interviewer.questions):
            interviewer.current_question_index = q_idx

    # 4. Setup Session (Standard 1.5.x Pattern)
    session = AgentSession(
        stt=stt_model,
        llm=llm_model,
        tts=tts_model,
        vad=ctx.proc.userdata["vad"],
        **build_session_kwargs(),
    )
    session_started = False

    # 5. Event Handlers
    @session.on("session_usage_updated")
    def _on_session_usage_updated(ev: SessionUsageUpdatedEvent) -> None:
        logger.info("Session usage updated for room %s: %s", ctx.room.name, ev.usage)

    @session.on("speech_created")
    def _on_speech_created(ev) -> None:
        if getattr(ev, "source", "") != "generate_reply":
            return
        speech_handle = getattr(ev, "speech_handle", None)
        if speech_handle is None:
            return
        try:
            speech_handle.allow_interruptions = False
        except Exception as exc:
            logger.debug("Could not make generated speech uninterruptible: %s", exc)

        def _finalize_when_completed(_speech_handle) -> None:
            _create_background_task(interviewer.finalize_completed_interview())

        try:
            speech_handle.add_done_callback(_finalize_when_completed)
        except Exception as exc:
            logger.debug("Could not attach completion finalizer: %s", exc)

    @session.on("conversation_item_added")
    def _on_conversation_item_added(ev) -> None:
        item = getattr(ev, "item", None)
        if not isinstance(item, ChatMessage):
            return

        role = str(getattr(item, "role", "") or "").strip().lower()
        if role not in {"user", "assistant"}:
            return

        content = item.text_content or ""
        content = content.strip()
        if not content:
            return

        if role == "assistant":
            lowered = content.lower()
            if (
                "finish_interview" in lowered
                or "set_interview_stage" in lowered
                or "get_interview_progress" in lowered
            ):
                return

        role = "candidate" if role == "user" else "ai_agent"
        _create_background_task(interviewer.record_transcript(role, content))

    @session.on("close")
    def _on_close(ev: CloseEvent) -> None:
        close_reason = getattr(ev.reason, "value", ev.reason)
        logger.info(f"Session closed for room: {ctx.room.name}, reason: {close_reason}")
        # Sync remaining transcript from session history
        for item in session.history.items:
            if item.type == "message":
                role = "candidate" if item.role == "user" else "ai_agent"
                content = item.text_content
                if content and content.strip():
                    _create_background_task(
                        interviewer.record_transcript(role, content.strip())
                    )

        try:
            get_job_context().shutdown(reason=close_reason)
        except Exception as exc:
            logger.warning(f"Failed to shutdown job context: {exc}")

    # 6. Shutdown callback for final status sync
    async def on_shutdown() -> None:
        if not session_started:
            return
        logger.info(f"Session finished for room: {ctx.room.name}")
        logger.info(f"Usage: {session.usage}")

    ctx.add_shutdown_callback(on_shutdown)

    # Establish the room connection up front so the greeting and first audio turn
    # don't race the agent connection handshake.
    await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_ALL)
    ctx.room.register_text_stream_handler(
        CHAT_TOPIC,
        lambda reader, participant_identity: asyncio.create_task(
            _handle_candidate_chat_stream(reader, participant_identity)
        ),
    )
    ctx.room.register_text_stream_handler(
        AI_CONTROL_TOPIC,
        lambda reader, participant_identity: asyncio.create_task(
            _handle_employer_control_stream(reader, participant_identity)
        ),
    )
    ctx.room.register_text_stream_handler(
        AI_TAKEOVER_TOPIC,
        lambda reader, participant_identity: asyncio.create_task(
            _handle_employer_takeover_stream(reader, participant_identity)
        ),
    )
    ctx.room.register_text_stream_handler(
        QUESTION_CONTROL_TOPIC,
        lambda reader, participant_identity: asyncio.create_task(
            _handle_question_control_stream(reader, participant_identity)
        ),
    )
    ctx.room.register_text_stream_handler(
        QUESTION_CHANGE_TOPIC,
        lambda reader, participant_identity: asyncio.create_task(
            _handle_question_change_stream(reader, participant_identity)
        ),
    )

    # 7. Start the Session (no ctx.connect() needed - handled by session.start)
    try:
        session_started = True
        # Mark interview as active only after the agent has a live room connection.
        await _update_backend_status(ctx.room.name, "in_progress")
        participant_identity = (
            str(agent_context.get("participantIdentity") or "").strip() or None
        )
        if participant_identity:
            participant = await _wait_for_participant(
                participant_identity,
                timeout_seconds=config.PARTICIPANT_WAIT_TIMEOUT_SECONDS,
            )
            if participant is None:
                logger.warning(
                    "Candidate participant %s did not join room %s within %.1fs; starting session anyway",
                    participant_identity,
                    ctx.room.name,
                    config.PARTICIPANT_WAIT_TIMEOUT_SECONDS,
                )
            else:
                logger.info(
                    "Candidate participant %s detected in room %s; starting interview session",
                    participant_identity,
                    ctx.room.name,
                )
        room_options = room_io.RoomOptions(
            text_input=False,
            participant_identity=participant_identity,
            close_on_disconnect=False,
        )
        await session.start(
            agent=interviewer,
            room=ctx.room,
            room_options=room_options,
        )
    except Exception:
        session_started = False
        logger.exception("Failed to start LiveKit session for room %s", ctx.room.name)
        await _update_backend_status(ctx.room.name, "interrupted")
        raise

# Worker options for test harnesses / runners that instantiate WorkerOptions directly
worker_options = WorkerOptions(
    entrypoint_fnc=entrypoint,
    prewarm_fnc=prewarm,
    load_threshold=float(os.getenv("LIVEKIT_LOAD_THRESHOLD", "0.9")),
)

if __name__ == "__main__":
    cli.run_app(server)

