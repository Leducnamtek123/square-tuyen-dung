# Nâng Cấp Phỏng Vấn AI Live, Phỏng Vấn Thử & Tra Cứu Lương — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiện thực hóa giao diện HUD phòng phỏng vấn AI (gợi ý trả lời, mẹo cá nhân hóa, lộ trình, countdown timer per-question), phân hệ Phỏng vấn thử (Mock Interview Studio) và Cổng tra cứu mức lương thị trường năm 2026 trên nền tảng Square Tuyển Dụng.

**Architecture:** Mở rộng hệ thống Django backend (`api/apps/interviews` và `api/apps/jobs`), bổ sung model `SalaryBenchmark` và cấu trúc gợi ý trong `Question`. Mở rộng `AIInterviewLayout` trên LiveKit WebRTC frontend với cơ chế đồng bộ câu hỏi và bộ đếm giờ qua data channel, đồng thời tạo mới 2 trang Portal cho ứng viên: Ngân hàng câu hỏi & Luyện tập (`/candidate/practice`) và Tra cứu lương (`/salary`).

**Tech Stack:** Python 3.11, Django 4.x, Django REST Framework, MySQL 8.0, Redis 7, React 18, Vite 8, TypeScript, MUI 6, Tailwind CSS, LiveKit WebRTC.

**Spec:** `docs/superpowers/specs/2026-09-10-interview-enhancements-design.md`

## Global Constraints
- Tuân thủ cấu trúc thư mục hiện có: backend trong `api/apps/interviews/`, frontend trong `frontend/src/views/interviewPages/`, `frontend/src/views/jobSeekerPages/`.
- Không phá vỡ luồng phỏng vấn thật (`official`) của nhà tuyển dụng và ứng viên.
- Toàn bộ text UI hỗ trợ tiếng Việt chuẩn, định dạng tiền tệ VND (`15.000.000 đ` hoặc `15M - 35M VND`).
- Tất cả API đều có kiểm tra quyền (Candidate authenticated cho tạo mock interview; Public read cho Tra cứu lương và Ngân hàng câu hỏi).

---

### Task 1: Backend Data Models & Migrations

**Files:**
- Modify: `api/apps/interviews/models.py`
- Modify: `api/apps/jobs/models.py`
- Create: `api/apps/interviews/migrations/0009_interview_enhancements_models.py` (hoặc qua makemigrations)
- Test: `api/apps/interviews/tests_enhancements.py`

**Interfaces:**
- Produces: `Question.answer_structure`, `Question.interviewer_intent`, `Question.important_tips`, `Question.follow_up_questions`, `Question.default_duration_seconds`
- Produces: `InterviewSession.session_type` (`choices=['official', 'mock']`), `InterviewSession.time_limit_per_question`
- Produces: `SalaryBenchmark` model (career, position_title, experience_level, salary_min, salary_max, salary_avg, year, sample_count, is_hot)

- [ ] **Step 1: Write failing test for enhanced models**
```python
# api/apps/interviews/tests_enhancements.py
from django.test import TestCase
from apps.interviews.models import Question, InterviewSession, SalaryBenchmark
from apps.accounts.models import User

class ModelEnhancementTestCase(TestCase):
    def test_question_hint_fields(self):
        q = Question.objects.create(
            text="Mục tiêu nghề nghiệp của bạn là gì?",
            default_duration_seconds=120,
            answer_structure={"start": "Nêu mục tiêu", "steps": [{"step": 1, "title": "1-2 năm"}]},
            interviewer_intent="Đánh giá định hướng",
            important_tips=[{"priority": "HIGH", "text": "Cụ thể hóa thành tích"}]
        )
        self.assertEqual(q.default_duration_seconds, 120)
        self.assertIn("start", q.answer_structure)

    def test_mock_session_type(self):
        user = User.objects.create(username="candidate1", role="jobseeker")
        session = InterviewSession.objects.create(candidate=user, session_type='mock')
        self.assertEqual(session.session_type, 'mock')
```

- [ ] **Step 2: Run test to verify it fails**
Run: `docker compose exec api pytest apps/interviews/tests_enhancements.py -v` (hoặc python manage.py test)
Expected: FAIL with missing fields or model.

- [ ] **Step 3: Update `api/apps/interviews/models.py` and create `SalaryBenchmark`**
Thêm các trường vào `Question`, `InterviewSession` và định nghĩa class `SalaryBenchmark`.
Chạy `makemigrations` và `migrate`.

- [ ] **Step 4: Run test to verify it passes**
Run: `docker compose exec api pytest apps/interviews/tests_enhancements.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add api/apps/interviews/
git commit -m "feat(interviews): add hint fields to Question, session_type to InterviewSession, and SalaryBenchmark model"
```

---

### Task 2: Backend APIs, Mock Session Creation & Seed Data

**Files:**
- Create: `api/apps/interviews/serializers_enhancements.py`
- Modify: `api/apps/interviews/views.py`
- Modify: `api/apps/interviews/urls.py`
- Create: `api/scripts/seed_interview_questions_and_salary.py`
- Test: `api/apps/interviews/tests_api_enhancements.py`

**Interfaces:**
- Produces: `GET /api/v1/interviews/questions/bank/`
- Produces: `GET /api/v1/interviews/questions/{id}/hints/`
- Produces: `POST /api/v1/interviews/sessions/create-mock/`
- Produces: `GET /api/v1/salary-benchmarks/`

- [ ] **Step 1: Write failing test for new APIs**
Viết test gọi `GET /api/v1/interviews/questions/bank/`, `POST /api/v1/interviews/sessions/create-mock/`, và `GET /api/v1/salary-benchmarks/`.

- [ ] **Step 2: Run test to verify it fails**
Run test suite.
Expected: FAIL (endpoints 404).

- [ ] **Step 3: Implement serializers, views & url routing**
Triển khai logic:
- `QuestionBankViewSet` trả về danh sách câu hỏi có phân trang và bộ lọc `career`, `difficulty`, `search`.
- `create_mock_session` API: Chọn ngẫu nhiên 5-8 câu hỏi thuộc nghề nghiệp yêu cầu, gán vào session `mock`, sinh LiveKit room và trả về token cho ứng viên.
- `SalaryBenchmarkViewSet`: Tìm kiếm theo từ khóa vị trí, lọc theo ngành nghề (`career_id`).
- Viết seed script nạp sẵn 30+ câu hỏi phỏng vấn thực tế có đầy đủ dàn bài gợi ý, mẹo và 50+ dữ liệu dải lương thị trường năm 2026.

- [ ] **Step 4: Run test to verify it passes**
Run test suite.
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add api/apps/interviews/ api/scripts/
git commit -m "feat(interviews): implement question bank, mock session creation, and salary benchmark APIs"
```

---

### Task 3: Frontend Types, API Services & Synchronization Hook

**Files:**
- Modify: `frontend/src/types/models.ts`
- Modify: `frontend/src/services/interviewService.ts`
- Create: `frontend/src/services/salaryService.ts`
- Create: `frontend/src/views/interviewPages/useInterviewQuestionHUD.ts`
- Test: `frontend/src/views/interviewPages/__tests__/useInterviewQuestionHUD.test.ts`

**Interfaces:**
- Produces: Types `QuestionAnswerStructure`, `QuestionTip`, `SalaryBenchmarkItem`, `QuestionBankItem`.
- Produces: `interviewService.getQuestionBank(params)`
- Produces: `interviewService.createMockSession(careerId, title)`
- Produces: `salaryService.getSalaryBenchmarks(params)`
- Produces: Hook `useInterviewQuestionHUD` quản lý timer đếm ngược, câu hỏi hiện tại, dàn bài gợi ý và trạng thái lộ trình.

- [ ] **Step 1: Write failing test for `useInterviewQuestionHUD`**
Kiểm tra logic timer đếm ngược, gia hạn thời gian (+30s), và chuyển câu hỏi tiếp theo.

- [ ] **Step 2: Implement types and services**
Thêm types và service functions kết nối tới backend endpoints mới.

- [ ] **Step 3: Implement `useInterviewQuestionHUD`**
Xử lý đồng bộ dữ liệu thời gian, câu hỏi hiện tại và data channel topic `square.interview.question_change`.

- [ ] **Step 4: Run tests**
Run: `npm test useInterviewQuestionHUD`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/
git commit -m "feat(frontend): add interview hint types, services, and question HUD hook"
```

---

### Task 4: Frontend LiveKit Room HUD (Giao diện phòng phỏng vấn trực tiếp)

**Files:**
- Create: `frontend/src/views/interviewPages/components/InterviewHintsDrawer.tsx`
- Create: `frontend/src/views/interviewPages/components/InterviewRoadmapDrawer.tsx`
- Create: `frontend/src/views/interviewPages/components/InterviewQuestionCard.tsx`
- Modify: `frontend/src/views/interviewPages/AIInterviewLayout.tsx`
- Test: `frontend/src/views/interviewPages/__tests__/InterviewQuestionCard.test.tsx`

**Interfaces:**
- Produces:
  - Drawer trái `InterviewHintsDrawer`: Dàn bài gợi ý (START → 1, 2, 3 → END) + Mẹo quan trọng (Tips).
  - Khối giữa `InterviewQuestionCard`: Số thứ tự câu (`Câu 2 / 8`), text câu hỏi to rõ, bộ đếm ngược thời gian (`01:54` / đỏ khi < 20s), nút `Trả lời thêm (+30s)`, nút `Hoàn thành câu trả lời`.
  - Drawer phải `InterviewRoadmapDrawer`: Lộ trình phân chặng (Văn hóa, Kỹ thuật, Hành vi) kèm icon trạng thái (xanh lá xong, đang làm nhấp nháy, sắp tới).

- [ ] **Step 1: Write component tests**
Viết test render cho `InterviewQuestionCard` và drawer toggles.

- [ ] **Step 2: Build HUD components**
Thiết kế giao diện đẹp mắt, tương phản cao, tối ưu hiển thị như hình mẫu của đối thủ X-Interview, hỗ trợ co giãn responsive cho cả desktop và tablet/mobile.

- [ ] **Step 3: Integrate into `AIInterviewLayout.tsx`**
Gắn các HUD components vào layout phòng phỏng vấn LiveKit, kết nối với hook `useInterviewQuestionHUD`.

- [ ] **Step 4: Verify visually and run component tests**
Chạy test và kiểm tra render phòng phỏng vấn.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/views/interviewPages/
git commit -m "feat(interview-room): add hints drawer, roadmap drawer, and question countdown HUD"
```

---

### Task 5: Frontend Candidate Question Bank & Mock Interview Hub

**Files:**
- Create: `frontend/src/views/jobSeekerPages/PracticePage/CandidatePracticePage.tsx`
- Create: `frontend/src/views/jobSeekerPages/PracticePage/components/QuestionDetailModal.tsx`
- Modify: `frontend/src/routes/jobSeekerRoutes.tsx` (hoặc routing tương ứng)
- Modify: Sidebar / Navigation menu để ứng viên truy cập được mục "Luyện tập phỏng vấn"
- Test: `frontend/src/views/jobSeekerPages/PracticePage/__tests__/CandidatePracticePage.test.tsx`

**Interfaces:**
- Produces: Route `/candidate/practice` — Trung tâm Ngân hàng câu hỏi & Luyện tập phỏng vấn.
- Nút "Bắt đầu phỏng vấn thử ngay" gọi API `createMockSession` và tự động điều hướng vào phòng phỏng vấn LiveKit (`/interview/{session_id}`).

- [ ] **Step 1: Write component test for Practice Page**
- [ ] **Step 2: Build `CandidatePracticePage`**
Gồm thanh tìm kiếm, bộ lọc chức danh/cấp độ, danh sách thẻ câu hỏi có dàn bài mở rộng, banner kêu gọi làm phỏng vấn thử.
- [ ] **Step 3: Connect API and route**
Gắn route và kiểm tra luồng tạo mock session chuyển hướng vào LiveKit room.
- [ ] **Step 4: Run tests**
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add frontend/src/views/jobSeekerPages/
git commit -m "feat(candidate-practice): create question bank and mock interview hub"
```

---

### Task 6: Frontend Salary Benchmark Page (Cổng Tra Cứu Mức Lương)

**Files:**
- Create: `frontend/src/views/defaultPages/SalaryPage/SalaryBenchmarkPage.tsx`
- Create: `frontend/src/views/defaultPages/SalaryPage/components/SalarySearchSection.tsx`
- Create: `frontend/src/views/defaultPages/SalaryPage/components/SalaryIndustryTable.tsx`
- Modify: `frontend/src/routes/` (đăng ký public route `/salary` và `/candidate/salary`)
- Test: `frontend/src/views/defaultPages/SalaryPage/__tests__/SalaryBenchmarkPage.test.tsx`

**Interfaces:**
- Produces: Route `/salary` hiển thị bảng dải lương thị trường năm 2026, bộ lọc tìm kiếm theo từ khóa / ngành nghề (Xây dựng, Thiết kế, IT, Nhân sự, Sales).
- CTA: "Xem câu hỏi phỏng vấn & Luyện tập ngay" dẫn thẳng sang `/candidate/practice`.

- [ ] **Step 1: Write component test for Salary Page**
- [ ] **Step 2: Build `SalaryBenchmarkPage`**
Thiết kế giao diện hiện đại, sạch sẽ giống ảnh số 3 của đối thủ, hiển thị dải lương `Min - Max VND`.
- [ ] **Step 3: Link route & navigation**
Thêm liên kết "Tra cứu lương" trên Header/Sidebar để người dùng dễ dàng truy cập.
- [ ] **Step 4: Run tests**
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add frontend/src/views/defaultPages/SalaryPage/
git commit -m "feat(salary-page): build market salary benchmark tool with practice CTA"
```

---

### Task 7: End-to-End Verification & Whole-Branch Audit

**Files:**
- Test: `frontend/tests/e2e-interview-enhancements.spec.ts` (hoặc test suite liên quan)
- Full code audit & TypeScript type-check.

- [ ] **Step 1: Run frontend build check (`npm run build`)**
- [ ] **Step 2: Run backend test suite**
- [ ] **Step 3: Run full functional flow audit** (Tra cứu lương → Ngân hàng câu hỏi → Phỏng vấn thử → Trải nghiệm HUD trong phòng phỏng vấn)
- [ ] **Step 4: Final commit and cleanup**
