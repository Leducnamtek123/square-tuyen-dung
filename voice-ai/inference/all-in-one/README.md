# Square AI all-in-one GPU image

This image runs three OpenAI-compatible services in one GPU container:

- LLM: vLLM on port `8000`
- STT: VoxBox/Whisper on port `8080`
- TTS: VieNeu-TTS on port `8298`

Use this only when you intentionally want one FPT GPU Container for all AI
inference. Separate containers are easier to debug and scale.

## Build

Run from the repository root:

```powershell
docker build -f .\voice-ai\inference\all-in-one\Dockerfile `
  -t registry.fke.fptcloud.com/<registry-id>/square-ai-all-in-one:latest `
  .\voice-ai\inference

docker push registry.fke.fptcloud.com/<registry-id>/square-ai-all-in-one:latest
```

## FPT GPU Container settings

Choose `Custom template`, then use:

```text
Image: registry.fke.fptcloud.com/<registry-id>/square-ai-all-in-one
Tag: latest
HTTP ports: 8000, 8080, 8298
Persistent disk mount path: /models
Persistent disk size: 200GB or more
```

Recommended environment variables for a single `1xH100` interview container.

```env
LLM_MODEL=Qwen/Qwen3-14B
LLM_SERVED_MODEL_NAME=qwen3-14b-interview
API_TOKEN=<set-a-secret-token>
DTYPE=bfloat16
GPU_MEMORY_UTILIZATION=0.55
MAX_MODEL_LEN=8192
MAX_NUM_SEQS=8

VOXBOX_HF_REPO_ID=Systran/faster-whisper-large-v3
VOXBOX_DEVICE=cuda
DATA_DIR=/models/whisper

TTS_DEVICE=cuda
TTS_CODEC_DEVICE=cuda
TTS_MODE=fast
TTS_BACKBONE_REPO=pnnbao-ump/VieNeu-TTS
TTS_GGUF_FILENAME=
TTS_GPU_MEM_FRACTION=0.15
HF_HOME=/models/huggingface
```

If the container runs out of GPU memory, lower `GPU_MEMORY_UTILIZATION`,
`MAX_MODEL_LEN`, or `MAX_NUM_SEQS`.

## App env

After FPT exposes endpoints for the three ports, set the main app:

```env
AI_LLM_BASE_URL=https://<fpt-llm-endpoint>/v1
AI_LLM_MODEL=qwen3-14b-interview
AI_LLM_API_KEY=<same-as-API_TOKEN>
AI_RESUME_LLM_MODEL=qwen3-14b-interview

AI_STT_BASE_URL=https://<fpt-whisper-endpoint>/v1
AI_STT_MODEL=Systran/faster-whisper-large-v3
AI_STT_LANGUAGE=vi

AI_TTS_BASE_URL=https://<fpt-tts-endpoint>/v1
AI_TTS_DEFAULT_VOICE=Ly
```
