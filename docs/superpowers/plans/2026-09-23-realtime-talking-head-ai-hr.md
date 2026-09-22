# Real-Time Talking Head AI HR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống Người Ảo Tuyển Dụng AI thời gian thực độ nét cao: đồng bộ khẩu hình âm vị (Wav2Lip GPU + 4 thuật toán xử lý ảnh từ `opc007/ai-digital-human`), trình chiếu Seamless Dual-Buffering 0-frame đen tại Next.js Frontend, kết nối âm thanh Cloud `api.metaconnect.vn/v1`, và bộ cấu hình NTD chuyên nghiệp.

**Architecture:** 
1. Service backend độc lập `voice-ai/talking-head/` (FastAPI) chạy 100% trên GPU RTX 4070 Ti 16GB, thực hiện suy luận Wav2Lip + Soft Elliptical Mouth Mask + Reinhard LAB Color Match + Unsharp Masking 0.35 + Direct Memory Pipe vào FFmpeg.
2. Tầng Cloud `https://api.metaconnect.vn/v1` cung cấp STT/LLM/TTS tiếng Việt chuẩn.
3. Frontend Next.js 16 (`InterviewAvatar.tsx`) sử dụng cơ chế Dual-Buffering 2 lớp video (`#idleVideo` & `#speakVideo`) chuyển cảnh 0.12s không nháy đen kèm Máy trạng thái cử chỉ (`wave` ➔ `idle` ➔ `nod` ➔ `thinking` ➔ `speaking` ➔ `thanks_wave`).
4. Giao diện NTD (`EmployerAiSettingsCard`) quản lý video hành động, giọng đọc và HR Persona.

**Tech Stack:** Python 3.10+, PyTorch CUDA, OpenCV, FastAPI, FFmpeg, Next.js 16, React 19, TypeScript, Material-UI, Tailwind CSS v4.

**Spec:** [`docs/superpowers/specs/2026-09-23-realtime-talking-head-ai-hr-design.md`](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/superpowers/specs/2026-09-23-realtime-talking-head-ai-hr-design.md)

## Global Constraints

- Không chạy local Ollama hay Local TTS vì đã có `https://api.metaconnect.vn/v1`.
- Dành trọn vẹn GPU RTX 4070 Ti 16GB cho Wav2Lip Lipsync GPU Inference và bộ lọc OpenCV.
- Bảo toàn 100% da má, cằm, mắt, tóc và nền 1080p/720p gốc bằng Soft Elliptical Mouth Mask (`cv2.GaussianBlur`).
- Khử sạch bợt màu son/môi bằng Reinhard LAB Color Transfer.
- Bơm raw frames trực tiếp từ RAM vào FFmpeg stdin (`-c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p`), tuyệt đối không dùng codec trung gian `mp4v`.
- Không gán cứng `-colorspace bt709` trên FFmpeg để đồng nhất ma trận sRGB với video idle.
- Frontend phải dùng 2 thẻ video lồng nhau crossfade 0.12s, triệt tiêu 100% hiện tượng chớp đen khi nạp video câu trả lời.
- Giữ nguyên toàn bộ chú thích tiếng Việt và tôn trọng quy chuẩn monorepo `AGENTS.md`.

---

## File Structure & Responsibilities

### Backend (`voice-ai/talking-head/`)
- `voice-ai/talking-head/server.py`: FastAPI server cung cấp REST endpoints `/api/v1/avatar/health`, `/api/v1/avatar/characters`, `/api/v1/avatar/lipsync/render`.
- `voice-ai/talking-head/core/image_postprocess.py`: Các thuật toán xử lý ảnh (Soft Elliptical Mouth Mask, Reinhard LAB Color Transfer, Unsharp Masking).
- `voice-ai/talking-head/core/ffmpeg_pipe.py`: Bơm trực tiếp raw BGR24 frames từ RAM sang FFmpeg subprocess stdin.
- `voice-ai/talking-head/core/lipsync_engine.py`: Điều phối Wav2Lip GPU inference, nạp `.coords_256.npy` và xuất file MP4.
- `voice-ai/talking-head/core/models/wav2lip.py`: Kiến trúc mạng nơ-ron Wav2Lip PyTorch.
- `voice-ai/talking-head/data/avatars/ng_c_linh/actions/`: Lưu trữ các file video `idle.mp4`, `nod.mp4`, `thinking.mp4`, `wave.mp4`, `thanks_wave.mp4` và file tọa độ `.coords_256.npy`.

### Frontend (`frontend/src/`)
- `frontend/src/services/avatarService.ts`: Service gọi API tới `voice-ai/talking-head` để lấy danh sách character và trigger render lipsync.
- `frontend/src/services/employerAiSettingService.ts`: Mở rộng kiểu dữ liệu `EmployerAiSettings` để lưu trữ Action Videos, HR Persona System Prompt, và Giọng đọc.
- `frontend/src/views/components/employers/EmployerAiSettingsCard/index.tsx`: Bàn làm việc NTD cấu hình video hành động (có Live Preview), giọng đọc MetaConnect và HR Persona.
- `frontend/src/views/interviewPages/components/avatar/InterviewAvatar.tsx`: Component trình chiếu Dual-Buffering 2 thẻ `<video>` lồng nhau, CSS crossfade 0.12s, Action State Machine.
- `frontend/src/views/interviewPages/components/avatar/avatarStates.ts`: Mở rộng định nghĩa trạng thái video và đường dẫn video hành động.

---

### Task 1: Xây Dựng Bộ Xử Lý Ảnh Lipsync HD & Direct Memory Pipe (`voice-ai/talking-head/core/`)

**Files:**
- Create: `voice-ai/talking-head/core/__init__.py`
- Create: `voice-ai/talking-head/core/image_postprocess.py`
- Create: `voice-ai/talking-head/core/ffmpeg_pipe.py`
- Create: `voice-ai/talking-head/tests/test_image_postprocess.py`

**Interfaces:**
- Produces:
  - `apply_soft_elliptical_mask(orig_frame: np.ndarray, ai_mouth_crop: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray`
  - `reinhard_lab_color_transfer(orig_roi: np.ndarray, ai_roi: np.ndarray) -> np.ndarray`
  - `unsharp_mask(image: np.ndarray, strength: float = 0.35) -> np.ndarray`
  - `stream_frames_to_ffmpeg(frames: list[np.ndarray], audio_path: str, output_path: str, fps: int = 25, width: int = 1280, height: int = 720) -> str`

- [ ] **Step 1: Viết test cho bộ lọc ảnh (Soft mask, LAB transfer, Unsharp)**
- [ ] **Step 2: Chạy test để xác nhận test ban đầu fail**
- [ ] **Step 3: Cài đặt `image_postprocess.py` và `ffmpeg_pipe.py` theo chuẩn `opc007/ai-digital-human`**
- [ ] **Step 4: Chạy lại test để xác nhận pass 100%**
- [ ] **Step 5: Commit mã nguồn Task 1**

---

### Task 2: Cài Đặt Engine Wav2Lip GPU & FastAPI Lipsync Service (`voice-ai/talking-head/`)

**Files:**
- Create: `voice-ai/talking-head/core/models/wav2lip.py`
- Create: `voice-ai/talking-head/core/lipsync_engine.py`
- Create: `voice-ai/talking-head/server.py`
- Create: `voice-ai/talking-head/requirements.txt`
- Create: `voice-ai/talking-head/tests/test_server_api.py`

**Interfaces:**
- Consumes: `apply_soft_elliptical_mask`, `reinhard_lab_color_transfer`, `unsharp_mask`, `stream_frames_to_ffmpeg` từ Task 1.
- Produces:
  - `class LipSyncEngine`: Phương thức `infer_and_render(audio_path, video_path, coords_path, output_path) -> str`
  - REST API `POST /api/v1/avatar/lipsync/render` nhận `{ audio_url, avatar_id, base_action }` -> trả `{ video_url, duration_sec, inference_time_ms }`
  - REST API `GET /api/v1/avatar/characters` -> trả danh sách nhân vật và trạng thái các clip hành động.

- [ ] **Step 1: Viết test cho API FastAPI (`test_server_api.py`)**
- [ ] **Step 2: Cài đặt Wav2Lip model architecture và `lipsync_engine.py` tích hợp weights và landmark caching**
- [ ] **Step 3: Cài đặt FastAPI `server.py` với CORS, static mount cho video output và media assets**
- [ ] **Step 4: Khởi chạy test xác nhận pass các endpoints API**
- [ ] **Step 5: Commit mã nguồn Task 2**

---

### Task 3: Bàn Làm Việc Nhà Tuyển Dụng (NTD Setup Workbench) tại Frontend

**Files:**
- Modify: `frontend/src/services/employerAiSettingService.ts`
- Create: `frontend/src/services/avatarService.ts`
- Modify: `frontend/src/views/components/employers/EmployerAiSettingsCard/index.tsx`
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/ActionVideosManager.tsx`
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/HrPersonaSelector.tsx`

**Interfaces:**
- Consumes: API `/api/v1/avatar/characters` từ Task 2, API TTS từ `api.metaconnect.vn/v1`.
- Produces:
  - `EmployerAiSettings` mở rộng các trường: `avatarActions`, `hrPersonaPreset`, `customSystemPrompt`.
  - Component `ActionVideosManager`: Xem trước video 5 action clips (`idle`, `nod`, `thinking`, `wave`, `thanks_wave`).
  - Component `HrPersonaSelector`: Chọn 3 preset HR Persona (Thân thiện, Chuyên nghiệp, Đào sâu) và tùy biến Prompt.

- [ ] **Step 1: Cập nhật interface `EmployerAiSettings` trong `employerAiSettingService.ts`**
- [ ] **Step 2: Xây dựng `avatarService.ts` gọi service `voice-ai/talking-head`**
- [ ] **Step 3: Xây dựng component `ActionVideosManager` và `HrPersonaSelector`**
- [ ] **Step 4: Tích hợp vào `EmployerAiSettingsCard/index.tsx` và test lưu trữ `localStorage` / backend API**
- [ ] **Step 5: Commit mã nguồn Task 3**

---

### Task 4: Nâng Cấp Player Trình Chiếu Seamless Dual-Buffering (`InterviewAvatar.tsx`)

**Files:**
- Modify: `frontend/src/views/interviewPages/components/avatar/avatarStates.ts`
- Modify: `frontend/src/views/interviewPages/components/avatar/AvatarStateController.tsx`
- Modify: `frontend/src/views/interviewPages/components/avatar/InterviewAvatar.tsx`
- Create: `frontend/src/views/interviewPages/components/avatar/InterviewAvatarVideo.module.css`

**Interfaces:**
- Consumes: Action video URLs (`idle`, `nod`, `thinking`, `wave`, `thanks_wave`) và lipsync speaking video URLs từ Task 2 & Task 3.
- Produces:
  - Component `InterviewAvatar.tsx` hoàn toàn mới: Dual-buffering 2 thẻ `<video>`, CSS crossfade 0.12s, triệt tiêu 100% màn hình đen.
  - Bộ điều khiển máy trạng thái `ActionStateMachine` (`wave` ➔ `idle` ➔ `nod` ➔ `thinking` ➔ `speaking` ➔ `thanks_wave`).

- [ ] **Step 1: Mở rộng `avatarStates.ts` bổ sung các định nghĩa video hành động và mapping**
- [ ] **Step 2: Viết module CSS `InterviewAvatarVideo.module.css` với lớp `stage-idle` và `stage-speak` crossfade 0.12s**
- [ ] **Step 3: Cài đặt 2 thẻ `<video>` lồng nhau trong `InterviewAvatar.tsx` với các sự kiện `onloadeddata` và `onended`**
- [ ] **Step 4: Kết nối luồng `thinking.mp4` khi chờ kết quả và kích hoạt `speakVideo` mượt mà**
- [ ] **Step 5: Commit mã nguồn Task 4**

---

### Task 5: Tích Hợp Toàn Diện, Kiểm Thử Khẩu Hình & Build Verification

**Files:**
- Modify: `voice-ai/compose-up.ps1` hoặc `docker-compose.gpu.yml` (bổ sung service `talking-head`)
- Create: `voice-ai/talking-head/tests/test_e2e_lipsync.py`
- Test: `pnpm run lint` & `pnpm run build` trong `frontend/`

- [ ] **Step 1: Chạy test E2E cho pipeline render Lipsync GPU với file audio test**
- [ ] **Step 2: Kiểm tra độ trễ render trên GPU RTX 4070 Ti (< 450ms)**
- [ ] **Step 3: Chạy lint và build kiểm tra TypeScript tại `frontend/`**
- [ ] **Step 4: Kiểm tra trực quan bằng mắt: 0 chớp đen, màu sắc da môi đồng nhất**
- [ ] **Step 5: Hoàn tất commit và lập báo cáo nghiệm thu**
