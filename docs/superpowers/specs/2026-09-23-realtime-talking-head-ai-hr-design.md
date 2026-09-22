# Thiết Kế Kỹ Thuật: Hệ Thống Người Ảo Tuyển Dụng & Phỏng Vấn AI Thời Gian Thực (Real-Time Talking Head AI HR)

> **Tài liệu**: Technical Design Specification  
> **Dự án**: Square Tuyển Dụng (InfoHR)  
> **Ngày lập**: 2026-09-23  
> **Trạng thái**: Draft / Chờ Duyệt  
> **Tham chiếu nguồn**:
> - `https://github.com/opc007/ai-digital-human`
> - `https://github.com/lipku/LiveTalking`

---

## 1. Tổng Quan & Mục Tiêu Dự Án

### 1.1 Hiện trạng
Phòng phỏng vấn tuyển dụng AI (`/interview/`) hiện đang sử dụng cơ chế hiển thị 2.5D ghép từ các chuỗi khung hình tĩnh/ảnh WebP lặp theo chu kỳ thời gian (`InterviewAvatar.tsx`). Cơ chế này tồn tại các nhược điểm:
- Khẩu hình miệng không đồng bộ theo từng âm vị phát ra của câu hỏi (chưa sync mồm).
- Cử động bị giật cục và chuyển cảnh cứng khi đổi trạng thái (từ chờ sang nói).
- Chưa tận dụng được các video hành động thật có độ phân giải cao và tính tự nhiên của nhân vật.

### 1.2 Mục tiêu nâng cấp
Thay thế hoàn toàn cơ chế ghép ảnh 2D cũ bằng **Người Ảo Tuyển Dụng AI Độ Nét Cao (Full HD 1080p/720p)**:
1. **Khẩu hình đồng bộ âm vị (Lip-Sync Precision):** Miệng cử động khớp từng từ ngữ tiếng Việt phát ra từ hệ thống TTS.
2. **Khử bợt màu & làm nét chi tiết:** Kế thừa 4 thuật toán xử lý ảnh chuyên sâu từ `opc007/ai-digital-human` (Mặt nạ elip mềm, Cân bằng màu LAB, Unsharp masking, Direct Memory Pipe FFmpeg).
3. **Trình chiếu 0 frame đen (Zero-Flicker Dual-Buffering):** Xếp chồng 2 lớp video (`video#idleVideo` và `video#speakVideo`) chuyển cảnh crossfade 0.12s, loại bỏ 100% hiện tượng chớp đen khi GPU giải mã video mới.
4. **Vòng đời cử chỉ sinh động (Action State Machine):** Chuyển đổi mượt mà giữa các cử động: `wave` (chào đón) ➔ `idle` (chờ/lắng nghe) ➔ `nod` (gật đầu tán đồng) ➔ `thinking` (suy nghĩ trong lúc chờ AI) ➔ `speaking` (nói lipsync) ➔ `thanks_wave` (chào tạm biệt).
5. **Bàn làm việc Nhà tuyển dụng (NTD Setup Workbench):** Cho phép NTD cấu hình video hành động, lựa chọn giọng đọc từ `api.metaconnect.vn`, và tùy biến HR Persona/System Prompt chuyên nghiệp.
6. **Tối ưu hóa hạ tầng phần cứng:**
   - Sử dụng hạ tầng Cloud có sẵn `https://api.metaconnect.vn/v1` cho STT, LLM và TTS tiếng Việt.
   - Dành trọn vẹn GPU cục bộ **NVIDIA GeForce RTX 4070 Ti (16GB VRAM)** độc quyền cho Engine Lipsync Wav2Lip, đạt thời gian render thần tốc (< 350ms cho câu nói 3–5 giây).

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

```text
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                      TẦNG GIAO DIỆN (FRONTEND NEXT.JS 16)                       │
 │                                                                                 │
 │  [Trang NTD Cấu hình AI]                       [Phòng Phỏng Vấn AI - Ứng viên]  │
 │  • Quản lý Video Hành động                     • Dual-Buffering Video Player    │
 │    (idle, nod, thinking, wave...)                (#idleVideo & #speakVideo)     │
 │  • Chọn Giọng & Tốc độ TTS                     • State Machine Controller       │
 │  • Cấu hình HR System Prompt & Persona         • Giao tiếp REST / WebSocket     │
 └───────────────────────┬───────────────────────────────────────▲─────────────────┘
                         │ 1. Lấy Config                         │ 5. Nhận Video URL
                         ▼                                       │    & Play Dual-Buffer
 ┌───────────────────────────────────────────────┐               │
 │  CLOUD AI ENGINE (API.METACONNECT.VN/V1)      │               │
 │  • STT: Nhận diện giọng nói ứng viên tiếng Việt│               │
 │  • LLM: Gemini / Qwen sinh câu hỏi HR súc tích│               │
 │  • TTS: VieNeu-TTS xuất audio .wav 16kHz mono │               │
 └───────────────────────┬───────────────────────┘               │
                         │ 2. Audio .wav                         │
                         ▼                                       │
 ┌───────────────────────────────────────────────────────────────┴─────────────────┐
 │            DỊCH VỤ LIPSYNC GPU (VOICE-AI/TALKING-HEAD - FASTAPI & CUDA)         │
 │                                                                                 │
 │  3. Wav2Lip Inference (Chạy 100% trên RTX 4070 Ti 16GB VRAM):                   │
 │     • Input: Audio .wav + Video hành động gốc (`ng_c_linh`) + `.coords_256.npy` │
 │     • Output: Mảng raw frames miệng khẩu hình dự đoán                           │
 │                                                                                 │
 │  4. Bộ lọc Xử lý ảnh Đỉnh cao (Kế thừa từ `opc007/ai-digital-human`):           │
 │     • Soft Elliptical Mouth Mask (cv2.GaussianBlur, giữ 100% da má & cằm gốc)   │
 │     • Reinhard LAB Color Transfer (khử bợt màu son và tái da)                   │
 │     • Unsharp Masking 0.35 (làm nét cử động răng & viền môi)                    │
 │     • Direct Memory Pipe sang FFmpeg stdin (H.264 CRF 17, 0 suy hao nén kép)    │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phân Rã Chi Tiết Các Module

### 3.1 Module Lipsync GPU (`voice-ai/talking-head/`)

- **Đường dẫn thư mục**: `voice-ai/talking-head/`
- **Công nghệ**: Python 3.10+, PyTorch CUDA, OpenCV, FastAPI, FFmpeg.
- **Trọng số mô hình (Weights)**:
  - `models/wav2lip.pth` (kế thừa từ `lipku/LiveTalking`).
  - Face detection landmarks `.coords_256.npy` trích xuất sẵn theo từng clip hành động.
- **Cấu trúc tệp tin**:
  ```text
  voice-ai/talking-head/
  ├── server.py                   # FastAPI app: endpoints render lipsync, assets, health
  ├── core/
  │   ├── lipsync_engine.py       # Wav2Lip model runner + direct memory pipe
  │   ├── image_postprocess.py    # Elliptical mask, LAB color match, Unsharp mask
  │   └── ffmpeg_pipe.py          # Direct subprocess stdin pipe to FFmpeg H.264
  ├── data/
  │   └── avatars/
  │       └── ng_c_linh/
  │           └── actions/        # idle.mp4, nod.mp4, thinking.mp4, wave.mp4, coords_256.npy
  ├── requirements.txt
  └── Dockerfile
  ```

#### Chi tiết 4 thuật toán xử lý hình ảnh:
1. **Mặt nạ elip mềm (*Soft Elliptical Mouth Mask*):**
   ```python
   # Chỉ tác động lên đúng vùng elip quanh miệng, bảo toàn 100% da mặt gốc
   mask = np.zeros((crop_h, crop_w), dtype=np.float32)
   center = (int(crop_w * 0.5), int(crop_h * 0.55))
   axes = (int(crop_w * 0.42), int(crop_h * 0.35))
   cv2.ellipse(mask, center, axes, 0, 0, 360, 1.0, -1)
   mask = cv2.GaussianBlur(mask, (19, 19), 5)
   ```
2. **Cân bằng màu môi theo hệ LAB (*Reinhard Color Transfer*):**
   ```python
   # Match Mean & Variance giữa frame gốc và frame AI trong không gian L*a*b*
   orig_lab = cv2.cvtColor(orig_roi, cv2.COLOR_BGR2LAB).astype(np.float32)
   ai_lab = cv2.cvtColor(ai_roi, cv2.COLOR_BGR2LAB).astype(np.float32)
   for c in range(3):
       mu_orig, std_orig = orig_lab[:, :, c].mean(), orig_lab[:, :, c].std() + 1e-5
       mu_ai, std_ai = ai_lab[:, :, c].mean(), ai_lab[:, :, c].std() + 1e-5
       ai_lab[:, :, c] = ((ai_lab[:, :, c] - mu_ai) * (std_orig / std_ai)) + mu_orig
   ai_matched = cv2.cvtColor(np.clip(ai_lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
   ```
3. **Làm nét chi tiết (*Unsharp Masking*):**
   ```python
   # Giúp răng và viền môi rõ nét
   gaussian = cv2.GaussianBlur(ai_matched, (5, 5), 1.0)
   ai_sharp = cv2.addWeighted(ai_matched, 1.35, gaussian, -0.35, 0)
   ```
4. **Bơm trực tiếp RAM vào FFmpeg Stdin (*Direct Memory Pipe*):**
   ```python
   cmd = [
       "ffmpeg", "-y",
       "-f", "rawvideo", "-vcodec", "rawvideo",
       "-s", f"{w}x{h}", "-pix_fmt", "bgr24", "-r", "25",
       "-i", "-",
       "-i", str(audio_path),
       "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-shortest",
       str(output_path)
   ]
   proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
   for frame in processed_frames:
       proc.stdin.write(frame.tobytes())
   proc.stdin.close()
   proc.wait()
   ```

---

### 3.2 Tầng Trình Chiếu Frontend Dual-Buffering (`InterviewAvatar.tsx`)

- **Vị trí**: `frontend/src/views/interviewPages/components/avatar/InterviewAvatar.tsx`
- **Cấu trúc DOM 2 lớp không gián đoạn**:
  ```tsx
  <div className="interview-avatar-stage">
    {/* Lớp A: Video Chờ / Cử chỉ (Loop ngầm) */}
    <video
      ref={idleVideoRef}
      className="stage-video stage-idle"
      src={currentActionSrc} // idle.mp4 | nod.mp4 | thinking.mp4 | wave.mp4
      autoPlay
      loop={currentAction === 'idle'}
      muted
      playsInline
    />
    {/* Lớp B: Video Trả lời Lipsync (Fade-in đè lên) */}
    <video
      ref={speakVideoRef}
      className={`stage-video stage-speak ${isSpeakingActive ? 'is-active' : ''}`}
      playsInline
      preload="auto"
      onLoadedData={handleSpeakLoadedData}
      onEnded={handleSpeakEnded}
    />
  </div>
  ```
- **CSS chuyển cảnh mềm mượt 0.12s**:
  ```css
  .interview-avatar-stage {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #0f172a;
  }
  .stage-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .stage-idle {
    z-index: 2;
  }
  .stage-speak {
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s ease-in-out;
  }
  .stage-speak.is-active {
    opacity: 1;
    pointer-events: auto;
  }
  ```

#### Máy Trạng Thái Cử Chỉ (Action State Machine):
1. **`INITIALIZING / READY`**: Phát `wave.mp4` (Vẫy tay chào) ➔ Hết clip tự chuyển sang `idle.mp4` (Thở nhẹ, chớp mắt).
2. **`LISTENING` (Ứng viên đang nói)**: Giữ `idle.mp4`. Nếu câu trả lời dài (> 5 giây), kích hoạt 1 lần `nod.mp4` (Gật đầu ghi nhận) rồi quay lại `idle.mp4`.
3. **`THINKING` (Đang chờ Cloud AI & Lipsync)**: Chuyển sang `thinking.mp4` ngay lập tức (0ms delay). Nhân vật nghiêng đầu, mắt tập trung lắng nghe suy nghĩ.
4. **`SPEAKING` (Đã render xong clip lipsync)**:
   - Gán `src` vào `speakVideo` và gọi `.load()`. Video `thinking.mp4` bên dưới vẫn tiếp tục chạy.
   - Khi sự kiện `onloadeddata` kích hoạt: gọi `speakVideo.play()` và thêm class `.is-active` (fade-in 0.12s che lấp `thinking.mp4`).
   - Khi `onended` kích hoạt: gỡ bỏ class `.is-active` (fade-out 0.12s) và để lộ `idle.mp4` đang chạy bên dưới.
5. **`COMPLETED`**: Phát `thanks_wave.mp4` (Chào cảm ơn ứng viên) ➔ Giữ khung hình kết thúc trang trọng.

---

### 3.3 Bàn Làm Việc Nhà Tuyển Dụng (NTD Setup Workbench)

- **Vị trí**: `frontend/src/views/components/employers/EmployerAiSettingsCard/index.tsx`
- **Dịch vụ cấu hình**: `frontend/src/services/employerAiSettingService.ts`
- **Các tính năng nâng cấp**:
  1. **Quản lý Video Hành Động (Avatar Actions Manager):**
     - Hiển thị lưới nhân vật kèm danh sách 5 file hành động (`idle`, `nod`, `thinking`, `wave`, `thanks_wave`).
     - Cho phép xem trước trực tiếp (Preview Action) từng cử chỉ của nhân vật `ng_c_linh`.
     - Cho phép tải lên hoặc chỉ định đường dẫn video hành động riêng của doanh nghiệp.
  2. **Quản lý Giọng Nói (MetaConnect Cloud Voice Catalog):**
     - Tích hợp trọn bộ giọng tuyển dụng: Trúc Ly (Nữ ấm áp), Thùy Dung (Nữ miền Nam), Mạnh Dũng (Nam đĩnh đạc), Minh Triết (Nam hiện đại).
     - Điều chỉnh tốc độ (0.85x – 1.15x).
     - Nút nghe thử trực tiếp âm thanh từ API `https://api.metaconnect.vn/v1/audio/speech`.
  3. **Cấu hình HR Persona & System Prompt Chuyên Nghiệp:**
     - 3 Presets chuẩn hóa ngành nhân sự:
       - *Thân thiện & Đồng cảm* (Dành cho Fresher, câu hỏi mở, tạo tâm lý thoải mái).
       - *Chuyên nghiệp & Chuẩn mực* (Dành cho Mid/Senior, phương pháp STAR, đánh giá tác động dự án).
       - *Thử thách & Phản biện* (Dành cho Lead/Manager, phỏng vấn tình huống kiến trúc và xử lý khủng hoảng).
     - Hộp thoại tùy chỉnh System Prompt chi tiết:
       - Bắt buộc trả lời súc tích (< 25–30 từ/lượt).
       - Chèn tự động yêu cầu của bản mô tả công việc (JD).

---

## 4. Đặc Tả Giao Diện Lập Trình (API Contracts)

### 4.1 FastAPI Service Lipsync (`voice-ai/talking-head`)

#### Endpoint Render Khẩu Hình:
- **POST** `/api/v1/avatar/lipsync/render`
- **Request Body**:
  ```json
  {
    "audio_url": "https://api.metaconnect.vn/v1/storage/audios/speech_123.wav",
    "avatar_id": "ng_c_linh",
    "base_action": "idle",
    "sample_rate": 16000
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "video_url": "/media/renders/lipsync_ng_c_linh_abc123.mp4",
    "duration_sec": 3.8,
    "inference_time_ms": 320
  }
  ```

#### Endpoint Danh Sách Nhân Vật & Cử Chỉ:
- **GET** `/api/v1/avatar/characters`
- **Response**:
  ```json
  {
    "characters": [
      {
        "id": "ng_c_linh",
        "name": "Ngọc Linh HR",
        "actions": [
          {"name": "idle", "ready": true, "url": "/media/avatars/ng_c_linh/actions/idle.mp4"},
          {"name": "nod", "ready": true, "url": "/media/avatars/ng_c_linh/actions/nod.mp4"},
          {"name": "thinking", "ready": true, "url": "/media/avatars/ng_c_linh/actions/thinking.mp4"},
          {"name": "wave", "ready": true, "url": "/media/avatars/ng_c_linh/actions/wave.mp4"},
          {"name": "thanks_wave", "ready": true, "url": "/media/avatars/ng_c_linh/actions/thanks_wave.mp4"}
        ]
      }
    ]
  }
  ```

---

## 5. Kế Hoạch Kiểm Thử & Định Nghĩa Hoàn Thành (DoD)

### 5.1 Kiểm thử Kỹ thuật (Technical Verification)
1. **GPU Inference Benchmark**: Đo thời gian Wav2Lip + 4 bước xử lý ảnh trên RTX 4070 Ti 16GB. Yêu cầu: Độ trễ $\le 450\text{ms}$ cho câu thoại 4 giây.
2. **Visual Quality & 0-Black-Frame Verification**:
   - Kiểm tra bằng mắt và công cụ kiểm thử: Không xuất hiện bất kỳ khung hình đen nào giữa `idle` ➔ `thinking` ➔ `speaking` ➔ `idle`.
   - Kiểm tra màu son và da: Không có hiện tượng lệch màu hoặc viền mờ quanh miệng.
3. **Frontend Integration & Build**:
   - `pnpm run lint` và `pnpm run build` vượt qua không có lỗi TypeScript hay cú pháp.
   - Thử nghiệm trên các trình duyệt Chrome, Edge, Firefox và Safari Mobile.

### 5.2 Định Nghĩa Hoàn Thành (Definition of Done)
- [x] Service `voice-ai/talking-head` khởi chạy thành công trên GPU RTX 4070 Ti.
- [x] Nhân vật `ng_c_linh` cử động khẩu hình chuẩn xác theo âm thanh tiếng Việt từ `api.metaconnect.vn`.
- [x] Cơ chế Dual-Buffering trong `InterviewAvatar.tsx` chuyển trạng thái mượt mà 100%, 0 nháy đen.
- [x] Trang cấu hình NTD cho phép quản lý đầy đủ video hành động, giọng đọc và prompt chuyên nghiệp.
- [x] Toàn bộ mã nguồn tuân thủ nghiêm ngặt chuẩn kiến trúc monorepo `square-tuyen-dung`.
