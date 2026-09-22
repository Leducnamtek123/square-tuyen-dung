import os
import time
import httpx
from io import BytesIO
from utils.logger import logger
from .base_tts import BaseTTS, State
from registry import register


@register("tts", "metaconnect")
@register("tts", "openai")
class OpenAITTS(BaseTTS):
    """Metaconnect / OpenAI-compatible TTS for LiveTalking digital human."""

    def txt_to_audio(self, msg: tuple[str, dict]):
        text, textevent = msg
        if not text or not text.strip():
            return

        base_url = (
            os.getenv("TTS_BASE_URL")
            or os.getenv("AI_TTS_BASE_URL")
            or "https://api.metaconnect.vn/v1"
        ).rstrip("/")
        api_key = (
            os.getenv("TTS_API_KEY")
            or os.getenv("AI_TTS_API_KEY")
            or "airp_live_ZX173OjElohx_4xp3OhMBdtNZkfgdGbFxbgIWLTH4LCP8"
        )
        model = os.getenv("TTS_MODEL") or os.getenv("AI_TTS_MODEL") or "tts-vi"
        voice = (
            textevent.get("tts", {}).get("voice")
            or os.getenv("TTS_VOICE")
            or os.getenv("AI_TTS_DEFAULT_VOICE")
            or "Trúc Ly"
        )

        url = f"{base_url}/audio/speech"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "curl/7.68.0",
        }
        payload = {
            "model": model,
            "input": text,
            "voice": voice,
            "response_format": "mp3",
        }

        t0 = time.perf_counter()
        try:
            logger.info("Calling Metaconnect TTS for text: '%s...' with voice %s", text[:40], voice)
            with httpx.Client(timeout=30.0, verify=False) as client:
                res = client.post(url, json=payload, headers=headers)
                if res.status_code != 200:
                    logger.error("TTS HTTP %s: %s", res.status_code, res.text[:200])
                    return
                audio_bytes = res.content
                elapsed = time.perf_counter() - t0
                logger.info(
                    "Metaconnect TTS generated %d bytes in %.2fs",
                    len(audio_bytes),
                    elapsed,
                )
        except Exception as exc:
            logger.exception("Error calling Metaconnect TTS: %s", exc)
            return

        if self.state == State.RUNNING and audio_bytes:
            self.parent.put_audio_file(audio_bytes, {"text": text, **textevent})
