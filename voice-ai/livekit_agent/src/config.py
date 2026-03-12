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
    LLAMA_MODEL: str = os.getenv("LLAMA_MODEL", "qwen2-7b")
    LLAMA_BASE_URL: str = os.getenv("LLAMA_BASE_URL", "http://llama-cpp:11434/v1")
    
    # STT
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "whisper").lower()
    
    @property
    def stt_base_url(self) -> str:
        return os.getenv("STT_BASE_URL", "http://whisper:8080/v1")
    
    @property
    def stt_model(self) -> str:
        return os.getenv("STT_MODEL", "openai/whisper-large-v3")
    
    STT_LANGUAGE: str = os.getenv("STT_LANGUAGE", "vi")
    STT_API_KEY: str = os.getenv("STT_API_KEY", "no-key-needed")
    
    # TTS
    TTS_BASE_URL: str = os.getenv("TTS_BASE_URL", "http://vieneu-tts:8298/v1")
    TTS_MODEL: str = os.getenv("TTS_MODEL", "tts-1")
    TTS_VOICE: str = os.getenv("TTS_VOICE", "Bình (nam miền Bắc)")
    TTS_API_KEY: str = os.getenv("TTS_API_KEY", "no-key-needed")

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

    
    # API
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://backend:8001/api")

config = Config()
