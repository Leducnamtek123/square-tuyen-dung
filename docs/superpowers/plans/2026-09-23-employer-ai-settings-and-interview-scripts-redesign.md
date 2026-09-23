# Tái Cấu Trúc Toàn Diện: Cài Đặt AI Doanh Nghiệp & Kịch Bản Phỏng Vấn (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống phân cấp chuẩn B2B SaaS: Lưu trữ cài đặt AI doanh nghiệp trên Backend DB, gắn kết ngân hàng câu hỏi vào kịch bản phỏng vấn, truyền tải system prompt vào Voice AI LiveKit, và cung cấp tính năng Live Lipsync (nhép miệng khi test giọng nói) trên giao diện Employer.

**Architecture:** 
- Mô hình kế thừa 3 tầng: `Company.ai_settings` (Tầng 1) -> `InterviewScript` (Tầng 2) -> `InterviewSession` + `LiveKit Agent` (Tầng 3).
- Backend DRF cung cấp API CRUD cho `Company.ai_settings` và mở rộng `InterviewScriptSerializer` hỗ trợ `question_group` và `questions`.
- Frontend Next.js chia tách module `EmployerAiSettingsCard` (1.641 dòng) thành các sub-components tinh gọn, tích hợp Voice-Lipsync Engine (crossfade `speaking.mp4` khi test giọng), đồng thời nâng cấp `InterviewScriptDrawer` với Smart Rubric và Question Picker.

**Tech Stack:** Python 3.10+, Django REST Framework, LiveKit Agents, Next.js 16 (App Router), React 19, MUI 6, TypeScript 5, Jest, Pytest.

**Spec:** `docs/superpowers/specs/2026-09-23-employer-ai-settings-and-interview-scripts-redesign.md`

## Global Constraints
- **Zero Secrets**: Tuyệt đối không commit credentials hoặc file `.env`.
- **Non-Destructive**: Không xóa các chú thích domain tiếng Việt và không phá vỡ các test case đang pass.
- **Type Synchronization**: Đồng bộ `frontend/src/types/` khớp với serializer Backend DRF.
- **TDD & Verification First**: Chạy lệnh kiểm thử sau mỗi task trước khi hoàn tất.

---

### Task 1: Backend DRF — Model `Company.ai_settings`, Serializer & API Endpoints

**Files:**
- Modify: `api/apps/profiles/models.py` (thêm trường `ai_settings` vào model `Company`)
- Create: `api/apps/profiles/serializers_ai_settings.py` (serializer cho cài đặt AI công ty)
- Modify: `api/apps/profiles/views.py` (view `CompanyAiSettingsAPIView`)
- Modify: `api/apps/profiles/urls.py` (đăng ký route `company/ai-settings/`)
- Test: `api/apps/profiles/tests/test_company_ai_settings.py`

**Interfaces:**
- Consumes: `Company` model từ `api/apps/profiles/models.py`, `User` authentication.
- Produces: `GET /api/v1/profiles/company/ai-settings/` và `PATCH /api/v1/profiles/company/ai-settings/` trả về JSON `ai_settings`.

- [ ] **Step 1: Viết failing test cho Company AI Settings API**
  Tạo file `api/apps/profiles/tests/test_company_ai_settings.py`:
  - Test lấy `ai_settings` mặc định khi công ty chưa cấu hình.
  - Test `PATCH` cập nhật `interviewer_name`, `tts_voice`, `custom_background_url`.
  - Test chặn người dùng chưa xác thực hoặc không thuộc công ty.

- [ ] **Step 2: Chạy test để xác nhận test thất bại**
  Chạy: `pytest api/apps/profiles/tests/test_company_ai_settings.py` (hoặc `python manage.py test api.apps.profiles.tests.test_company_ai_settings`)
  Kỳ vọng: FAIL (chưa có trường `ai_settings` và endpoint).

- [ ] **Step 3: Cập nhật Model `Company` & Tạo Migration**
  Thêm vào `api/apps/profiles/models.py`:
  ```python
  ai_settings = models.JSONField(
      default=dict,
      blank=True,
      null=True,
      verbose_name="Cấu hình Trợ lý AI phỏng vấn của doanh nghiệp"
  )
  ```
  Chạy `python manage.py makemigrations profiles` và `python manage.py migrate`.

- [ ] **Step 4: Tạo Serializer, View và URL cho `company/ai-settings/`**
  - Viết `CompanyAiSettingsSerializer` với validation các trường: `interviewer_name`, `tts_voice`, `tts_speed`, `selected_background_id`, v.v.
  - Viết `CompanyAiSettingsAPIView` kế thừa `APIView` với permission `IsAuthenticated`.
  - Đăng ký URL: `path('company/ai-settings/', CompanyAiSettingsAPIView.as_view(), name='company-ai-settings')`.

- [ ] **Step 5: Chạy lại test để xác nhận pass 100%**
  Chạy test và xác nhận PASS.

- [ ] **Step 6: Commit git**
  ```bash
  git add api/apps/profiles/
  git commit -m "feat(api): add company ai_settings model field and API endpoint"
  ```

---

### Task 2: Backend DRF & Voice AI — Gắn Kết Bộ Câu Hỏi & Kết Nối System Prompt sang LiveKit

**Files:**
- Modify: `api/apps/interviews/serializers.py` (mở rộng `InterviewScriptSerializer`)
- Modify: `api/apps/interviews/services.py` (kế thừa fallback `Company.ai_settings` và truyền prompt sang LiveKit token)
- Modify: `voice-ai/livekit_agent/src/interviewer.py` (đọc `system_prompt` và `allow_ai_followup` từ `_context`)
- Test: `api/apps/interviews/tests/test_interview_scripts.py`

**Interfaces:**
- Consumes: `InterviewScript` model, `Company.ai_settings`.
- Produces: Metadata payload cho LiveKit room có đầy đủ `system_prompt`, `greeting_message`, `allow_ai_followup`.

- [ ] **Step 1: Viết test mở rộng cho `InterviewScriptSerializer`**
  Trong `api/apps/interviews/tests/test_interview_scripts.py`:
  - Test tạo kịch bản với `question_group` và `question_ids`.
  - Test serializer trả về `question_details` và `question_group_name`.

- [ ] **Step 2: Cập nhật `InterviewScriptSerializer` trong `api/apps/interviews/serializers.py`**
  - Bổ sung `question_details = QuestionDetailSerializer(source='questions', many=True, read_only=True)`.
  - Bổ sung `question_group_name = serializers.CharField(source='question_group.name', read_only=True)`.
  - Hỗ trợ ghi `question_ids` trong `create` và `update`.

- [ ] **Step 3: Cập nhật hàm tạo LiveKit token trong `api/apps/interviews/services.py`**
  - Đọc `Company.ai_settings`: nếu session/script chưa có avatar hoặc giọng nói, tự động lấy giá trị mặc định từ công ty.
  - Bổ sung `system_prompt`, `allow_ai_followup`, `max_followup_questions` vào `payload`.

- [ ] **Step 4: Cập nhật Voice AI Agent `voice-ai/livekit_agent/src/interviewer.py`**
  - Trong `_generate_question_turn`: thay prompt hardcode bằng `self._context.get("system_prompt")` nếu tồn tại.
  - Kiểm tra cờ `self._context.get("allow_ai_followup")` để kích hoạt/tắt hỏi phụ.

- [ ] **Step 5: Chạy test interviews và xác nhận pass**
  Chạy: `pytest api/apps/interviews/tests/test_interview_scripts.py`
  Xác nhận: PASS.

- [ ] **Step 6: Commit git**
  ```bash
  git add api/apps/interviews/ voice-ai/livekit_agent/
  git commit -m "feat(interviews): integrate question group to scripts and wire system prompt to voice-ai"
  ```

---

### Task 3: Frontend — TypeScript Interfaces, Service & Next.js Routing

**Files:**
- Create/Modify: `frontend/src/types/employerAiSetting.ts`
- Modify: `frontend/src/types/interviewScript.ts`
- Modify: `frontend/src/services/employerAiSettingService.ts`
- Modify: `frontend/next.config.mjs` (thêm canonical rewrite cho `/nha-tuyen-dung/kich-ban-phong-van`)
- Test: `frontend/src/services/__tests__/employerAiSettingService.test.ts`

**Interfaces:**
- Consumes: Backend API `profiles/company/ai-settings/`.
- Produces: `employerAiSettingService.getSettingsAsync()` và `employerAiSettingService.saveSettingsAsync()`.

- [ ] **Step 1: Viết test cho `employerAiSettingService` đồng bộ Backend API**
  Cập nhật `frontend/src/services/__tests__/employerAiSettingService.test.ts`:
  - Kiểm tra gọi `httpRequest.get('profiles/company/ai-settings/')`.
  - Kiểm tra fallback `localStorage` khi offline hoặc lỗi mạng.

- [ ] **Step 2: Cập nhật `employerAiSettingService.ts`**
  - Bổ sung các phương thức bất đồng bộ `fetchSettings()` và `updateSettings(payload)`.
  - Duy trì các helper giải quyết URL: `resolveActiveBackgroundUrl`, `resolveActiveAvatarUrl`, `resolveVoiceName`.

- [ ] **Step 3: Cập nhật `frontend/next.config.mjs`**
  Bổ sung vào mảng rewrites:
  ```javascript
  { source: '/nha-tuyen-dung/kich-ban-phong-van', destination: '/employer/interview-scripts' },
  { source: '/employer/kich-ban-phong-van', destination: '/employer/interview-scripts' },
  ```

- [ ] **Step 4: Chạy test frontend service**
  Chạy: `pnpm test src/services/__tests__/employerAiSettingService.test.ts`
  Xác nhận: PASS.

- [ ] **Step 5: Commit git**
  ```bash
  git add frontend/src/types/ frontend/src/services/ frontend/next.config.mjs
  git commit -m "feat(frontend): sync ai settings service with backend API and add script route rewrites"
  ```

---

### Task 4: Frontend — Nâng Cấp Drawer Kịch Bản Phỏng Vấn (Gắn Câu Hỏi & Smart Rubric)

**Files:**
- Modify: `frontend/src/views/components/employers/InterviewScripts/InterviewScriptDrawer.tsx`
- Modify: `frontend/src/views/components/employers/InterviewScripts/InterviewScriptCard.tsx`
- Modify: `frontend/src/views/components/employers/InterviewScripts/InterviewScriptPreviewModal.tsx`
- Test: `frontend/src/views/components/employers/InterviewScripts/__tests__/InterviewScriptDrawer.test.tsx`

**Interfaces:**
- Consumes: `questionBankService` hoặc `questionGroupService`, `interviewScriptService`.
- Produces: Drawer UI cho phép chọn Bộ câu hỏi, tự cân bằng Rubric 100%, bật/tắt kế thừa giọng công ty.

- [ ] **Step 1: Bổ sung chọn Bộ câu hỏi (`QuestionGroup`) và Câu hỏi chi tiết**
  Trong `InterviewScriptDrawer.tsx`:
  - Gọi API lấy danh sách `QuestionGroup` của công ty và của hệ thống.
  - Cho phép NTD chọn bộ câu hỏi, hiển thị preview danh sách câu hỏi.
  - Tính toán và hiển thị: `Thời lượng dự kiến = Tổng số câu × Thời gian/câu`.

- [ ] **Step 2: Bổ sung tính năng Smart Rubric (Cân bằng tự động 100%)**
  - Thêm nút: `⚡ Tự động chia đều 100%`.
  - Thanh tiến độ hiển thị trực quan: Xanh lá khi tổng = 100%, Cam/Đỏ khi thừa/thiếu.

- [ ] **Step 3: Bổ sung Switch Kế Thừa Nhận Diện Công Ty**
  - Switch: *"Kế thừa Giọng nói & Nhân vật đại diện của Công ty"* (mặc định bật).
  - Khi tắt switch, hiển thị form chọn Giọng đọc và Nhân vật riêng cho kịch bản.

- [ ] **Step 4: Cập nhật Card và Modal Preview hiển thị thông tin câu hỏi**
  - Card hiển thị tên bộ câu hỏi đã gắn (nếu có).
  - Preview Modal liệt kê danh sách câu hỏi chi tiết và thang rubric dạng thẻ hiện đại.

- [ ] **Step 5: Chạy kiểm thử Jest**
  Chạy: `pnpm test InterviewScripts`
  Xác nhận: PASS.

- [ ] **Step 6: Commit git**
  ```bash
  git add frontend/src/views/components/employers/InterviewScripts/
  git commit -m "feat(frontend): add question picker and smart rubric to interview scripts drawer"
  ```

---

### Task 5: Frontend — Tái Cấu Trúc Cài Đặt AI & Xây Dựng Engine Live Lipsync khi Test Giọng

**Files:**
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/AiStudioPreview.tsx`
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/AiIdentityCard.tsx`
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/AiVoiceSelector.tsx`
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/AiSpaceCard.tsx`
- Create: `frontend/src/views/components/employers/EmployerAiSettingsCard/AiActionBar.tsx`
- Modify: `frontend/src/views/components/employers/EmployerAiSettingsCard/index.tsx` (tinh gọn thành coordinator component)
- Test: `frontend/src/views/components/employers/EmployerAiSettingsCard/__tests__/EmployerAiSettingsCard.test.ts`

**Interfaces:**
- Consumes: `employerAiSettingService`, `aiService.tts()`, `InterviewAvatar`.
- Produces: Giao diện Cài đặt AI module hóa, mượt mà, hỗ trợ test giọng sync mồm avatar ngay trên màn hình.

- [ ] **Step 1: Xây dựng `AiStudioPreview.tsx` với cơ chế Live Lipsync**
  - Tích hợp `InterviewAvatar` với prop `speakVideoUrl`.
  - Khi cờ `isSpeakingTest = true`, tự động truyền `speakVideoUrl = '/assets/avatars/ng_c_linh/actions/speaking.mp4'`.
  - Avatar lập tức kích hoạt video nhép miệng mượt mà song song với audio test.

- [ ] **Step 2: Xây dựng `AiVoiceSelector.tsx`**
  - Lưới các thẻ giọng đọc 3 miền (Bắc/Trung/Nam), nút play mẫu âm thanh.
  - Khi bấm play: gọi `aiService.tts()`, kích hoạt audio player và đồng bộ cờ `isSpeakingTest` sang `AiStudioPreview`.

- [ ] **Step 3: Xây dựng `AiIdentityCard.tsx` và `AiSpaceCard.tsx`**
  - Nhập Danh xưng, Chức vụ, mô phỏng huy hiệu phòng họp.
  - Chọn không gian văn phòng / studio hoặc upload ảnh doanh nghiệp.
  - Xóa bỏ mọi thuật ngữ công nghệ thừa (H.264, AAC, Wav2Lip).

- [ ] **Step 4: Xây dựng `AiActionBar.tsx` và refactor `index.tsx`**
  - Thanh header cố định có nút "Lưu thay đổi", phát hiện trạng thái chưa lưu (dirty state).
  - Tích hợp gọi API lưu vào Backend DRF (`employerAiSettingService.saveSettingsAsync`).

- [ ] **Step 5: Chạy kiểm thử Jest**
  Chạy: `pnpm test src/views/components/employers/EmployerAiSettingsCard`
  Xác nhận: PASS.

- [ ] **Step 6: Commit git**
  ```bash
  git add frontend/src/views/components/employers/EmployerAiSettingsCard/
  git commit -m "feat(frontend): modularize AI settings and implement real-time voice-lipsync preview"
  ```

---

### Task 6: Kiểm Thử Toàn Diện, Lint, Typecheck & Bàn Giao

**Files:**
- Toàn bộ các file đã chỉnh sửa thuộc backend, frontend và voice-ai.

- [ ] **Step 1: Chạy kiểm tra linting và formatting**
  - Backend: `ruff check .` (hoặc kiểm tra cú pháp Python).
  - Frontend: `pnpm run lint`.

- [ ] **Step 2: Chạy kiểm tra TypeScript typecheck**
  Chạy: `pnpm run typecheck` trong thư mục `frontend`.
  Xác nhận: Không phát sinh bất kỳ lỗi kiểu dữ liệu nào.

- [ ] **Step 3: Chạy toàn bộ Unit Tests liên quan**
  - `pnpm test src/views/components/employers/EmployerAiSettingsCard`
  - `pnpm test InterviewScripts`
  - `pnpm test src/services/__tests__/employerAiSettingService.test.ts`
  Xác nhận: 100% tests PASS.

- [ ] **Step 4: Commit và hoàn tất**
  ```bash
  git commit -m "chore: complete verification and regression testing for AI settings and interview scripts redesign"
  ```
