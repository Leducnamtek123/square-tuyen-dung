# Thiết Kế Hệ Thống Quản Lý Kịch Bản Phỏng Vấn AI (Interview Script / Scenario Management)

> **Mã tài liệu**: `2026-09-23-interview-scripts-management-design`  
> **Phạm vi**: Backend DRF (`api/apps/interviews`), Frontend Next.js (`frontend/src/views/employerPages/`), LiveKit Voice AI Agent (`voice-ai/livekit_agent`)  
> **Trạng thái**: Đã phê duyệt (Approved)

---

## 1. Mục tiêu & Bối cảnh
Hiện tại, kịch bản phỏng vấn chỉ gồm vài thuộc tính đơn lẻ (`hrPersonaPreset`, `customSystemPrompt`) nằm trong cài đặt của từng Nhà tuyển dụng, chưa phải là một đối tượng độc lập.
Nghiệp vụ thực tế đòi hỏi Nhà tuyển dụng có thể tạo, lưu trữ, phân loại và tái sử dụng nhiều loại kịch bản khác nhau (*Kỹ thuật, Hành vi STAR, Kinh doanh B2B, Tuyển dụng Fresher, Quản lý/Lãnh đạo*), đồng thời liên kết trực tiếp vào Tin tuyển dụng (`JobPost`) và Buổi phỏng vấn (`InterviewSession`).

---

## 2. Kiến trúc Dữ liệu & Backend

### 2.1. Model `InterviewScript` (`api/apps/interviews/models.py`)
Kế thừa `CommonBaseModel`:
- `name`: Tên kịch bản (ví dụ: *Kịch bản Sơ loại Kỹ thuật Senior Backend*)
- `slug`: Slug thân thiện URL
- `description`: Mục tiêu và đối tượng áp dụng
- `scenario_type`: Enum choices (`technical`, `behavioral`, `sales`, `fresher`, `leadership`, `situational`, `custom`)
- `hr_persona`: Enum choices (`friendly`, `professional`, `challenger`)
- `system_prompt`: Hướng dẫn chuyên sâu cho AI Agent (hỗ trợ `{job_title}`, `{candidate_name}`, `{company_name}`, `{interviewer_name}`)
- `greeting_message`: Lời chào mở đầu phiên phỏng vấn
- `closing_message`: Lời cảm ơn và chào kết thúc
- `time_limit_per_question`: Thời gian trả lời tính bằng giây (mặc định 120s)
- `allow_ai_followup`: Cho phép AI tự đặt câu hỏi phụ (mặc định True)
- `max_followup_questions`: Số câu hỏi phụ tối đa (mặc định 2)
- `question_group`: ForeignKey(`QuestionGroup`, null=True, blank=True)
- `questions`: ManyToManyField(`Question`, blank=True)
- `character_id`: Nhân vật Digital Human mặc định (`ng_c_linh`, `minh_tri`...)
- `voice_name`: Giọng đọc TTS mặc định (`Trúc Ly`, `Mạnh Dũng`...)
- `voice_speed`: Tốc độ phát âm (mặc định 1.0)
- `evaluation_rubric`: JSONField (tiêu chuẩn và trọng số chấm điểm %)
- `is_system_preset`: BooleanField (mẫu chuẩn do hệ thống cung cấp)
- `is_active`: BooleanField
- `company`: ForeignKey(`info.Company`, null=True, blank=True, on_delete=CASCADE)
- `author`: ForeignKey(`User`, null=True, blank=True, on_delete=SET_NULL)

### 2.2. Quan hệ liên kết
- `JobPost.interview_script`: Khóa ngoại trỏ tới `InterviewScript`.
- `InterviewSession.interview_script`: Khóa ngoại trỏ tới `InterviewScript`.

### 2.3. RESTful API Endpoints (`/api/v1/interview-scripts/`)
- `GET /api/v1/interview-scripts/`: Danh sách kịch bản (kịch bản riêng của công ty + mẫu hệ thống). Lọc theo `scenario_type`, tìm kiếm từ khóa.
- `POST /api/v1/interview-scripts/`: Tạo mới kịch bản cho doanh nghiệp.
- `GET /api/v1/interview-scripts/{id}/`: Chi tiết kịch bản và danh sách câu hỏi.
- `PUT/PATCH /api/v1/interview-scripts/{id}/`: Cập nhật kịch bản (bảo vệ kịch bản mẫu hệ thống không bị sửa đè).
- `DELETE /api/v1/interview-scripts/{id}/`: Xóa kịch bản (thuộc quyền công ty).
- `POST /api/v1/interview-scripts/{id}/clone/`: 1-click nhân bản kịch bản mẫu hệ thống hoặc kịch bản khác thành kịch bản của công ty mình để chỉnh sửa.

### 2.4. Dữ liệu mẫu khởi tạo sẵn (5 System Presets)
1. **Kỹ thuật Chuyên môn**: Thử thách & Đào sâu kỹ thuật, trọng số kiến trúc & thuật toán 60%, giải quyết vấn đề 40%.
2. **Hành vi & Văn hóa (STAR)**: Chuyên nghiệp, tập trung tình huống thực tế và thái độ làm việc nhóm.
3. **Kinh doanh B2B & CSKH**: Đánh giá xử lý tình huống phản đối, thuyết phục và giao tiếp đàm phán.
4. **Tuyển dụng Fresher / Thực tập sinh**: Thân thiện & Khích lệ, đánh giá tinh thần học hỏi và thái độ cầu tiến.
5. **Lãnh đạo & Quản lý cấp trung**: Đánh giá tầm nhìn, quản trị đội ngũ và giải quyết xung đột.

---

## 3. Kiến trúc Frontend UI/UX

### 3.1. Trang Quản lý Kịch bản (`/employer/interview-scripts`)
- Nằm trong Sidebar nhóm menu **Phỏng vấn AI** (`/employer/interview-scripts`).
- Bộ lọc theo Loại kịch bản (Tất cả, Kỹ thuật, Hành vi, Bán hàng, Fresher, Quản lý).
- Tab chuyển đổi: "Kịch bản của công ty" và "Thư viện kịch bản mẫu InfoHR".
- Thẻ Kịch bản (Script Card):
  - Badge Loại kịch bản, Huy hiệu phong thái AI.
  - Số lượng câu hỏi liên kết, thời lượng mỗi câu.
  - Nút hành động: "Xem chi tiết", "Chỉnh sửa", "Nhân bản", "Áp dụng làm mặc định".
- Drawer / Modal Tạo mới & Chỉnh sửa kịch bản:
  - Form trực quan: Tên, Mô tả, Loại kịch bản, Phong thái HR.
  - Trình soạn thảo Prompt thông minh với nút chèn nhanh biến `{job_title}`, `{candidate_name}`.
  - Bộ chọn Bộ câu hỏi / Danh sách câu hỏi.
  - Cấu hình nhân vật & Giọng đọc AI.

### 3.2. Tích hợp liên kết
- **Tin tuyển dụng (`/employer/job-posts/create` & edit)**: Thêm trường chọn "Kịch bản phỏng vấn AI".
- **Cài đặt AI (`/employer/cai-dat-ai`)**: Tab 3 cho phép chọn Kịch bản mặc định của doanh nghiệp.

---

## 4. Tích hợp LiveKit Voice AI Agent (`voice-ai/livekit_agent`)
- Khi khởi động phiên phỏng vấn, LiveKit Agent kiểm tra `session.interview_script`.
- Nếu có, tự động nạp `system_prompt`, `greeting_message`, `closing_message` và các quy tắc `allow_ai_followup` từ kịch bản để phỏng vấn ứng viên chuẩn 100%.
