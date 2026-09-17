# Universal Operation Activity & Progress Design System Spec

## 1. Mục tiêu & Bối cảnh
- **Dự án**: Square Tuyển Dụng (InfoHR / AILA Platform).
- **Vấn đề hiện tại**: 
  - Trạng thái tải và xử lý tiến trình trong toàn hệ thống bị phân mảnh: nhiều chỗ chỉ dùng spinner xoay tròn (`CircularProgress`), thanh chạy đơn giản (`LinearProgress`), hoặc mô phỏng các bước giả lập bằng `setInterval` (`loadingStep === 0, 1, 2`).
  - Người dùng không biết hệ thống đang thực sự làm gì trong các tác vụ chạy lâu (AI screening, import dữ liệu, đồng bộ thiết bị, xuất PDF, đánh giá phỏng vấn). Nếu đóng modal hoặc chuyển trang, người dùng hoàn toàn mất dấu tiến độ.
- **Mục tiêu giải pháp**:
  - Xây dựng **Operation Activity Design System** — một design pattern chuẩn hóa cấp hệ thống cho mọi tác vụ chạy lâu, đa bước và chạy nền (từ AI Agent, Import/Export, Đồng bộ dữ liệu, Tính toán HRM, Background jobs).
  - Chuẩn hóa Data Contract đồng bộ giữa Backend Django/Celery và Frontend Next.js.
  - Cung cấp 4 cấp độ hiển thị UI trực quan: Inline, Card/Timeline, Full Detail Modal, và Persistent Floating Dock.
  - Triển khai hoàn thiện End-to-End cho 3 luồng quan trọng nhất:
    1. **AI Scan CV ứng viên** (`analyze_resume_ai` $\rightarrow$ `AIAnalysisDrawer`).
    2. **Đồng bộ ứng viên từ Vieclam24h** (`run_vieclam24h_import` $\rightarrow$ `ProfilesPage`).
    3. **Đánh giá sau phỏng vấn AI** (`evaluate_interview_session` $\rightarrow$ `InterviewCompletedView`).

---

## 2. Phân loại 4 nhóm tác vụ trong toàn hệ sinh thái

```mermaid
flowchart TD
    A[Mọi thao tác trong hệ thống] --> B{Phân loại độ trễ & quy trình}
    B -->|< 1.5s (Tức thời)| C[1. SIMPLE ACTION\nNormal Button / Input Loading]
    B -->|2s - 10s (Đơn luồng dài)| D[2. LONG OPERATION\nOperation Activity Inline / Card]
    B -->|5s - 60s (Đa bước rõ rệt)| E[3. MULTI-STEP OPERATION\nOperation Timeline - Expandable / Modal]
    B -->|> 1 phút (Bất đồng bộ nền)| F[4. BACKGROUND JOB\nPersistent Operation Center Dock]
```

1. **SIMPLE ACTION**: Lưu form, toggle active, quick check-in, xóa 1 bản ghi $\rightarrow$ Giữ nguyên spinner / button loading truyền thống, không áp dụng Operation Activity để tránh thừa thãi UI.
2. **LONG OPERATION**: Viết tin bằng AI Copilot, Xuất PDF báo cáo phỏng vấn, Tải & OCR Giấy phép kinh doanh GPKD $\rightarrow$ `OperationProgress` hoặc `OperationTimeline` dạng Card.
3. **MULTI-STEP OPERATION**: AI Scan CV (4 bước), Đồng bộ ứng viên Vieclam24h (5 bước), Đánh giá phỏng vấn AI (5 bước), Xử lý quẹt thẻ máy chấm công $\rightarrow$ `OperationTimeline` (Vertical Stepper trực quan).
4. **BACKGROUND JOB**: Auto Recruitment Pipeline, Tính bảng lương toàn công ty, Import dữ liệu lớn, Gửi email hàng loạt $\rightarrow$ Đẩy vào `OperationCenterDock` nổi góc màn hình, chạy nền bền vững.

---

## 3. Data Contract & Event Schema

Chuẩn JSON trao đổi giữa Backend và Frontend:

```typescript
export type OperationStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type OperationStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface OperationStep {
  key: string;                    // Định danh duy nhất của bước (vd: 'extract_text')
  label: string;                  // Tên hiển thị người dùng (vd: 'Trích xuất văn bản từ CV')
  status: OperationStepStatus;    // Trạng thái hiện tại của bước
  progress?: number;              // 0 - 100
  detail?: string;                // Mô tả chi tiết tiến độ thực tế (vd: 'Đã phân tích 6/8 tiêu chí')
  resultSummary?: string;         // Tóm tắt kết quả bước (vd: '1,450 từ trích xuất')
  errorMessage?: string;          // Lỗi nếu bước thất bại
  startedAt?: string;             // ISO timestamp
  completedAt?: string;           // ISO timestamp
}

export interface OperationPayload {
  id: string;                     // Mã định danh tác vụ duy nhất (vd: 'op_01J8F9W2XY7K4M')
  type: string;                   // Loại tác vụ: 'candidate.ai_scan', 'vieclam24h.import', ...
  title: string;                  // Tiêu đề tác vụ thân thiện
  status: OperationStatus;        // Trạng thái chung
  progress: number;               // Tiến độ tổng quan (0 - 100)
  currentStepKey?: string;        // Khóa của bước đang chạy
  steps: OperationStep[];         // Danh sách các bước tuần tự
  result?: Record<string, any>;   // Kết quả đầu ra khi hoàn tất
  error?: {
    code?: string;
    message: string;
    detail?: string;
  };
  metadata?: Record<string, any>; // Dữ liệu tham chiếu nghiệp vụ (activity_id, session_id...)
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
  finishedAt?: string;            // ISO timestamp
}
```

---

## 4. Kiến trúc Backend (`api/apps/operations`)

### 4.1. Django Model `AsyncOperation`
Tạo app mới `api/apps/operations`:
- `id`: `CharField(max_length=64, primary_key=True)` (sử dụng tiền tố `op_` kèm ULID hoặc UUIDv4).
- `type`: `CharField(max_length=64, db_index=True)` (phân loại tác vụ).
- `title`: `CharField(max_length=255)` (tên hiển thị).
- `user`: `ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=SET_NULL)`.
- `company`: `ForeignKey('jobs.Company', null=True, blank=True, on_delete=SET_NULL)`.
- `status`: `CharField(max_length=32, choices=OperationStatus.choices, default='queued', db_index=True)`.
- `progress`: `PositiveSmallIntegerField(default=0)`.
- `current_step_key`: `CharField(max_length=64, blank=True)`.
- `steps`: `JSONField(default=list)` (lưu mảng `OperationStep`).
- `result`: `JSONField(null=True, blank=True)`.
- `error`: `JSONField(null=True, blank=True)`.
- `metadata`: `JSONField(default=dict)`.
- `timeout_seconds`: `PositiveIntegerField(default=600)`.
- `created_at`: `DateTimeField(auto_now_add=True, db_index=True)`.
- `updated_at`: `DateTimeField(auto_now=True)`.
- `finished_at`: `DateTimeField(null=True, blank=True)`.

### 4.2. Python Utility: `OperationTracker`
Quản lý vòng đời tác vụ an toàn trong Celery workers:
```python
from apps.operations.services import OperationTracker

# Sử dụng context manager tự động bắt ngoại lệ:
with OperationTracker.create(
    type="candidate.ai_scan",
    title=f"AI phân tích ứng viên #{activity_id}",
    steps=[
        {"key": "extract_text", "label": "Trích xuất văn bản từ CV"},
        {"key": "criteria_match", "label": "Đối soát tiêu chí công việc"},
        {"key": "llm_eval", "label": "Chấm điểm & phân tích chuyên sâu"},
        {"key": "scoring_finalize", "label": "Lưu điểm & bằng chứng"},
    ],
    metadata={"activity_id": activity_id},
    user_id=user_id,
    company_id=company_id,
) as tracker:
    tracker.start_step("extract_text")
    text = extract_resume_text(...)
    tracker.complete_step("extract_text", result_summary=f"{len(text)} ký tự")

    tracker.start_step("criteria_match")
    matched_criteria = match_criteria(text, job_post)
    tracker.complete_step("criteria_match", detail="8 tiêu chí khớp")

    tracker.start_step("llm_eval")
    evaluation = call_llm(text, job_post)
    tracker.complete_step("llm_eval")

    tracker.start_step("scoring_finalize")
    persist_result(activity, evaluation)
    tracker.complete_step("scoring_finalize")

    tracker.finish(result={"score": evaluation["score"]})
```

### 4.3. REST API Endpoints
- `GET /api/v1/operations/{id}/`: Lấy chi tiết tác vụ theo ID.
- `GET /api/v1/operations/active/`: Lấy danh sách các tác vụ đang chạy (`queued`, `running`) của user/company hiện tại (hỗ trợ phân trang, lọc theo type).
- `POST /api/v1/operations/{id}/cancel/`: Yêu cầu dừng tác vụ (hỗ trợ revoke Celery task qua `AsyncResult.revoke(terminate=True)`).

---

## 5. Kiến trúc Frontend (`frontend/src/components/operation`)

### 5.1. Cấu trúc thư mục
```
frontend/src/components/operation/
├── types.ts                      # Cấu trúc TypeScript đồng bộ Backend
├── OperationProvider.tsx          # React Context lưu trữ active operations toàn app
├── useOperation.ts                # Custom hook điều khiển & subscribe 1 operation
├── OperationProgress.tsx          # Cấp độ 1: Inline 1 dòng (Table row, Header, Badge)
├── OperationTimeline.tsx          # Cấp độ 2: Expandable Vertical Stepper Card
├── OperationDetailModal.tsx       # Cấp độ 3: Full Dialog xem logs, kết quả & retry
├── OperationCenterDock.tsx        # Cấp độ 4: Floating Dock góc màn hình
├── adapters/                      # Bộ chuyển đổi dữ liệu từ API cũ sang OperationState
│   ├── resumeAnalysisAdapter.ts
│   ├── vieclam24hImportAdapter.ts
│   └── interviewEvaluationAdapter.ts
└── index.ts                      # Barrel export
```

### 5.2. Bốn cấp độ hiển thị (Presentation Modes)
1. **Mức 1 — Inline (`OperationProgress`)**:
   - Thiết kế 1 dòng nhỏ gọn, chiều cao 32px - 36px.
   - Gồm: Icon trạng thái tương ứng, tên tác vụ hoặc tên bước hiện tại, mini progress bar, số % hoặc đếm bản ghi, nút "Mở rộng/Chi tiết".
2. **Mức 2 — Expandable / Card (`OperationTimeline`)**:
   - Trục thời gian đứng (Vertical Stepper).
   - Mỗi bước có 4 trạng thái trực quan:
     - `completed`: Icon tích xanh `#10b981`, hiển thị thời gian chạy.
     - `running`: Icon xanh dương `#2563eb` có hiệu ứng sóng nhịp (pulsing ping), hiển thị dòng detail động.
     - `pending`: Dấu tròn xám `#94a3b8`, mờ.
     - `failed`: Dấu chéo đỏ `#ef4444`, hiển thị thông điệp lỗi kèm nút *Thử lại*.
3. **Mức 3 — Full Detail Modal (`OperationDetailModal`)**:
   - Modal kích thước vừa/lớn (`maxWidth="md"`).
   - Hiển thị đầy đủ: ID tác vụ, thời gian bắt đầu/kết thúc, timeline chi tiết, kết quả hoàn tất (`result` viewer đẹp mắt) và nút tải tệp kết quả nếu có.
4. **Mức 4 — Persistent Floating Dock (`OperationCenterDock`)**:
   - Nằm cố định ở góc dưới bên phải (`bottom: 24px, right: 24px, z-index: 1300`).
   - Tự động hiện khi có bất kỳ tác vụ nền nào đang chạy.
   - Hỗ trợ 2 chế độ: Thu gọn (Pill Badge hiển thị `⟳ X tác vụ đang xử lý...`) và Mở rộng (Danh sách thẻ mini tiến độ).

---

## 6. Kế hoạch Tích hợp 3 Luồng Mũi Nhọn

### 6.1. Luồng 1: AI Scan CV Ứng viên (Resume AI Screening)
- **Backend**: Cập nhật task `analyze_resume_ai` trong `api/apps/jobs/tasks.py` sử dụng `OperationTracker`:
  - Bước 1: `extract_text` (Đọc PDF/DOCX qua PyMuPDF).
  - Bước 2: `criteria_match` (Đối soát yêu cầu công việc, kỹ năng, kinh nghiệm).
  - Bước 3: `llm_eval` (Gửi LLM phân tích, tổng hợp dẫn chứng bằng chứng).
  - Bước 4: `scoring_finalize` (Tính điểm chuẩn hóa và cập nhật `JobPostActivity`).
- **Frontend**:
  - `AIAnalysisComponent.tsx` (bảng ứng viên): Dùng `OperationProgress` inline, hiển thị tiến độ và điểm số mượt mà.
  - `AIAnalysisDrawerStatePanels.tsx`: Thay thế khối `LinearProgress` đơn điệu bằng `OperationTimeline` 4 bước chi tiết.

### 6.2. Luồng 2: Đồng bộ Ứng viên Vieclam24h (Data Lake Sync)
- **Backend**: Cập nhật task `run_vieclam24h_import` trong `api/apps/profiles/tasks.py`:
  - Bước 1: `authenticate` (Đăng nhập portal NTD Vieclam24h).
  - Bước 2: `fetch_candidates` (Crawl danh sách ứng viên theo bộ lọc).
  - Bước 3: `parse_normalize` (Chuyển đổi dữ liệu sang format Candidate Data Lake).
  - Bước 4: `deduplicate_save` (Phát hiện trùng lặp SĐT/Email và lưu DB).
  - Bước 5: `generate_report` (Tổng kết số mới, số cập nhật, số bỏ qua).
- **Frontend**:
  - `ProfilesPage/index.tsx`: Nhúng `OperationTimeline` vào trong Dialog import.
  - Khi người dùng đóng Dialog: Tác vụ tự động đưa vào `OperationCenterDock`, người dùng chuyển trang vẫn xem được tiến độ.

### 6.3. Luồng 3: Đánh giá sau Phỏng vấn AI (Post-Interview Evaluation)
- **Backend**: Cập nhật Celery chain `evaluate_interview_session` trong `api/apps/interviews/tasks.py`:
  - Bước 1: `sync_recording` (Kiểm tra và đồng bộ tệp ghi âm/video từ LiveKit room).
  - Bước 2: `transcribe_align` (Tổng hợp hội thoại và đo lường số lượng từ của ứng viên).
  - Bước 3: `ai_scoring` (AI đánh giá 4 năng lực: Nội dung, Rõ ràng, Liên quan, Tự tin).
  - Bước 4: `apply_weights` (Áp dụng trọng số đánh giá theo cài đặt doanh nghiệp).
  - Bước 5: `publish_report` (Lưu kết quả & gửi thông báo cho Nhà tuyển dụng).
- **Frontend**:
  - `InterviewCompletedView.tsx` & `CandidateEvaluationModal.tsx`: Thay thế badge nhấp nháy bằng `OperationTimeline` 5 bước trang trọng. Ứng viên và NTD thấy rõ AI đang ở khâu nào.

---

## 7. Cơ chế Phòng vệ & Xử lý sự cố (Resilience & Error Handling)
- **Anti-Infinite Hang (Chống quay vô hạn)**:
  - `timeout_seconds` tự động chuyển trạng thái sang `failed` nếu worker bị shutdown hoặc ngắt mạng.
- **Exponential Backoff**:
  - Khi client mất kết nối, `useOperation` tự động dãn cách thời gian polling (1.5s $\rightarrow$ 3s $\rightarrow$ 5s $\rightarrow$ 10s) và hiển thị chỉ báo offline tinh tế.
- **Step-level Retry (Thử lại theo bước)**:
  - Hỗ trợ kích hoạt lại bước bị lỗi mà không làm mất kết quả của các bước trước đã hoàn thành.

---

## 8. Kế hoạch Kiểm nghiệm & Test Cases

1. **Backend Tests (`api/apps/operations/tests/`)**:
   - `test_operation_tracker_success`: Tạo tác vụ, chuyển từng bước, kiểm tra dữ liệu JSON lưu chính xác.
   - `test_operation_tracker_exception`: Bắn lỗi giữa chừng, xác nhận tracker tự động đổi `status="failed"` và lưu trace lỗi.
   - `test_operation_endpoints`: Kiểm tra phân quyền truy cập và lọc tác vụ `active`.
2. **Frontend Tests (`frontend/src/components/operation/__tests__/`)**:
   - `OperationProgress.test.tsx`: Render đúng trạng thái inline, icon và tiến độ %.
   - `OperationTimeline.test.tsx`: Render danh sách bước, icon pulsing, nút thử lại khi lỗi.
   - `useOperation.test.ts`: Kiểm tra chu kỳ polling và hủy polling khi tác vụ kết thúc.
   - `OperationCenterDock.test.tsx`: Kiểm tra hiển thị dock nổi, thu gọn và mở rộng.
3. **End-to-End Integration Verification**:
   - Kích hoạt phân tích CV trên bảng ứng viên $\rightarrow$ Quan sát timeline trong Drawer.
   - Kích hoạt Import Vieclam24h $\rightarrow$ Đóng modal $\rightarrow$ Quan sát Floating Dock tiếp tục chạy và thông báo hoàn tất.
   - Kết thúc phỏng vấn AI $\rightarrow$ Quan sát timeline đánh giá từ lúc kết thúc phòng đến khi xuất hiện radar chart.
