# Hệ Thống Nhập/Xuất Dữ Liệu Doanh Nghiệp (Enterprise Import/Export System)

Hệ thống Import/Export được xây dựng dưới dạng **khả năng nghiệp vụ cốt lõi (Cross-cutting Business Capability)**, tuân thủ nghiêm ngặt các nguyên tắc kiến trúc:

1. **Backend as Source of Truth**: Toàn bộ định nghĩa trường, quyền hạn truy cập, quan hệ khóa ngoại và quy tắc toàn vẹn dữ liệu được kiểm soát tập trung tại máy chủ.
2. **Tenant Isolation Tuyệt Đối**: Dữ liệu xuất và nhập luôn được cô lập theo `active_company` của tài khoản thực hiện. Tuyệt đối không để lộ dữ liệu giữa các doanh nghiệp.
3. **Explicit Domain Definitions**: Mỗi đối tượng nghiệp vụ (Ứng viên, Nhân viên, Tin tuyển dụng, Phòng ban, Điểm danh, Bảng lương, Nhật ký kiểm toán) có một file định nghĩa riêng biệt kế thừa `BaseExchangeDefinition`, không dùng engine tổng quát phản chiếu trực tiếp schema cơ sở dữ liệu.
4. **Kiểm Tra 3 Lớp (3-Layer Validation)**:
   - **Layer A (Cấu trúc & Cột)**: Đối chiếu tiêu đề cột chuẩn và bí danh (aliases), phát hiện cột thiếu/thừa.
   - **Layer B (Trường & Định dạng)**: Chuẩn hóa và làm sạch email, số điện thoại, ngày tháng, số thực, danh mục (enums).
   - **Layer C (Nghiệp vụ & Quan hệ)**: Phát hiện trùng lặp trong file, kiểm tra tồn tại trong DB theo chế độ (`create`, `update`, `upsert`), giải quyết liên kết khóa ngoại (Foreign Keys) trong phạm vi công ty.
5. **An Toàn Giao Dịch (Transactional Integrity)**: Hỗ trợ `atomic_import = True`. Khi phát hiện dòng dữ liệu không hợp lệ, hệ thống từ chối commit và cung cấp file báo cáo lỗi Excel chi tiết với cột giải trình lỗi.
6. **Xử Lý Bất Đồng Bộ (Async & Background)**: Các tệp dữ liệu lớn (> 200 dòng) được chuyển sang Celery task xử lý nền với cập nhật tiến trình thực tế (`progress`, `current_step`).

---

## Danh Sách Đối Tượng Nghiệp Vụ Đã Đăng Ký (12 Domains)

| Entity Type | Mô Tả Nghiệp Vụ | Hỗ Trợ Xuất | Hỗ Trợ Nhập | Khóa Nhận Diện | Ghi Chú An Toàn & Phân Quyền |
|---|---|:---:|:---:|---|---|
| `candidate` | Hồ sơ ứng viên doanh nghiệp | Có | Có | `email`, `phone` | Tenant scoped `EmployerCandidateProfile` |
| `employee` | Nhân viên HRM | Có | Có | `employeeCode`, `email`, `taxId` | Tự động liên kết Phòng ban, Chức danh, Chi nhánh |
| `job_post` | Tin tuyển dụng | Có | Có | `title` | Trạng thái mặc định Chờ duyệt (`PENDING`) |
| `department` | Phòng ban doanh nghiệp | Có | Có | `code`, `name` | Tự động phân cấp cây phòng ban (cha/con) |
| `attendance_punch` | Dữ liệu chấm công sinh trắc học | Có | Có | `employeeCode` + `punchTime` | Chấm công từ máy vân tay / Excel |
| `payroll` | Bảng lương hàng tháng HRM | Có | Không | — | Định dạng tài chính VND, tính toán tự động |
| `audit_log` | Nhật ký kiểm toán hệ thống | Có | Không | — | Quyền Admin/Staff, ghi nhận lịch sử xuất |
| `question_bank` | Ngân hàng câu hỏi phỏng vấn | Có | Có | `text`, `title` | Quản lý câu hỏi, danh mục, thời lượng |
| `interview` | Danh sách lịch phỏng vấn AI/Trực tiếp | Có | Không | — | Lọc theo doanh nghiệp / người phỏng vấn |
| `leave_request` | Đơn xin nghỉ phép & điểm danh HRM | Có | Không | — | Quản lý trạng thái phê duyệt & phân loại phép |
| `user` | Danh sách tài khoản người dùng | Có | Không | — | Quyền Admin/Staff, quản trị hệ thống |
| `company` | Danh sách hồ sơ doanh nghiệp | Có | Không | — | Quyền Admin/Staff, quản lý đối tác |

---

## Ma Trận Tích Hợp Giao Diện (Frontend Views Matrix)

| Khu Vực (Domain) | Màn Hình (View / Page) | Tính Năng Import | Tính Năng Export |
|---|---|:---:|:---:|
| **Employer** | Hồ sơ đã lưu (`SavedResumeCard`) | `ImportModal entity="candidate"` | `ExportModal entity="candidate"` |
| **Employer** | Ứng viên ứng tuyển (`AppliedResumeCard`) | `ImportModal entity="candidate"` | `ExportModal entity="candidate"` |
| **Employer** | Quản lý tin tuyển dụng (`JobPostCard`) | `ImportModal entity="job_post"` | `ExportModal entity="job_post"` |
| **Employer** | Ngân hàng câu hỏi (`QuestionBankCard`) | `ImportModal entity="question_bank"` | `ExportModal entity="question_bank"` |
| **Employer** | Danh sách phỏng vấn (`InterviewListCard`) | — | `ExportModal entity="interview"` |
| **HRM** | Danh bạ nhân viên (`EmployeeListPage`) | `ImportModal entity="employee"` | `ExportModal entity="employee"` |
| **HRM** | Cơ cấu phòng ban (`DepartmentListPage`) | `ImportModal entity="department"` | `ExportModal entity="department"` |
| **HRM** | Bảng chấm công (`AttendanceListPage`) | `ImportModal entity="attendance_punch"` | `ExportModal entity="attendance_punch"` |
| **HRM** | Bảng lương hàng tháng (`PayrollListPage`) | — | `ExportModal entity="payroll"` |
| **HRM** | Quản lý nghỉ phép (`LeaveListPage`) | — | `ExportModal entity="leave_request"` |
| **Admin** | Nhật ký hệ thống (`AuditLogsPage`) | — | `ExportModal entity="audit_log"` |
| **Admin** | Quản lý người dùng (`UsersPage`) | — | `ExportModal entity="user"` |
| **Admin** | Quản lý doanh nghiệp (`CompaniesPage`) | — | `ExportModal entity="company"` |

---

## Hướng Dẫn Thêm Đối Tượng Mới Trong 5 Bước

### Bước 1: Tạo file định nghĩa tại `api/apps/exchange/definitions/<entity_name>.py`

```python
from typing import List, Optional, Tuple
from django.db import models
from apps.exchange.base import BaseExchangeDefinition, ExportField, ImportField, ValidationIssue, ErrorCodes

class SampleDefinition(BaseExchangeDefinition):
    entity_type = "sample"
    label = "Đối Tượng Mẫu"
    model = SampleModel
    permission_roles = ["EMPLOYER", "ADMIN"]
    supported_modes = ["create", "update", "upsert"]
    default_matching_key = "code"
    matching_keys = ["code", "email"]
    atomic_import = True
```

### Bước 2: Khai báo `export_fields` và `import_fields`

```python
    export_fields = {
        "code": ExportField(key="code", label="Mã đối tượng", model_field="code"),
        "name": ExportField(key="name", label="Tên đối tượng", model_field="name"),
        "status": ExportField(
            key="status",
            label="Trạng thái",
            formatter=lambda obj, k: obj.get_status_display(),
        ),
    }

    import_fields = {
        "code": ImportField(
            key="code",
            label="Mã đối tượng",
            aliases=["Mã", "Code"],
            required=True,
            field_type="string",
            example="SMP-001",
            description="Mã định danh duy nhất",
        ),
        "name": ImportField(
            key="name",
            label="Tên đối tượng",
            aliases=["Tên", "Name"],
            required=True,
            field_type="string",
            example="Nguyễn Văn A",
        ),
    }
```

### Bước 3: Thiết lập QuerySet bảo đảm Tenant Isolation

```python
    def get_queryset(self, user, company, filters: Optional[dict] = None):
        # BẮT BUỘC: Lọc theo company để ngăn ngừa rò rỉ dữ liệu giữa các tenant
        qs = SampleModel.objects.filter(company=company)
        if filters and filters.get("status"):
            qs = qs.filter(status=filters["status"])
        return qs.order_by("-id")
```

### Bước 4: Cài đặt logic liên kết và lưu trữ dữ liệu

```python
    def resolve_relationships(self, row_dict: dict, company) -> Tuple[dict, List[ValidationIssue]]:
        issues = []
        dept_code = row_dict.get("departmentCode")
        if dept_code:
            dept = Department.objects.filter(company=company, code__iexact=dept_code).first()
            if dept:
                row_dict["_resolved_department"] = dept
            else:
                issues.append(
                    ValidationIssue(
                        field="departmentCode",
                        code=ErrorCodes.IMPORT_RELATION_NOT_FOUND,
                        message=f"Phòng ban mã '{dept_code}' không tồn tại.",
                        value=dept_code,
                    )
                )
        return row_dict, issues

    def create_record(self, validated_data: dict, company, user) -> models.Model:
        return SampleModel.objects.create(
            company=company,
            created_by=user,
            code=validated_data["code"],
            name=validated_data["name"],
            department=validated_data.get("_resolved_department"),
        )

    def update_record(self, instance: models.Model, validated_data: dict, company, user) -> models.Model:
        instance.name = validated_data.get("name", instance.name)
        if "_resolved_department" in validated_data:
            instance.department = validated_data["_resolved_department"]
        instance.save()
        return instance
```

### Bước 5: Đăng ký vào Registry

Trong `api/apps/exchange/registry.py` (hoặc `apps/exchange/definitions/__init__.py`):

```python
from apps.exchange.definitions.sample import SampleDefinition

exchange_registry.register(SampleDefinition())
```

---

## Tích Hợp Frontend

### 1. Sử dụng ImportModal Component
```tsx
import { useState } from 'react';
import { ImportModal } from '@/components/Common/ImportModal';

export const MyManagementView = () => {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setImportOpen(true)}>Nhập Excel</Button>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entity="candidate"
        title="Nhập hồ sơ ứng viên"
        onSuccess={(result) => {
          console.log('Nhập thành công:', result.createdRows);
        }}
      />
    </>
  );
};
```

### 2. Sử dụng ExportModal Component (Tự Động Kết Nối Backend)
```tsx
import { useState } from 'react';
import { ExportModal } from '@/components/Common/ExportModal';

export const MyManagementView = () => {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setExportOpen(true)}>Xuất Excel</Button>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        entity="candidate"
        columns={[
          { id: 'fullName', label: 'Họ và tên', checked: true },
          { id: 'email', label: 'Email', checked: true },
        ]}
      />
    </>
  );
};
```

### 3. Sử dụng ProgressiveActivity Độc Lập Cho Tác Vụ Dài
```tsx
import { ProgressiveActivity } from '@/components/Common/ProgressiveActivity';

<ProgressiveActivity
  steps={[
    { id: '1', label: 'Đọc file', status: 'completed' },
    { id: '2', label: 'Kiểm tra dữ liệu', status: 'running' },
    { id: '3', label: 'Lưu cơ sở dữ liệu', status: 'pending' },
  ]}
  progress={65}
  currentStepText="Đang đối chiếu dòng 650/1000..."
  status="running"
  totalRows={1000}
  processedRows={650}
/>
```
