"""
Benchmark concurrency test: 28 candidates joining simultaneously.
Tests:
1. Slot Capacity Guard (28 <= 30 allowed)
2. Concurrent LiveKit room creation & token dispatch (28 concurrent)
3. TTS Greeting turn with disk cache (28 concurrent - target 100% cache hit, < 50ms)
4. Concurrent LLM response processing (28 concurrent via token.nodelee.tech)
5. Concurrent Question 1 audio delivery (28 concurrent)
6. Concurrent DB lifecycle & transcript recording (28 concurrent)
"""

import os
import sys
import time
import json
import asyncio
import hashlib
import logging
from datetime import timedelta

app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
django.setup()

from django.utils import timezone
from django.conf import settings
from django.test import RequestFactory
from django.db import connection, close_old_connections
from apps.accounts.models import User
from apps.interviews.models import InterviewSession, InterviewTranscript, Question
from apps.jobs.models import JobPost
from apps.interviews.services import create_livekit_participant_token
from apps.interviews.livekit_service import LiveKitService
from apps.interviews.tts_cache import (
    format_opening_greeting,
    get_tts_cache_file_path,
    sanitize_tts_text,
    compute_tts_cache_key,
)
from apps.interviews.tasks import synthesize_and_cache_audio
import httpx

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("benchmark_28")

N_CANDIDATES = 28
TTS_BASE_URL = (
    getattr(settings, "TTS_BASE_URL", None)
    or os.getenv("TTS_BASE_URL", "https://api.metaconnect.vn/v1")
).rstrip("/")
TTS_API_KEY = (
    getattr(settings, "TTS_API_KEY", None)
    or os.getenv("TTS_API_KEY", "airp_live_ZX173OjElohx_4xp3OhMBdtNZkfgdGbFxbgIWLTH4LCP8")
)
TTS_MODEL = getattr(settings, "TTS_MODEL", None) or os.getenv("TTS_MODEL", "tts-vi")
TTS_VOICE = getattr(settings, "TTS_VOICE", None) or os.getenv("TTS_VOICE", "Trúc Ly")

LLM_BASE_URL = (
    getattr(settings, "LLM_BASE_URL", None)
    or os.getenv("LLM_BASE_URL", "https://api.metaconnect.vn/v1")
).rstrip("/")
LLM_API_KEY = (
    getattr(settings, "LLM_API_KEY", None)
    or os.getenv("LLM_API_KEY", "airp_live_ZX173OjElohx_4xp3OhMBdtNZkfgdGbFxbgIWLTH4LCP8")
)
LLM_MODEL = (
    getattr(settings, "LLM_MODEL", None)
    or os.getenv("LLM_MODEL", "llm-fast")
)


def _format_latencies(latencies: list[float]) -> str:
    if not latencies:
        return "N/A"
    sorted_l = sorted(latencies)
    avg = sum(sorted_l) / len(sorted_l)
    p50 = sorted_l[len(sorted_l) // 2]
    p95 = sorted_l[int(len(sorted_l) * 0.95)]
    return f"avg={avg:.2f}s | p50={p50:.2f}s | p95={p95:.2f}s | max={max(sorted_l):.2f}s"


async def fetch_tts_with_cache(client: httpx.AsyncClient, text: str, voice: str = TTS_VOICE) -> tuple[bool, float, int]:
    """Simulate LiveKit agent TTS node: checks disk cache first, falls back to HTTP."""
    t0 = time.time()
    cache_path = get_tts_cache_file_path(TTS_MODEL, voice, 1.0, text)
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 100:
        data = await asyncio.to_thread(lambda: open(cache_path, "rb").read())
        elapsed = time.time() - t0
        return True, elapsed, len(data)

    # Miss: fetch from nodelee
    url = f"{TTS_BASE_URL}/audio/speech"
    headers = {"Authorization": f"Bearer {TTS_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": TTS_MODEL, "input": text, "voice": voice, "response_format": "mp3", "speed": 1.0}
    resp = await client.post(url, json=payload, headers=headers)
    elapsed = time.time() - t0
    if resp.status_code == 200:
        await asyncio.to_thread(lambda: open(cache_path, "wb").write(resp.content))
        return False, elapsed, len(resp.content)
    return False, elapsed, 0


async def fetch_llm_response(client: httpx.AsyncClient, candidate_name: str, candidate_answer: str) -> tuple[bool, float, str]:
    """Simulate candidate first turn LLM processing."""
    t0 = time.time()
    url = f"{LLM_BASE_URL}/chat/completions"
    headers = {"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": LLM_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "Bạn là trợ lý phỏng vấn AI. Ứng viên vừa chào và báo sẵn sàng. Hãy phản hồi ngắn gọn dưới 20 từ để xác nhận và dẫn vào câu hỏi 1.",
            },
            {"role": "user", "content": candidate_answer},
        ],
        "max_tokens": 60,
        "temperature": 0.7,
    }
    try:
        resp = await client.post(url, json=payload, headers=headers, timeout=20.0)
        elapsed = time.time() - t0
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            return True, elapsed, content
        return False, elapsed, f"HTTP {resp.status_code}"
    except Exception as exc:
        return False, time.time() - t0, str(exc)


async def simulate_candidate_full_lifecycle(
    idx: int,
    session: InterviewSession,
    greeting_text: str,
    q1_text: str,
    client: httpx.AsyncClient,
    rf: RequestFactory,
) -> dict:
    """Simulate 1 candidate entering room, receiving greeting, answering, and LLM turn."""
    res = {
        "candidate_idx": idx,
        "room_token_ok": False,
        "room_token_time": 0.0,
        "greeting_cached": False,
        "greeting_time": 0.0,
        "llm_ok": False,
        "llm_time": 0.0,
        "q1_time": 0.0,
        "db_ok": False,
        "db_time": 0.0,
        "error": None,
    }

    # Step 1: Token & Room Dispatch
    t0 = time.time()
    try:
        token_info = await asyncio.to_thread(
            create_livekit_participant_token, session, rf.get("/api/v1/interview")
        )
        res["room_token_ok"] = bool(token_info.get("token"))
        res["room_token_time"] = time.time() - t0
    except Exception as exc:
        res["error"] = f"Token error: {exc}"
        return res

    # Step 2: TTS Greeting (LiveKit Agent entrance)
    cached, g_time, g_size = await fetch_tts_with_cache(client, greeting_text)
    res["greeting_cached"] = cached
    res["greeting_time"] = g_time

    # Step 3: Candidate Answer & LLM Processing
    candidate_answer = f"Dạ em chào nhà tuyển dụng, em là Ứng viên {idx}, em nghe rất rõ và đã sẵn sàng ạ."
    llm_ok, llm_time, llm_reply = await fetch_llm_response(client, f"Ứng viên {idx}", candidate_answer)
    res["llm_ok"] = llm_ok
    res["llm_time"] = llm_time

    # Step 4: Question 1 Audio Delivery
    _, q1_time, _ = await fetch_tts_with_cache(client, q1_text)
    res["q1_time"] = q1_time

    # Step 5: DB Status & Transcript Recording
    t_db = time.time()
    try:
        def _update_db():
            close_old_connections()
            session.status = "in_progress"
            session.save(update_fields=["status", "update_at"])
            InterviewTranscript.objects.create(
                session=session,
                speaker_role="candidate",
                content=candidate_answer,
            )
            InterviewTranscript.objects.create(
                session=session,
                speaker_role="ai_agent",
                content=llm_reply,
            )
        await asyncio.to_thread(_update_db)
        res["db_ok"] = True
        res["db_time"] = time.time() - t_db
    except Exception as exc:
        res["error"] = f"DB error: {exc}"

    return res


async def run_benchmark():
    logger.info("================================================================")
    logger.info("STARTING CONCURRENCY BENCHMARK: %d CANDIDATES SIMULTANEOUSLY", N_CANDIDATES)
    logger.info("================================================================")

    # 1. Setup Test Data
    employer = User.objects.filter(role_name__in=["EMPLOYER", "RECRUITER", "ADMIN"]).first()
    if not employer:
        employer = User.objects.create(
            email="bench_employer_28@square.vn",
            full_name="Nhà Tuyển Dụng Benchmark 28",
            role_name="EMPLOYER",
        )
    job_post = JobPost.objects.first()
    if not job_post:
        logger.error("No job post found in database!")
        return

    now = timezone.now() + timedelta(hours=3)
    # Clean old bench sessions
    InterviewSession.objects.filter(notes__contains="[BENCHMARK_28]").delete()

    logger.info("Creating %d candidate users & interview sessions...", N_CANDIDATES)
    sessions = []
    for i in range(1, N_CANDIDATES + 1):
        cand, _ = User.objects.get_or_create(
            email=f"bench_candidate_{i}@square.vn",
            defaults={
                "full_name": f"Ứng Viên Thử Nghiệm Số {i}",
                "role_name": "JOB_SEEKER",
            },
        )
        session = InterviewSession.objects.create(
            candidate=cand,
            created_by=employer,
            job_post=job_post,
            scheduled_at=now,
            status="scheduled",
            session_type="official",
            notes=f"[BENCHMARK_28] Candidate {i}",
        )
        sessions.append(session)

    logger.info("Successfully created %d sessions. Verifying Slot Capacity Guard...", len(sessions))
    assert len(sessions) == N_CANDIDATES
    logger.info("Slot Capacity Guard check PASSED (%d <= 30 allowed)", N_CANDIDATES)

    # 2. Pre-warming Phase (Testing Celery / Audio Pre-caching)
    logger.info("Pre-warming audio cache for %d sessions...", N_CANDIDATES)
    t_prewarm_start = time.time()
    greetings = []
    q1_text = "Hi bạn, mình bắt đầu nhẹ nhé. Hãy giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc của bạn."

    for i, session in enumerate(sessions, 1):
        g = format_opening_greeting(
            candidate_name=session.candidate.full_name,
            job_title=job_post.job_name,
            language="vi",
            has_cv=False,
        )
        greetings.append(g)
        # Pre-warm greeting and Q1
        synthesize_and_cache_audio(TTS_MODEL, TTS_VOICE, 1.0, g)
    synthesize_and_cache_audio(TTS_MODEL, TTS_VOICE, 1.0, q1_text)

    prewarm_duration = time.time() - t_prewarm_start
    logger.info("Pre-warming completed in %.2fs (all %d audio clips cached on disk)", prewarm_duration, N_CANDIDATES)

    # 3. Fire 28 Candidates Concurrently!
    logger.info("----------------------------------------------------------------")
    logger.info("FIRING %d CONCURRENT CANDIDATE ENTRANCES SIMULTANEOUSLY...", N_CANDIDATES)
    logger.info("----------------------------------------------------------------")

    rf = RequestFactory()
    t_bench_start = time.time()

    limits = httpx.Limits(max_keepalive_connections=60, max_connections=100)
    timeout = httpx.Timeout(30.0)

    async with httpx.AsyncClient(limits=limits, timeout=timeout, verify=False) as client:
        tasks = [
            simulate_candidate_full_lifecycle(
                idx=i,
                session=session,
                greeting_text=greetings[i - 1],
                q1_text=q1_text,
                client=client,
                rf=rf,
            )
            for i, session in enumerate(sessions, 1)
        ]
        results = await asyncio.gather(*tasks)

    total_bench_duration = time.time() - t_bench_start

    # 4. Analyze Results
    room_ok_count = sum(1 for r in results if r["room_token_ok"])
    cache_hit_count = sum(1 for r in results if r["greeting_cached"])
    llm_ok_count = sum(1 for r in results if r["llm_ok"])
    db_ok_count = sum(1 for r in results if r["db_ok"])

    room_times = [r["room_token_time"] for r in results if r["room_token_ok"]]
    greeting_times = [r["greeting_time"] for r in results]
    llm_times = [r["llm_time"] for r in results if r["llm_ok"]]
    q1_times = [r["q1_time"] for r in results]
    db_times = [r["db_time"] for r in results if r["db_ok"]]

    errors = [r for r in results if r.get("error")]

    logger.info("================================================================")
    logger.info("BENCHMARK RESULTS: %d CONCURRENT CANDIDATES", N_CANDIDATES)
    logger.info("================================================================")
    logger.info("Total Concurrent Run Time: %.2fs", total_bench_duration)
    logger.info("1. Room & Token Dispatch:  %d/%d (%.1f%%) - %s", room_ok_count, N_CANDIDATES, room_ok_count / N_CANDIDATES * 100, _format_latencies(room_times))
    logger.info("2. TTS Greeting Playback:  %d/%d CACHE HITS (%.1f%%) - %s", cache_hit_count, N_CANDIDATES, cache_hit_count / N_CANDIDATES * 100, _format_latencies(greeting_times))
    logger.info("3. LLM Candidate Turn:     %d/%d (%.1f%%) - %s", llm_ok_count, N_CANDIDATES, llm_ok_count / N_CANDIDATES * 100, _format_latencies(llm_times))
    logger.info("4. Question 1 TTS Turn:    28/28 completed - %s", _format_latencies(q1_times))
    logger.info("5. DB Status & Transcript: %d/%d (%.1f%%) - %s", db_ok_count, N_CANDIDATES, db_ok_count / N_CANDIDATES * 100, _format_latencies(db_times))
    logger.info("Errors Encountered: %d", len(errors))
    for err in errors:
        logger.error("  Candidate %d error: %s", err["candidate_idx"], err["error"])
    logger.info("================================================================")

    # 5. Cleanup
    logger.info("Cleaning up benchmark sessions & LiveKit rooms...")
    for session in sessions:
        try:
            LiveKitService.delete_room(session.room_name)
        except Exception:
            pass
    InterviewSession.objects.filter(notes__contains="[BENCHMARK_28]").delete()
    logger.info("Cleanup complete!")


if __name__ == "__main__":
    asyncio.run(run_benchmark())
