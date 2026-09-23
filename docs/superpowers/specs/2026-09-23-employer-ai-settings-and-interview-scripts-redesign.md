# Thiết Kế Tái Cấu Trúc Toàn Diện: Cài Đặt AI Doanh Nghiệp & Kịch Bản Phỏng Vấn (Employer AI Settings & Interview Scripts Redesign)

> **Mã tài liệu**: `2026-09-23-employer-ai-settings-and-interview-scripts-redesign`  
> **Phạm vi áp dụng**: 
> - Backend DRF: `api/apps/profiles`, `api/apps/interviews`
> - Frontend Next.js: `frontend/src/views/components/employers/EmployerAiSettingsCard`, `frontend/src/views/components/employers/InterviewScripts`, `frontend/src/services/`
> - Voice AI Service: `voice-ai/livekit_agent/src/interviewer.py`
> - Gateway & Routing: `frontend/next.config.mjs`, `frontend/src/configs/routeConfig.ts`  
> **Trạng thái**: Đã phê duyệt (Approved) — Sẵn sàng lập kế hoạch và phân tách subagent thực thi

---

## 1. Bối cảnh & Vấn đề Cần Giải Quyết

Qua đợt rà soát chuyên sâu (Audit) hai trang quản lý của Nhà tuyển dụng:
- `https://infohr.vn/nha-tuyen-dung/cai-dat-ai`
- `https://infohr.vn/nha-tuyen-dung/kich-ban-phong-van`

Phát hiện 5 điểm nghẽn nghiêm trọng cản trở môi trường Production:
1. **Ảo ảnh lưu trữ (Storage illusion)**: Toàn bộ cấu hình ở trang Cài đặt AI chỉ lưu vào `localStorage` của trình duyệt NTD (`sq_employer_ai_custom_settings`), không hề có Backend DRF lưu trữ. Ứng viên khi vào phòng phỏng vấn hoàn toàn không nhận được cấu hình này.
2. **Kịch bản phỏng vấn rỗng câu hỏi**: Model Backend đã hỗ trợ `question_group` và `questions`, nhưng giao diện Drawer tạo/sửa kịch bản hoàn toàn không cho phép gắn câu hỏi hay bộ câu hỏi.
3. **Voice AI Agent bỏ qua cấu hình**: Voice AI (`voice-ai/livekit_agent/src/interviewer.py`) hardcode cố định system prompt, bỏ qua các cấu hình `system_prompt`, `allow_ai_followup`, `max_followup_questions`.
4. **Trùng lặp và xung đột cấu hình**: Cả 2 trang đều cho chọn Giọng đọc, Tốc độ, Persona, Prompt mà không có cơ chế kế thừa phân cấp rõ ràng.
5. **Giao diện monolithic và thiếu tính năng lipsync khi test giọng**: File `EmployerAiSettingsCard/index.tsx` dài 1.641 dòng với nhiều thuật ngữ kỹ thuật thừa; nút nghe thử giọng nói không có chuyển động môi của avatar.

---

## 2. Kiến Trúc Kế Thừa Phân Cấp 3 Tầng (Hierarchy & Inheritance Flow)

Hệ thống tuân thủ mô hình 3 tầng chuẩn B2B SaaS:

```
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 1: NHẬN DIỆN THƯƠNG HIỆU DOANH NGHIỆP                │
│  Company.ai_settings (Lưu Backend DB)                       │
│  - Danh xưng AI & Chức vụ đại diện công ty                  │
│  - Phông nền phòng phỏng vấn thương hiệu (Logo/Văn phòng)  │
│  - Nhân vật AI & Giọng nói thương hiệu mặc định (3 miền)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Kế thừa mặc định)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 2: KỊCH BẢN PHỎNG VẤN THEO VỊ TRÍ                     │
│  InterviewScript (Lưu Backend DB)                           │
│  - Bộ câu hỏi đóng gói (QuestionGroup) & Câu hỏi cụ thể     │
│  - Phong thái HR & System Prompt chuyên biệt                │
│  - Quy tắc phỏng vấn (Thời lượng câu, Hỏi đào sâu, Rubric)  │
│  - Tùy chọn: Kế thừa giọng công ty HOẶC ghi đè riêng        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Áp dụng khi tạo phòng)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 3: PHÒNG PHỎNG VẤN TRỰC TIẾP                          │
│  InterviewSession & LiveKit Voice AI Agent                  │
│  - Tiếp nhận đầy đủ Context qua Session Metadata            │
│  - Đồng bộ âm thanh, hình ảnh và câu hỏi cho ứng viên       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Thiết Kế Chi Tiết Từng Phân Hệ

### 3.1. Backend DRF & Database Persistence

#### 3.1.1. Lưu trữ Cài đặt AI của Doanh nghiệp (`Company.ai_settings`)
- **Tập tin**: `api/apps/profiles/models.py`
- **Mô hình**: Bổ sung trường `ai_settings = models.JSONField(default=dict, blank=True, null=True, verbose_name="Cấu hình Trợ lý AI phỏng vấn của doanh nghiệp")` vào model `Company`.
- **Schema cấu trúc `ai_settings`**:
  ```json
  {
    "interviewer_name": "Trợ lý AI AILA",
    "interviewer_title": "Chuyên viên tuyển dụng thông minh",
    "background_type": "preset",
    "selected_background_id": "modern_office",
    "custom_background_url": null,
    "avatar_type": "preset",
    "active_character_id": "ng_c_linh",
    "selected_avatar_id": "aila_recruiter",
    "custom_avatar_url": null,
    "tts_voice": "Trúc Ly",
    "tts_speed": 1.0,
    "default_script_id": null
  }
  ```
- **API Endpoints**:
  - `GET /api/v1/profiles/company/ai-settings/`: Lấy cấu hình AI của doanh nghiệp đang đăng nhập.
  - `PATCH /api/v1/profiles/company/ai-settings/`: Cập nhật cấu hình AI (yêu cầu quyền quản lý công ty / tuyển dụng).

#### 3.1.2. Mở rộng `InterviewScript` gắn Bộ câu hỏi & Câu hỏi
- **Tập tin**: `api/apps/interviews/serializers.py`, `views.py`
- Serializer `InterviewScriptSerializer` trả về:
  - `question_group`: ID bộ câu hỏi.
  - `question_group_name`: Tên bộ câu hỏi.
  - `question_ids`: Danh sách ID câu hỏi lẻ được liên kết.
  - `questions`: Chi tiết các câu hỏi (`id`, `content`, `category`, `difficulty`).
  - Hỗ trợ ghi dữ liệu `question_group` và `question_ids` khi tạo/cập nhật.

#### 3.1.3. Đồng bộ hóa với LiveKit Voice AI Engine
- **Tập tin**: `api/apps/interviews/services.py`, `voice-ai/livekit_agent/src/interviewer.py`
- Khi tạo session hoặc cấp token LiveKit:
  1. Đọc cấu hình từ `InterviewScript` được gắn với `JobPost` hoặc `InterviewSession`.
  2. Nếu script chưa ghi đè nhân vật/giọng nói, tự động lấy giá trị từ `Company.ai_settings`.
  3. Bổ sung các tham số vào metadata gửi sang LiveKit room:
     - `system_prompt`: Chuỗi chỉ dẫn chuyên sâu đã thế biến (`{candidate_name}`, `{job_title}`, `{company_name}`, `{interviewer_name}`).
     - `allow_ai_followup`: Boolean.
     - `max_followup_questions`: Số câu hỏi phụ tối đa.
     - `time_limit_per_question`: Thời gian trả lời tối đa.
- Trong `voice-ai/livekit_agent/src/interviewer.py`:
  - Thay thế chuỗi prompt cố định bằng `self._context.get("system_prompt")` nếu có.
  - Cập nhật logic điều phối câu hỏi phụ tuân thủ `allow_ai_followup` và `max_followup_questions`.

---

### 3.2. Frontend Next.js — Trang Cài Đặt AI Doanh Nghiệp

#### 3.2.1. Tái cấu trúc Modular hóa (Refactor Component Architecture)
Tách component monolithic `EmployerAiSettingsCard/index.tsx` (1.641 dòng) thành cấu trúc component con tinh gọn:
- `frontend/src/views/components/employers/EmployerAiSettingsCard/`:
  - `index.tsx`: Component điều phối chính, quản lý state và gọi API backend `company/ai-settings`.
  - `AiStudioPreview.tsx`: Khung xem trước Studio 16:9 với tính năng Live Lipsync khi test giọng.
  - `AiIdentityCard.tsx`: Form cấu hình Danh xưng, Chức vụ và mô phỏng Huy hiệu phòng họp.
  - `AiVoiceSelector.tsx`: Lưới chọn chất giọng 3 miền (Bắc/Trung/Nam), thanh trượt tốc độ phát âm và bộ điều khiển nghe thử giọng nói có nhép môi.
  - `AiSpaceCard.tsx`: Bộ sưu tập phông nền studio tiêu chuẩn + tải ảnh không gian công ty thực tế.
  - `AiActionBar.tsx`: Thanh điều hướng cố định trên cùng hiển thị trạng thái đã lưu / chưa lưu và nút "Lưu thay đổi".

#### 3.2.2. Cơ chế Live Lipsync khi Nghe thử Giọng mẫu (Voice-Lipsync Engine)
- Khi người dùng bấm **"Nghe thử giọng mẫu"** (hoặc nút **"Thử hiệu ứng nhép môi"**):
  1. Frontend gọi `aiService.tts()` tải audio mẫu phát ra loa qua `HTMLAudioElement`.
  2. Truyền `speakVideoUrl = resolveActionVideoUrl('speaking', characterId)` (`/assets/avatars/${characterId}/actions/speaking.mp4`) vào `InterviewAvatar`.
  3. `InterviewAvatar` lập tức crossfade (0.12s) từ tư thế `idle` sang tư thế phát âm nhép miệng `speaking.mp4` song song với âm thanh phát ra từ loa.
  4. Component `LiveAudioVisualizerBar` kích hoạt vạch sóng âm thanh nhảy theo biên độ âm thực tế.
  5. Khi audio kết thúc (`onended`), avatar tự động mỉm cười và crossfade mượt mà trở lại tư thế lắng nghe `idle.mp4`.

#### 3.2.3. Loại bỏ Developer Jargon & Thân thiện hóa HR
- Xóa bỏ toàn bộ nội dung hướng dẫn về H.264, AAC, 30fps, 1024x1024 Wav2Lip.
- Thay thế bằng hướng dẫn nghiệp vụ: *"Khuyên dùng ảnh chụp không gian lễ tân hoặc phòng họp công ty tỷ lệ 16:9 chất lượng cao để tạo ấn tượng tin cậy với ứng viên"*.

---

### 3.3. Frontend Next.js — Trang Kịch Bản Phỏng Vấn

#### 3.3.1. Drawer Tạo/Sửa Kịch Bản: Tích hợp Bộ câu hỏi & Ngân hàng câu hỏi
- **Tập tin**: `InterviewScriptDrawer.tsx`
- Bổ sung phân mục **"Nội dung & Danh sách câu hỏi phỏng vấn"**:
  - **Chọn Bộ câu hỏi (`QuestionGroup`)**: Dropdown chọn nhanh bộ câu hỏi có sẵn (ví dụ: *Bộ câu hỏi React/Next.js Chuyên sâu*, *Bộ câu hỏi Kỹ năng mềm STAR*). Khi chọn, tự động nạp các câu hỏi thuộc bộ đó.
  - **Chọn Câu hỏi lẻ từ Ngân hàng (`QuestionBank`)**: Cho phép thêm/bớt các câu hỏi chi tiết.
  - **Tính toán thời lượng thông minh**: Hiển thị tổng số câu hỏi và thời lượng ước lượng: `Tổng thời lượng dự kiến = Số câu × Thời gian/câu`.

#### 3.3.2. Thang đánh giá Rubric Thông minh (Smart Rubric Builder)
- Bổ sung nút 1-click: **"⚡ Tự động cân bằng 100%"** (phân bổ đều trọng số các tiêu chí hiện có).
- Thanh đo trực quan (Progress Bar):
  - **Xanh lá**: Đạt đúng 100%.
  - **Cam/Đỏ**: Thiếu hoặc thừa trọng số kèm gợi ý số % cần điều chỉnh.

#### 3.3.3. Cơ chế Kế thừa Nhận diện Doanh nghiệp (Brand Inheritance Switch)
- Mặc định bật switch: *"Kế thừa Giọng nói & Nhân vật đại diện của Công ty"*.
- Chỉ khi NTD chủ động tắt switch mới mở rộng form chọn giọng đọc và nhân vật riêng cho kịch bản đó.

#### 3.3.4. Chuẩn hóa Định tuyến (URL Rewriting & Navigation)
- Cập nhật `frontend/next.config.mjs` bổ sung rewrite:
  ```javascript
  { source: '/nha-tuyen-dung/kich-ban-phong-van', destination: '/employer/interview-scripts' },
  { source: '/employer/kich-ban-phong-van', destination: '/employer/interview-scripts' },
  ```
  Khắc phục triệt để nguy cơ lỗi 404 khi truy cập URL tiếng Việt.

---

## 4. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (Definition of Done)

1. **Backend Tests**:
   - Test CRUD `Company.ai_settings` và kiểm tra quyền truy cập công ty.
   - Test `InterviewScriptSerializer` trả về và cập nhật đúng `question_group` và `questions`.
   - Test hàm tạo token LiveKit truyền đúng metadata tổng hợp từ `ai_settings` và `interview_script`.
2. **Frontend Tests**:
   - Chạy toàn bộ test suites hiện có: `pnpm test src/views/components/employers/EmployerAiSettingsCard` và `pnpm test InterviewScripts`.
   - Bổ sung test kiểm chứng tính năng Live Lipsync khi kích hoạt audio test giọng.
   - Đảm bảo `pnpm run lint` và `pnpm run typecheck` đạt 100% không có cảnh báo/lỗi mới.
3. **E2E & Visual Verification**:
   - Thao tác lưu cài đặt AI trên một máy tính, đăng nhập tài khoản khác cùng công ty kiểm tra đồng bộ thành công.
   - Bấm nghe thử giọng mẫu: Avatar nhép môi mượt mà, vạch sóng âm chuyển động, kết thúc quay về trạng thái idle.
   - Tạo kịch bản phỏng vấn có gắn bộ câu hỏi và kiểm tra hiển thị số câu hỏi chính xác trên thẻ kịch bản.
