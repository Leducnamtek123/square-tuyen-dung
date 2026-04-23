import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env")

def _get_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        return default

def _get_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default

@dataclass
class Config:
    LIVEKIT_URL: str = os.getenv("LIVEKIT_URL", "http://livekit:7880")
    LIVEKIT_API_KEY: str = os.getenv("LIVEKIT_API_KEY", "devkey")
    LIVEKIT_API_SECRET: str = os.getenv("LIVEKIT_API_SECRET", "secret")

    # LLM
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemma4:e4b")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://ollama:11434/v1")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "no-key-needed")

    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "whisper").lower()

    STT_BASE_URL: str = os.getenv("STT_BASE_URL", "http://whisper:8080/v1")
    STT_MODEL: str = os.getenv("STT_MODEL", "openai/whisper-large-v3")
    STT_LANGUAGE: str = os.getenv("STT_LANGUAGE", "vi")
    STT_API_KEY: str = os.getenv("STT_API_KEY", "no-key-needed")

    TTS_BASE_URL: str = os.getenv("TTS_BASE_URL", "http://vieneu-tts:8298/v1")
    TTS_MODEL: str = os.getenv("TTS_MODEL", "tts-1")
    TTS_VOICE: str = os.getenv("TTS_VOICE", "Bình (nam miền Bắc)")
    TTS_API_KEY: str = os.getenv("TTS_API_KEY", "no-key-needed")
    TTS_CONNECT_TIMEOUT_SECONDS: float = _get_float(
        "TTS_CONNECT_TIMEOUT_SECONDS", 15.0
    )
    TTS_READ_TIMEOUT_SECONDS: float = _get_float("TTS_READ_TIMEOUT_SECONDS", 300.0)
    TTS_WRITE_TIMEOUT_SECONDS: float = _get_float("TTS_WRITE_TIMEOUT_SECONDS", 30.0)
    TTS_POOL_TIMEOUT_SECONDS: float = _get_float("TTS_POOL_TIMEOUT_SECONDS", 30.0)
    TTS_MAX_RETRIES: int = _get_int("TTS_MAX_RETRIES", 3)


    # Streaming/latency tuning
    PREEMPTIVE_GENERATION: bool = os.getenv("PREEMPTIVE_GENERATION", "1").lower() in (
        "1",
        "true",
        "yes",
    )
    PREEMPTIVE_GATING: bool = os.getenv("PREEMPTIVE_GATING", "1").lower() in (
        "1",
        "true",
        "yes",
    )
    PREEMPTIVE_MIN_WORDS: int = _get_int("PREEMPTIVE_MIN_WORDS", 3)
    PREEMPTIVE_MIN_CHARS: int = _get_int("PREEMPTIVE_MIN_CHARS", 12)
    MIN_ENDPOINTING_DELAY: float = _get_float("MIN_ENDPOINTING_DELAY", 0.25)
    MAX_ENDPOINTING_DELAY: float = _get_float("MAX_ENDPOINTING_DELAY", 1.0)
    MIN_CONSECUTIVE_SPEECH_DELAY: float = _get_float("MIN_CONSECUTIVE_SPEECH_DELAY", 0.1)

    AUTO_END_ON_COMPLETION: bool = os.getenv("AUTO_END_ON_COMPLETION", "0").lower() in (
        "1",
        "true",
        "yes",
    )

    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://backend:8000/api")

config = Config()
