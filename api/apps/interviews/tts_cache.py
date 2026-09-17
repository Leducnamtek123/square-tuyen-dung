import hashlib
import logging
import os
from django.conf import settings

logger = logging.getLogger(__name__)


def compute_tts_cache_key(model: str, voice: str, speed: float | None, text: str) -> str:
    """
    Generate deterministic cache key for TTS requests based on model, voice, speed, and text.
    Shared identically with livekit-agent RetryRateLimitTransport.
    """
    speed_val = round(float(speed or 1.0), 2)
    normalized_text = sanitize_tts_text(text)
    key_str = f"{model}:{voice}:{speed_val}:{normalized_text}"
    return hashlib.sha256(key_str.encode("utf-8")).hexdigest()


def sanitize_tts_text(text: str) -> str:
    """Normalize whitespace and strip symbols for clean TTS audio synthesis."""
    if not text:
        return ""
    import re
    cleaned = text.replace("\u200b", " ").replace("\ufeff", " ")
    cleaned = re.sub(r"<think>[\s\S]*?</think>", " ", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"```[\s\S]*?```", " ", cleaned)
    cleaned = " ".join(cleaned.split()).strip()
    return cleaned


def format_opening_greeting(
    candidate_name: str,
    job_title: str,
    language: str = "vi",
    has_cv: bool = False,
) -> str:
    lang = (language or "vi").lower()
    name = (candidate_name or "").strip()
    title = (job_title or "").strip()
    is_placeholder_name = not name or name.lower() in {"ứng viên", "ung vien", "candidate", "applicant"}
    is_placeholder_title = not title or title.lower() in {"đang ứng tuyển", "dang ung tuyen", "applicant"}

    if lang == "en":
        cand = f" {name}" if not is_placeholder_name else ""
        if has_cv:
            if not is_placeholder_title:
                return f"Hello{cand}, I am your interviewer from Square for the {title} position. I have thoroughly reviewed your CV and look forward to our discussion. Before we begin, can you hear me clearly?"
            return f"Hello{cand}, I am your interviewer from Square. I have thoroughly reviewed your CV and look forward to our discussion. Before we begin, can you hear me clearly?"
        if not is_placeholder_title:
            return f"Hello{cand}, I am your interviewer from Square for the {title} position. Before we begin, can you hear me clearly?"
        return f"Hello{cand}, I am your interviewer from Square. Before we begin, can you hear me clearly?"

    if lang == "ja":
        cand = f"{name}様、" if not is_placeholder_name else ""
        if has_cv:
            if not is_placeholder_title:
                return f"こんにちは。{cand}本日は{title}ポジションの面接を担当いたします、Squareの採用担当です。事前に履歴書を拝見いたしました。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"
            return f"こんにちは。{cand}本日の面接を担当いたします、Squareの採用担当です。事前に履歴書を拝見いたしました。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"
        if not is_placeholder_title:
            return f"こんにちは。{cand}本日は{title}ポジションの面接を担当いたします、Squareの採用担当です。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"
        return f"こんにちは。{cand}本日の面接を担当いたします、Squareの採用担当です。始める前に、こちらの声がはっきりと聞こえていますでしょうか。"

    if lang == "ko":
        cand = f"{name}님, " if not is_placeholder_name else ""
        if has_cv:
            if not is_placeholder_title:
                return f"안녕하세요. {cand}오늘 {title} 직무 면접을 진행하게 된 Square 채용 담당자입니다. 이력서를 꼼꼼히 확인하였습니다. 시작하기 전에 제 목소리가 잘 들리시나요?"
            return f"안녕하세요. {cand}오늘 면접을 진행하게 된 Square 채용 담당자입니다. 이력서를 꼼꼼히 확인하였습니다. 시작하기 전에 제 목소리가 잘 들리시나요?"
        if not is_placeholder_title:
            return f"안녕하세요. {cand}오늘 {title} 직무 면접을 진행하게 된 Square 채용 담당자입니다. 시작하기 전에 제 목소리가 잘 들리시나요?"
        return f"안녕하세요. {cand}오늘 면접을 진행하게 된 Square 채용 담당자입니다. 시작하기 전에 제 목소리가 잘 들리시나요?"

    if is_placeholder_name:
        greeting = "Chào bạn"
    else:
        greeting = f"Chào {name}"

    if has_cv:
        if not is_placeholder_title:
            return (
                f"{greeting}, mình là Nhà tuyển dụng của Square cho vị trí {title}. "
                "Mình đã xem kỹ hồ sơ ứng tuyển của bạn và rất vui được trao đổi hôm nay. "
                "Trước khi bắt đầu, bạn nghe mình rõ không?"
            )
        return (
            f"{greeting}, mình là Nhà tuyển dụng của Square. "
            "Mình đã xem kỹ hồ sơ ứng tuyển của bạn và rất vui được trao đổi hôm nay. "
            "Trước khi bắt đầu, bạn nghe mình rõ không?"
        )

    if not is_placeholder_title:
        return (
            f"{greeting}, mình là Nhà tuyển dụng của Square cho vị trí {title}. "
            "Trước khi bắt đầu, bạn nghe mình rõ không?"
        )
    return f"{greeting}, mình là Nhà tuyển dụng của Square. Trước khi bắt đầu, bạn nghe mình rõ không?"


def get_tts_cache_dir() -> str:
    cache_dir = getattr(settings, "TTS_CACHE_DIR", "/tmp/tts_cache")
    try:
        os.makedirs(cache_dir, exist_ok=True)
        try:
            os.chmod(cache_dir, 0o777)
        except Exception:
            pass
    except Exception as exc:
        logger.warning("Failed to create TTS cache dir %s: %s", cache_dir, exc)
    return cache_dir


def get_tts_cache_file_path(model: str, voice: str, speed: float | None, text: str) -> str:
    key = compute_tts_cache_key(model, voice, speed, text)
    return os.path.join(get_tts_cache_dir(), f"{key}.mp3")
