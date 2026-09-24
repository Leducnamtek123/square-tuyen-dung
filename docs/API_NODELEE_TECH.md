# Tài Liệu Hệ Thống Voice AI Gateway (api.nodelee.tech)

Tài liệu lưu trữ thông tin cấu hình, kiến trúc, và đặc tả API của cụm máy chủ Voice AI tự host trên hạ tầng GPU riêng biệt của NodeLee Tech.

---

## 1. Thông Tin Kết Nối Tổng Quan

* **Domain chính**: `api.voice.internal` (hoặc `api.metaconnect.vn`)
* **IP Public WAN**: `198.51.100.18` (Documentation IP)
* **IP LAN máy chủ GPU**: `192.168.1.xxx`
* **Cổng bảo mật HTTPS**: `4433` *(External: 4433 -> Internal: 443)*
* **Cổng HTTP nội bộ/backup**: `8181` *(External: 8181 -> Internal: 80)*
* **Base URL chính thức**: `https://api.metaconnect.vn/v1`
* **Base URL phụ (HTTP)**: `http://localhost:8181/v1`
* **API Key xác thực (Bearer Token)**:
  ```text
  sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
* **Cơ chế ẩn danh (Stealth)**: Cổng 80 và 443 mặc định của IP ngoài bị đóng hoàn toàn đối với bot/người ngoài quét cổng. Chỉ các client gọi đúng cổng `4433` hoặc `8181` mới tới được Nginx Gateway.

---

## 2. Kiến Trúc Dịch Vụ Phía Sau

| Thành phần | Công nghệ / Mô hình | Port nội bộ | Nhiệm vụ |
| :--- | :--- | :--- | :--- |
| **Gateway** | Nginx 1.28.1 (Reverse Proxy + Auth Header Check) | `80`, `443` | Tiếp nhận request, xác thực Bearer token, định tuyến tới STT/TTS |
| **STT Engine** | `faster-whisper-large-v3-turbo-ct2` (VoxBox) | `8080` | Nhận diện giọng nói tiếng Việt thời gian thực (ASR) |
| **TTS Engine** | `pnnbao-ump/VieNeu-TTS-v3-Turbo` (FastAPI + PyTorch) | `8298` | Sinh giọng nói tiếng Việt tự nhiên (Neural TTS) |

### Mô hình hỗ trợ (Model IDs):
* **STT**: `asr-vi`, `whisper-large-v3-turbo`
* **TTS**: `tts-vi`, `vieneu-tts-v3-turbo`
* **Voices hỗ trợ**: `Trúc Ly` (hoặc `Ly`), `Mai Anh`, `Thanh Bình`

---

## 3. Danh Sách Endpoint & Lệnh Kiểm Tra Mẫu (cURL)

### 3.1. Health Check
```bash
curl -k -i https://api.nodelee.tech:4433/health
```
**Phản hồi kỳ vọng**:
```json
{"status": "ok"}
```

### 3.2. Danh sách Models (`/v1/models`)
```bash
curl -k -i https://api.metaconnect.vn/v1/models \
  -H "Authorization: Bearer sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3.3. Sinh giọng nói tiếng Việt (`/v1/audio/speech`)
```bash
curl -k -X POST https://api.metaconnect.vn/v1/audio/speech \
  -H "Authorization: Bearer sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-vi",
    "input": "Xin chào! Hệ thống InfoHR AI đã hoạt động thành công.",
    "voice": "Trúc Ly",
    "response_format": "mp3"
  }' \
  --output test_tts.mp3
```

### 3.4. Nhận dạng giọng nói tiếng Việt (`/v1/audio/transcriptions`)
```bash
curl -k -X POST https://api.metaconnect.vn/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -F "file=@test_tts.mp3" \
  -F "model=asr-vi" \
  -F "language=vi"
```
**Phản hồi kỳ vọng**:
```json
{"text": "Xin chào, hệ thống InfoHR AI đã hoạt động thành công."}
```

---

## 4. Benchmark Hiệu Năng Đo Kiểm Thực Tế

* **Ping / Round-Trip Time**: ~`4ms` (Mạng nội địa Việt Nam)
* **STT Latency**: ~`0.53s – 0.70s` cho audio dài 4-7 giây (nhanh hơn gấp nhiều lần so với gọi API quốc tế).
* **TTS Latency**: ~`1.7s` cho câu ngắn, `3.2s` cho câu dài (hỗ trợ streaming chunking qua WebRTC với Time-To-First-Audio ~`300ms`).

---

## 5. Cấu Hình Khi Chuyển Sang Sử Dụng Trong InfoHR Tuyển Dụng

Khi muốn kích hoạt lại server này, chỉ cần thay đổi trong file `.env`:

```env
# --- Voice & TTS/STT (AI GPU Gateway) ---
STT_PROVIDER=whisper
STT_BASE_URL=https://api.metaconnect.vn/v1
STT_API_KEY=sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STT_MODEL=asr-vi
STT_LANGUAGE=vi
AI_STT_BASE_URL=https://api.metaconnect.vn/v1
AI_STT_API_KEY=sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_STT_MODEL=asr-vi
AI_STT_LANGUAGE=vi

TTS_PROVIDER=metaconnect
TTS_BASE_URL=https://api.metaconnect.vn/v1
TTS_API_KEY=sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TTS_MODEL=tts-vi
TTS_VOICE=Trúc Ly
AI_TTS_BASE_URL=https://api.metaconnect.vn/v1
AI_TTS_API_KEY=sk-ai-voice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_TTS_MODEL=tts-vi
AI_TTS_DEFAULT_VOICE=Trúc Ly
```

Và chạy lệnh reload container:
```bash
docker compose up -d --no-deps backend livekit-agent celery-worker
```
