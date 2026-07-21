# FPT GPU containers for AI interviews

Use `square-ai-all-in-one.yaml` to run the three interview AI services in one
`1xH100` FPT GPU Container:

- LLM: `Qwen/Qwen3-14B`, served as `qwen3-14b-interview`
- STT: `Systran/faster-whisper-large-v3`
- TTS: `pnnbao-ump/VieNeu-TTS` with VieNeu `fast` GPU mode

After FPT creates the container, copy the endpoint values from
`app-env.all-in-one.env` into the main app `.env`.

The split-container alternative is still available:

1. `square-vllm.yaml`: LLM for interview questions, feedback, and scoring.
2. `square-whisper.yaml`: STT for candidate speech transcription.
3. `square-vieneu-tts.yaml`: TTS for the AI interviewer voice.

The split option is easier to scale/debug independently, but it is not required
for the interview flow.

After FPT gives HTTP endpoints for the all-in-one container, configure the main app:

```env
AI_LLM_BASE_URL=http://<fpt-port-8000-endpoint>/v1
AI_LLM_MODEL=qwen3-14b-interview
AI_LLM_API_KEY=<token-tu-dat>
AI_RESUME_LLM_MODEL=qwen3-14b-interview
AI_LLM_USE_VLLM_PARAMS=1
AI_LLM_ENABLE_THINKING=0
AI_LLM_TEMPERATURE=0.7
AI_LLM_TOP_P=0.8
AI_LLM_TOP_K=20
AI_LLM_MIN_P=0
AI_LLM_PRESENCE_PENALTY=1.5
AI_LLM_MAX_TOKENS=2048

AI_STT_BASE_URL=http://<fpt-port-8080-endpoint>/v1
AI_STT_MODEL=Systran/faster-whisper-large-v3
AI_STT_LANGUAGE=vi

AI_TTS_BASE_URL=http://<fpt-port-8298-endpoint>/v1
AI_TTS_DEFAULT_VOICE=Ly
TTS_BACKBONE_REPO=pnnbao-ump/VieNeu-TTS
TTS_GGUF_FILENAME=
TTS_INFER_TEMPERATURE=1.0
TTS_INFER_TOP_K=50
TTS_MAX_CHARS=256
TTS_NORMALIZE_AUDIO=
TTS_PEAK_LIMIT=0.98
TTS_PEAK_NORMALIZE_TARGET=
```
