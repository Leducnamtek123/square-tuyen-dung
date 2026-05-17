# Triển khai AI trên FPT GPU Container

Tài liệu này áp dụng cho các phần AI của repo:

- LLM cho chatbot, chấm CV và đánh giá phỏng vấn.
- STT cho `/api/ai/transcribe/` và LiveKit agent.
- TTS cho `/api/ai/tts/` và LiveKit agent.

## Kết luận kiến trúc

Không đưa toàn bộ `docker-compose.yml` vào một GPU Container. FPT GPU Container chạy một image cho mỗi container, không phải Docker Compose nhiều service. Web stack chính (`frontend`, `backend`, `celery`, `db`, `redis`, `livekit`, `minio`, `nginx-gateway`) nên chạy trên VM/server hoặc Kubernetes thường. GPU Container chỉ nên chạy các service cần GPU:

1. LLM: dùng FPT AI Inference, hoặc tạo GPU Container template `vllm-openai-v0.10.1`/`ollama`.
2. STT: custom image từ `voice-ai/inference/whisper`.
3. TTS: custom image từ `voice-ai/inference/vieneu-text-to-speech`.
4. `livekit-agent` không cần GPU; chạy cùng web stack để gọi các endpoint STT/LLM/TTS qua HTTPS.

## Build và push image lên FPT Container Registry

Trên FPT Cloud Console, bật Container Registry, lấy token, rồi login:

```powershell
docker login registry.fke.fptcloud.com
```

Build và push các image cần GPU:

```powershell
$env:REGISTRY = "registry.fke.fptcloud.com/<registry-id>"
$env:TAG = git rev-parse --short HEAD

docker build -t "$env:REGISTRY/square-whisper:$env:TAG" .\voice-ai\inference\whisper
docker build -t "$env:REGISTRY/square-vieneu-tts:$env:TAG" .\voice-ai\inference\vieneu-text-to-speech

docker push "$env:REGISTRY/square-whisper:$env:TAG"
docker push "$env:REGISTRY/square-vieneu-tts:$env:TAG"
```

Nếu muốn chạy `livekit-agent` riêng bằng container image:

```powershell
docker build -t "$env:REGISTRY/square-livekit-agent:$env:TAG" .\voice-ai\livekit_agent
docker push "$env:REGISTRY/square-livekit-agent:$env:TAG"
```

## Tạo GPU Container trên FPT

Luồng phỏng vấn AI dùng 1 FPT GPU Container duy nhất:

1. LLM: `Qwen/Qwen3-14B`, serve alias `qwen3-14b-interview`.
2. STT: `Systran/faster-whisper-large-v3`.
3. TTS: `pnnbao-ump/VieNeu-TTS-0.3B`.

File import chính: `infra/fpt-gpu/square-ai-all-in-one.yaml`.

Khuyến nghị cho all-in-one hiện tại:

- GPU: `1xH100`.
- HTTP ports: `8000` cho LLM, `8080` cho STT, `8298` cho TTS.
- Persistent disk mount: `/models`, tối thiểu `200GB`.

Nếu muốn tách để scale/debug riêng, tạo 3 GPU Container:

1. `square-vllm`: LLM OpenAI-compatible cho agent hỏi, phản hồi và chấm phỏng vấn.
2. `square-whisper`: STT cho transcript giọng nói ứng viên.
3. `square-vieneu-tts`: TTS cho giọng nói AI interviewer.

Các YAML import nằm trong `infra/fpt-gpu/`.

## Phương án chính: 1 container chạy cả LLM + STT + TTS

Image all-in-one nằm trong:

```text
voice-ai/inference/all-in-one
```

Build và push:

```powershell
$env:REGISTRY = "registry.fke.fptcloud.com/<registry-id>"
$env:TAG = "latest"

docker build -f .\voice-ai\inference\all-in-one\Dockerfile `
  -t "$env:REGISTRY/square-ai-all-in-one:$env:TAG" `
  .\voice-ai\inference

docker push "$env:REGISTRY/square-ai-all-in-one:$env:TAG"
```

Trên FPT GPU Container:

- Template: `Custom template`.
- Image: `registry.fke.fptcloud.com/<registry-id>/square-ai-all-in-one`.
- Tag: `latest`.
- GPU instance: `1xH100`.
- HTTP ports: `8000`, `8080`, `8298`.
- Persistent disk mount path: `/models`.
- Persistent disk size: tối thiểu `200GB`.

Env khuyên dùng:

```env
LLM_MODEL=Qwen/Qwen3-14B
LLM_SERVED_MODEL_NAME=qwen3-14b-interview
API_TOKEN=<token-tu-dat>
DTYPE=bfloat16
GPU_MEMORY_UTILIZATION=0.55
MAX_MODEL_LEN=8192
MAX_NUM_SEQS=8

VOXBOX_HF_REPO_ID=Systran/faster-whisper-large-v3
VOXBOX_DEVICE=cuda
DATA_DIR=/models/whisper

TTS_DEVICE=cuda
TTS_MODE=standard
TTS_BACKBONE_REPO=pnnbao-ump/VieNeu-TTS-0.3B
TTS_GPU_MEM_FRACTION=0.15
HF_HOME=/models/huggingface
```

Sau khi FPT cấp endpoint cho từng port, trỏ app:

```env
AI_LLM_BASE_URL=https://<fpt-port-8000-endpoint>/v1
AI_LLM_MODEL=qwen3-14b-interview
AI_LLM_API_KEY=<token-tu-dat>
AI_RESUME_LLM_MODEL=qwen3-14b-interview

AI_STT_BASE_URL=https://<fpt-port-8080-endpoint>/v1
AI_STT_MODEL=Systran/faster-whisper-large-v3
AI_STT_LANGUAGE=vi

AI_TTS_BASE_URL=https://<fpt-port-8298-endpoint>/v1
AI_TTS_DEFAULT_VOICE=Bình (nam miền Bắc)
```

Nếu bị out-of-memory, giảm `GPU_MEMORY_UTILIZATION`, dùng model LLM nhỏ hơn, hoặc tách lại thành 3 containers riêng.

### LLM

Ưu tiên đơn giản nhất: dùng FPT AI Inference nếu model hỗ trợ được JSON output và tool calling mà app cần. Khi đó không cần tự host LLM GPU.

```env
AI_LLM_BASE_URL=https://mkp-api.fptcloud.com
AI_LLM_MODEL=<model-id-tren-marketplace>
AI_LLM_API_KEY=<fpt-ai-marketplace-api-key>
AI_RESUME_LLM_MODEL=<model-id-tren-marketplace>
```

Nếu muốn tự host LLM bằng GPU Container:

- Template: `vllm-openai-v0.10.1`.
- HTTP port: `8000`.
- Env tối thiểu: `API_TOKEN`, `HUGGING_FACE_HUB_TOKEN` nếu model cần, `MODEL=<hf-model-id>`.
- YAML import mẫu: `infra/fpt-gpu/square-vllm.yaml`.
- App config:

```env
AI_LLM_BASE_URL=https://<fpt-vllm-endpoint>/v1
AI_LLM_MODEL=<hf-model-id-hoac-model-alias>
AI_LLM_API_KEY=<API_TOKEN>
AI_RESUME_LLM_MODEL=<hf-model-id-hoac-model-alias>
```

Test:

```powershell
curl https://<fpt-vllm-endpoint>/v1/models -H "Authorization: Bearer <API_TOKEN>"
```

### STT Whisper

Custom image:

```text
registry.fke.fptcloud.com/<registry-id>/square-whisper:<tag>
```

GPU Container settings:

- Instance: bắt đầu với `GPU-H100-1`.
- HTTP ports: `8080`.
- Persistent disk mount: `/data`.
- Env:

```env
VOXBOX_HF_REPO_ID=Systran/faster-whisper-large-v3
VOXBOX_DEVICE=cuda
DATA_DIR=/data
```

App config:

```env
AI_STT_BASE_URL=https://<fpt-whisper-endpoint>/v1
AI_STT_MODEL=Systran/faster-whisper-large-v3
AI_STT_LANGUAGE=vi
```

Test:

```powershell
curl https://<fpt-whisper-endpoint>/v1/models
```

### TTS VieNeu

Custom image:

```text
registry.fke.fptcloud.com/<registry-id>/square-vieneu-tts:<tag>
```

GPU Container settings:

- Instance: bắt đầu với `GPU-H100-1`.
- HTTP ports: `8298`.
- Persistent disk mount: `/root/.cache/huggingface`.
- Env:

```env
PORT=8298
TTS_DEVICE=cuda
TTS_MODE=standard
TTS_BACKBONE_REPO=pnnbao-ump/VieNeu-TTS-0.3B
TTS_GPU_MEM_FRACTION=0.65
HF_HOME=/root/.cache/huggingface
```

App config:

```env
AI_TTS_BASE_URL=https://<fpt-tts-endpoint>/v1
AI_TTS_DEFAULT_VOICE=Bình (nam miền Bắc)
```

Test:

```powershell
curl https://<fpt-tts-endpoint>/health
curl https://<fpt-tts-endpoint>/v1/voices
```

## Cấu hình web stack

Trong `.env` của server chạy app chính, đặt các endpoint public do FPT GPU Container cấp:

```env
AI_LLM_BASE_URL=https://<llm-endpoint>/v1
AI_LLM_MODEL=<model>
AI_LLM_API_KEY=<token-neu-co>
AI_RESUME_LLM_MODEL=<model>

AI_STT_BASE_URL=https://<whisper-endpoint>/v1
AI_STT_MODEL=Systran/faster-whisper-large-v3
AI_STT_LANGUAGE=vi

AI_TTS_BASE_URL=https://<tts-endpoint>/v1
AI_TTS_DEFAULT_VOICE=Bình (nam miền Bắc)

LIVEKIT_URL=http://livekit:7880
LIVEKIT_PUBLIC_URL=wss://<domain>/livekit
NEXT_PUBLIC_LIVEKIT_URL=wss://<domain>/livekit
```

Sau đó chạy web stack không bật profile `gpu`:

```powershell
docker compose --env-file .env up -d --build
```

Kiểm tra từ backend:

```powershell
curl https://<domain>/api/ai/health/
curl https://<domain>/api/ai/chat/ -H "Content-Type: application/json" -d "{\"message\":\"Xin chào\"}"
```

## YAML import mẫu

FPT Cloud đang dùng schema import dạng `gpu_instance`, `image_setting`, `access_container`, `advanced_settings`.

Cho luồng phỏng vấn AI theo `.env` hiện tại, import file all-in-one:

```text
infra/fpt-gpu/square-ai-all-in-one.yaml
```

Trước khi import, thay các placeholder `<registry-id>`, `<registry-user>`, `<registry-token>` và `<token-tu-dat>`.

```yaml
name: square-ai-interview
gpu_instance: "1xH100"

image_setting:
  image_url: registry.fke.fptcloud.com/<registry-id>/square-ai-all-in-one
  image_tag: latest
  image_user: "<registry-user>"
  image_password: "<registry-token>"

access_container:
  tcp_ports: []
  http_ports:
    - 8000
    - 8080
    - 8298

advanced_settings:
  persistent_disk:
    mount_capacity: 200
    mount_path: /models
  environment_variables:
    - key: LLM_MODEL
      value: Qwen/Qwen3-14B
    - key: LLM_SERVED_MODEL_NAME
      value: qwen3-14b-interview
    - key: API_TOKEN
      value: "<token-tu-dat>"
    - key: HF_HOME
      value: /models/huggingface
    - key: VLLM_DOWNLOAD_DIR
      value: /models/huggingface
    - key: DTYPE
      value: bfloat16
    - key: GPU_MEMORY_UTILIZATION
      value: "0.55"
    - key: MAX_MODEL_LEN
      value: "8192"
    - key: MAX_NUM_SEQS
      value: "8"
    - key: VOXBOX_HF_REPO_ID
      value: Systran/faster-whisper-large-v3
    - key: VOXBOX_DEVICE
      value: cuda
    - key: DATA_DIR
      value: /models/whisper
    - key: TTS_DEVICE
      value: cuda
    - key: TTS_MODE
      value: standard
    - key: TTS_BACKBONE_REPO
      value: pnnbao-ump/VieNeu-TTS-0.3B
    - key: TTS_GPU_MEM_FRACTION
      value: "0.15"
    - key: STT_STARTUP_DELAY_SECONDS
      value: "30"
    - key: TTS_STARTUP_DELAY_SECONDS
      value: "60"
  startup_commands:
    cmd:
    args:
```

Sau khi FPT cấp endpoint, copy mẫu app env:

```text
infra/fpt-gpu/app-env.all-in-one.env
```

Với template `NVIDIA Pytorch 25.03`, không nhập `-lc exec ...` vào ô Arguments trên UI vì FPT có thể truyền nó thành một argument duy nhất làm `/bin/bash` báo `invalid option`. Hãy để `Command` và `Arguments` trống, chờ container `Running`, rồi upload/run bootstrap qua SSH:

```powershell
.\infra\fpt-gpu\upload-bootstrap-to-fpt.ps1 -HostName tcp-endpoint.serverless.fptcloud.com -Port <tcp-port>
```

Nếu muốn tách 3 container riêng, các file vẫn có sẵn:

```text
infra/fpt-gpu/square-vllm.yaml
infra/fpt-gpu/square-whisper.yaml
infra/fpt-gpu/square-vieneu-tts.yaml
```

## Lưu ý vận hành

- FPT giới hạn tối đa 10 GPU Containers mỗi tenant.
- HTTP/TCP ports được khai báo lúc tạo container; mỗi loại tối đa 10 ports/container.
- Dữ liệu trên temporary disk mất khi stop/restart; model/cache nên đặt vào persistent disk.
- Container vẫn bị tính phí khi ở trạng thái running kể cả idle; stop/delete theo nhu cầu.
- Không chạy Docker-in-Docker trong GPU Container, nên không dùng `docker compose` bên trong GPU Container.

## Nguồn FPT

- GPU Container overview: https://ai-docs.fptcloud.com/ai-infrastructure/gpu-container
- Create container / YAML import: https://ai-docs.fptcloud.com/ai-infrastructure/gpu-container/tutorials/how-to-create-a-container
- Container Registry login/tag/push: https://docs.fptcloud.com/en/container-registry/tutorials/2.-docker-login và https://docs.fptcloud.com/en/container-registry/tutorials/3.-tag-and-push-image-to-fpt-container-registry
- vLLM use case: https://ai-docs.fptcloud.com/ai-infrastructure/gpu-container/use-cases/vllm-use-case
- Storage: https://ai-docs.fptcloud.com/ai-infrastructure/gpu-container/tutorials/how-to-manage-storage
- FAQ: https://ai-docs.fptcloud.com/ai-infrastructure/gpu-container/faq
