import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv(".env.local")

@dataclass
class Config:
    LIVEKIT_URL: str = os.getenv("LIVEKIT_URL", "http://livekit:7880")
    LIVEKIT_API_KEY: str = os.getenv("LIVEKIT_API_KEY", "devkey")
    LIVEKIT_API_SECRET: str = os.getenv("LIVEKIT_API_SECRET", "secret")
    
    # LLM
    LLAMA_MODEL: str = os.getenv("LLAMA_MODEL", "qwen2")
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
    TTS_VOICE: str = os.getenv("TTS_VOICE", "thanh_tuan")
    TTS_API_KEY: str = os.getenv("TTS_API_KEY", "no-key-needed")
    
    # API
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://backend:8001/api/interview")

config = Config()
