# Thiết Kế Chi Tiết: Nâng Cấp Phòng Phỏng Vấn AI Live, Phỏng Vấn Thử & Cổng Tra Cứu Lương

## 1. Tổng Quan & Mục Tiêu

Nhằm nâng cao năng lực cạnh tranh và trải nghiệm của ứng viên so với các nền tảng phỏng vấn AI hàng đầu trên thị trường (như X-Interview), hệ thống **Square Tuyển Dụng** sẽ bổ sung và đồng bộ hóa 3 phân hệ cốt lõi:

1. **Live Interview Room HUD (Giao diện phòng phỏng vấn trực tiếp)**:
   - **Gợi ý cấu trúc trả lời & Mẹo cá nhân hóa**: Panel bên trái (collapsible drawer) cung cấp dàn bài gợi ý từng bước (START → 1, 2, 3 → END) kèm thời lượng khuyến nghị (ví dụ: 120s), cùng các mẹo thực chiến dựa trên CV ứng viên và mô tả công việc (JD).
   - **Lộ trình phỏng vấn (Interview Roadmap)**: Panel bên phải (collapsible drawer) phân loại câu hỏi theo các giai đoạn (Phù hợp văn hóa, Kỹ năng kỹ thuật, Tình huống/Hành vi), hiển thị tiến độ và trạng thái trực quan (Đã xong ✔, Đang làm, Sắp tới).
   - **Question Card & Countdown Timer**: Khối hiển thị câu hỏi nổi bật ở trung tâm màn hình, kèm bộ đếm ngược thời gian trả lời cho từng câu (`01:54`), nút gia hạn thời gian (`+30s` / `Trả lời thêm`) và nút kết thúc câu trả lời để chuyển câu.

2. **Phỏng Vấn Thử & Ngân Hàng Câu Hỏi (Mock Interview Studio & Question Bank)**:
   - Tận dụng trực tiếp engine phỏng vấn trực tuyến sẵn có (LiveKit WebRTC + AI Voice Bot) để tạo môi trường **Phỏng vấn thử** 100% giống thật, giúp ứng viên làm quen với thao tác, giọng nói AI, cách đọc gợi ý và kiểm soát thời gian.
   - Trang **Ngân hàng câu hỏi & Luyện tập** (`/candidate/practice`): Cho phép tra cứu câu hỏi theo ngành nghề/vị trí (Xây dựng, Thiết kế nội thất, MEP, IT, Sales, CSKH...), cấp độ (Intern, Junior, Middle, Senior) với chi tiết: *Ý đồ người phỏng vấn*, *Cấu trúc gợi ý*, *Mẹo trả lời*, *Câu hỏi follow-up*, và nút "Bắt đầu phỏng vấn thử ngay".

3. **Cổng Tra Cứu Mức Lương Thị Trường (Salary Insights / Benchmark Tool)**:
   - Trang tra cứu mức lương thị trường (`/salary` và `/candidate/salary`) theo ngành nghề, vị trí công việc và số năm kinh nghiệm năm 2026.
   - Thẻ định hướng nghề nghiệp và CTA liên kết liền mạch: Sau khi tra cứu lương của vị trí X → Gợi ý luyện tập phỏng vấn thử vị trí X ngay.

---

## 2. Kiến Trúc Dữ Liệu & Backend

### 2.1. Model `Question` & Cấu Trúc Gợi Ý (`api/apps/interviews/models.py`)
Mở rộng model `Question` để lưu trữ dữ liệu gợi ý và tiêu chuẩn thời gian:
- `default_duration_seconds`: `IntegerField(default=120)` — Thời gian trả lời khuyến nghị cho câu hỏi (mặc định 120s = 2 phút).
- `answer_structure`: `JSONField(null=True, blank=True)` — Cấu trúc các bước gợi ý:
  ```json
  {
    "start": "Bắt đầu bằng việc thể hiện sự hào hứng với vị trí và công ty...",
    "steps": [
      {"step": 1, "title": "Nêu rõ mục tiêu nghề nghiệp ngắn hạn (1-2 năm)..."},
      {"step": 2, "title": "Giải thích lý do tại sao vị trí này phù hợp..."},
      {"step": 3, "title": "Thể hiện mong muốn học hỏi và phát triển..."}
    ],
    "end": "Tái khẳng định sự quan tâm và cam kết của bạn đối với vị trí.",
    "time_guidance": "Phân bổ thời gian hợp lý, nói đủ ý trong 120 giây."
  }
  ```
- `interviewer_intent`: `TextField(blank=True, default="")` — Mục đích phỏng vấn / Nhà tuyển dụng đang tìm kiếm điều gì ở câu này.
- `important_tips`: `JSONField(null=True, blank=True)` — Danh sách mẹo:
  ```json
  [
    {"priority": "HIGH", "text": "Nghiên cứu kỹ về lĩnh vực và thế mạnh cốt lõi của công ty."},
    {"priority": "MEDIUM", "text": "Cụ thể hóa thành tích bằng các con số hoặc ví dụ thực tế."}
  ]
  ```
- `follow_up_questions`: `JSONField(null=True, blank=True)` — Danh sách câu hỏi nối tiếp có thể gặp.

### 2.2. Mở Rộng `InterviewSession`
- `session_type`: `CharField(max_length=20, choices=[('official', 'Chính thức'), ('mock', 'Phỏng vấn thử')], default='official', db_index=True)`
- `time_limit_per_question`: `IntegerField(default=120)` — Thời gian đếm ngược mặc định mỗi câu hỏi.
- `session_metadata`: `JSONField(null=True, blank=True)` — Lưu trữ gợi ý cá nhân hóa đã được AI sinh sẵn theo CV của ứng viên (nếu có CV).

### 2.3. Model Mới: `SalaryBenchmark` (`api/apps/jobs/models.py` hoặc `api/apps/interviews/models.py`)
Bảng lưu trữ thông tin dải lương thị trường năm 2026:
- `career`: `ForeignKey('common.Career', on_delete=models.CASCADE, related_name='salary_benchmarks')`
- `position_title`: `CharField(max_length=255, verbose_name="Tên vị trí/chức danh")`
- `experience_level`: `CharField(max_length=50, choices=[('entry', 'Mới ra trường / < 1 năm'), ('junior', '1 - 2 năm'), ('mid', '2 - 4 năm'), ('senior', '4 - 7 năm'), ('lead', 'Trưởng nhóm / Manager')])`
- `salary_min`: `DecimalField(max_digits=12, decimal_places=0)` — Mức lương thấp nhất (VND)
- `salary_max`: `DecimalField(max_digits=12, decimal_places=0)` — Mức lương cao nhất (VND)
- `salary_avg`: `DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)` — Mức lương trung bình
- `year`: `IntegerField(default=2026)`
- `sample_count`: `IntegerField(default=100)` — Số lượng mẫu khảo sát
- `is_hot`: `BooleanField(default=False)`

### 2.4. API Endpoints
1. `GET /api/v1/interviews/questions/bank/` — Danh sách câu hỏi ngân hàng (kèm bộ lọc role, category, difficulty, career).
2. `GET /api/v1/interviews/questions/{id}/hints/` — Chi tiết gợi ý câu hỏi (cấu trúc, mẹo, follow-up).
3. `POST /api/v1/interviews/sessions/create-mock/` — Tạo phiên phỏng vấn thử (tạo session type `mock`, gán bộ câu hỏi ngẫu nhiên theo nghề nghiệp, sinh token LiveKit).
4. `GET /api/v1/salary-benchmarks/` — Tra cứu dải lương thị trường theo từ khóa, ngành nghề và cấp độ.
5. `POST /api/v1/interviews/sessions/{id}/next-question/` — Chuyển câu hỏi tiếp theo và reset bộ đếm ngược.

---

## 3. Kiến Trúc Giao Diện Frontend

### 3.1. Nâng Cấp Phòng Phỏng Vấn `AIInterviewLayout.tsx`
Tổ chức giao diện thành layout chuẩn với các HUD thông minh:
- **Left HUD (Drawer Gợi ý trả lời & Mẹo quan trọng)**:
  - Toggle button: Icon bóng đèn 💡 `"Gợi ý trả lời"`.
  - Cấu trúc câu trả lời: Bước START, 1, 2, 3, END có highlight màu sắc trực quan.
  - Khối "Mẹo quan trọng": Phân tích dựa trên CV ứng viên và JD.
- **Center HUD (Question Card & Countdown Timer)**:
  - Header: Vị trí phỏng vấn + Tên công ty + Trạng thái REC + Đồng hồ tổng buổi phỏng vấn.
  - Main Question Card:
    - Chip: `Câu {cursor + 1} / {total}`.
    - Bộ đếm ngược thời gian: `01:54` (Chuyển sang màu đỏ cảnh báo khi còn dưới 20s).
    - Nội dung câu hỏi font size lớn, rõ ràng.
    - Thanh tiến trình thời gian (Linear Progress Bar giảm dần từ 100% về 0%).
  - Bottom controls:
    - Nút `Trả lời thêm (+30s)` hoặc `Gia hạn thời gian`.
    - Nút `Hoàn thành câu trả lời (Xong)` để thông báo AI chuyển câu tiếp theo.
    - Nút Bật/Tắt Mic, Cam, Rời phòng.
- **Right HUD (Drawer Lộ trình phỏng vấn)**:
  - Toggle button: Icon sổ tay / lộ trình 🗺️ `"Lộ trình phỏng vấn"`.
  - Hiển thị danh sách nhóm câu hỏi:
    - Phù hợp văn hóa (2 câu)
    - Kỹ năng chuyên môn (4 câu)
    - Tình huống & Hành vi (2 câu)
  - Đánh dấu trạng thái:
    - Checkmark xanh lá: Đã hoàn thành
    - Badge nhấp nháy: Đang trả lời
    - Chữ xám: Chưa thực hiện

### 3.2. Trang "Ngân Hàng Câu Hỏi & Phỏng Vấn Thử" (`/candidate/practice`)
- Header giới thiệu + Thanh tìm kiếm + Bộ lọc (Ngành nghề, Cấp độ, Câu hỏi chung/chuyên môn).
- Banner nổi bật: "Giả lập phỏng vấn thực tế với AI — Bắt đầu phỏng vấn thử ngay".
- Danh sách câu hỏi dạng thẻ (Card list):
  - Nhãn cấp độ (Dễ, Trung bình, Khó).
  - Tên câu hỏi.
  - Dropdown mở rộng: Xem góc nhìn Interviewer, Dàn bài gợi ý, Mẹo quan trọng, Câu hỏi nối tiếp.
  - Nút "Thử trả lời câu này".

### 3.3. Trang "Tra Cứu Mức Lương Thị Trường" (`/salary`)
- Search bar lớn: "Nhập ngành nghề hoặc chức danh (ví dụ: Kỹ sư xây dựng, Thiết kế nội thất, Kế toán...)"
- 3 Card nổi bật: Dữ liệu đa chiều, Tra cứu linh hoạt, Định hướng phát triển.
- Bảng phân nhóm lương theo ngành:
  - Cột Chức danh | Dải lương (Min - Max) | Cấp bậc kinh nghiệm.
  - Khi click vào một vị trí → Hiển thị pop-up hoặc drawer chi tiết mức lương theo cấp độ (Junior, Mid, Senior) kèm nút CTA: **"Xem câu hỏi phỏng vấn & Luyện tập ngay"**.

---

## 4. Cơ Chế Đồng Bộ & Trạng Thái LiveKit (Realtime Synchronization)

Để đảm bảo câu hỏi và bộ đếm giờ đồng bộ giữa AI Agent và giao diện thí sinh:
1. AI Agent phát tín hiệu chuyển câu hỏi qua LiveKit Data Channel (`topic: 'square.interview.question_change'`).
2. Payload gồm:
   ```json
   {
     "question_index": 1,
     "total_questions": 8,
     "question_id": 12,
     "question_text": "...",
     "category": "technical",
     "duration_seconds": 120,
     "answer_structure": { ... },
     "tips": [ ... ]
   }
   ```
3. Frontend lắng nghe sự kiện trên Data Channel:
   - Cập nhật nội dung Question Card.
   - Reset bộ đếm ngược về `duration_seconds`.
   - Cập nhật trạng thái "Đang làm" trên Lộ trình (Roadmap Drawer).
   - Tự động nạp gợi ý tương ứng vào Gợi ý Drawer.

---

## 5. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (Verification & QA)
- Backend Unit Tests: Test API lấy danh sách ngân hàng câu hỏi, test tạo session `mock`, test API tra cứu lương.
- Frontend Component Tests: Test Question Card hiển thị đúng đếm ngược, test đóng mở drawer gợi ý và lộ trình.
- End-to-End Test: Luồng ứng viên vào Tra cứu lương → Chuyển sang Ngân hàng câu hỏi → Tạo phiên phỏng vấn thử → Trải nghiệm phòng LiveKit với HUD đầy đủ.
