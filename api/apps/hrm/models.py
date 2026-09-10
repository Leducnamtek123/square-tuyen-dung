from decimal import Decimal
from django.db import models
from shared.models import CommonBaseModel
from apps.accounts.models import User
from apps.profiles.models import Company, JobSeekerProfile


class WorkLocation(CommonBaseModel):
    LOCATION_TYPE_CHOICES = (
        ('HEADQUARTERS', 'Trụ sở chính'),
        ('BRANCH', 'Chi nhánh'),
        ('FACTORY', 'Nhà xưởng / Nhà máy'),
        ('WAREHOUSE', 'Kho hàng'),
        ('RETAIL', 'Điểm bán lẻ / Showroom'),
        ('OTHER', 'Khác'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="work_locations")
    name = models.CharField(max_length=255, verbose_name="Tên trụ sở hoặc chi nhánh")
    code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Mã chi nhánh")
    location_type = models.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES, default='BRANCH', verbose_name="Phân loại địa điểm")
    address = models.CharField(max_length=500, blank=True, null=True, verbose_name="Địa chỉ")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tỉnh / Thành phố")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, verbose_name="Vĩ độ")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, verbose_name="Kinh độ")
    radius_meters = models.PositiveIntegerField(default=200, verbose_name="Bán kính chấm công cho phép (mét)")
    allowed_ip_ranges = models.TextField(blank=True, null=True, verbose_name="Dải IP mạng cho phép chấm công")
    timezone = models.CharField(max_length=50, default="Asia/Ho_Chi_Minh", verbose_name="Múi giờ")
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")

    class Meta:
        ordering = ['name']
        unique_together = ('company', 'code')

    def __str__(self):
        return f"{self.name} ({self.code})" if self.code else self.name


class BiometricDevice(CommonBaseModel):
    PROTOCOL_CHOICES = (
        ('ZKTECO_PULL', 'ZKTeco Kéo dữ liệu (TCP 4370)'),
        ('ZKTECO_PUSH', 'ZKTeco Đẩy tự động (ADMS / Cổng 4200)'),
        ('HIKVISION', 'Hikvision ISUP / ISAPI'),
        ('CAMERA_AI', 'Camera AI nhận diện khuôn mặt'),
        ('OTHER', 'Khác'),
    )
    DIRECTION_CHOICES = (
        ('BOTH', 'Cả vào và ra'),
        ('IN', 'Chỉ quẹt vào'),
        ('OUT', 'Chỉ quẹt ra'),
    )
    STATUS_CHOICES = (
        ('ONLINE', 'Đang kết nối'),
        ('OFFLINE', 'Mất kết nối'),
        ('SYNCING', 'Đang đồng bộ'),
        ('ERROR', 'Lỗi kết nối'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="biometric_devices")
    location = models.ForeignKey(WorkLocation, on_delete=models.CASCADE, related_name="devices", verbose_name="Trụ sở hoặc chi nhánh")
    name = models.CharField(max_length=255, verbose_name="Tên máy chấm công")
    device_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Mã thiết bị")
    protocol = models.CharField(max_length=30, choices=PROTOCOL_CHOICES, default='ZKTECO_PULL', verbose_name="Giao thức kết nối")
    ip_or_domain = models.CharField(max_length=255, verbose_name="Địa chỉ IP hoặc tên miền")
    device_port = models.PositiveIntegerField(default=4370, verbose_name="Cổng thiết bị phần cứng")
    service_port = models.PositiveIntegerField(default=4200, verbose_name="Cổng dịch vụ máy chủ")
    comm_key = models.CharField(max_length=50, default="0", blank=True, verbose_name="Mật mã kết nối (Comm Key)")
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default='BOTH', verbose_name="Hướng quẹt")
    serial_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Số sê-ri máy")
    model_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Dòng máy / Hãng")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OFFLINE', verbose_name="Trạng thái kết nối")
    last_ping = models.DateTimeField(null=True, blank=True, verbose_name="Lần kiểm tra gần nhất")
    last_sync_time = models.DateTimeField(null=True, blank=True, verbose_name="Lần đồng bộ gần nhất")
    last_error_message = models.TextField(null=True, blank=True, verbose_name="Thông điệp lỗi gần nhất")
    total_punches_synced = models.PositiveIntegerField(default=0, verbose_name="Tổng số lượt quẹt đã đồng bộ")
    auto_sync_interval = models.PositiveIntegerField(default=15, verbose_name="Chu kỳ quét tự động (phút)")
    is_active = models.BooleanField(default=True, verbose_name="Kích hoạt")

    class Meta:
        ordering = ['location', 'name']
        unique_together = ('company', 'device_code')

    def __str__(self):
        loc_name = self.location.name if self.location else "Chưa gán chi nhánh"
        return f"{self.name} - {loc_name} ({self.ip_or_domain}:{self.device_port})"


class Department(CommonBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="departments")
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name="children")
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name="managed_departments")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        unique_together = ('company', 'code')

    def __str__(self):
        return f"{self.name} ({self.code})" if self.code else self.name


class Designation(CommonBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="designations")
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Employee(CommonBaseModel):
    GENDER_CHOICES = (
        ('MALE', 'Nam'),
        ('FEMALE', 'Nữ'),
        ('OTHER', 'Khác'),
    )

    STATUS_CHOICES = (
        ('PROBATION', 'Thử việc'),
        ('ACTIVE', 'Chính thức'),
        ('RESIGNED', 'Đã nghỉ việc'),
        ('TERMINATED', 'Sa thải'),
    )

    EMPLOYMENT_TYPE_CHOICES = (
        ('FULL_TIME', 'Toàn thời gian'),
        ('PART_TIME', 'Bán thời gian'),
        ('CONTRACT', 'Hợp đồng'),
        ('INTERN', 'Thực tập sinh'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="employees")
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="employee_profile")
    candidate_profile = models.ForeignKey(JobSeekerProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    onboarded_from_activity = models.ForeignKey('job.JobPostActivity', on_delete=models.SET_NULL, null=True, blank=True, related_name="converted_employees")
    
    employee_code = models.CharField(max_length=50, db_index=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    full_name = models.CharField(max_length=300, db_index=True)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    avatar = models.URLField(max_length=500, blank=True, null=True)
    
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='OTHER')
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    work_location = models.ForeignKey(WorkLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees", verbose_name="Trụ sở hoặc chi nhánh")
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    reports_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name="subordinates")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROBATION', db_index=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='FULL_TIME')
    
    join_date = models.DateField(null=True, blank=True)
    probation_end_date = models.DateField(null=True, blank=True)
    resign_date = models.DateField(null=True, blank=True)
    
    bank_name = models.CharField(max_length=150, blank=True, null=True)
    bank_account_number = models.CharField(max_length=100, blank=True, null=True)
    bank_account_holder = models.CharField(max_length=150, blank=True, null=True)
    tax_id = models.CharField(max_length=100, blank=True, null=True)
    social_insurance_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-create_at']
        unique_together = ('company', 'employee_code')

    def __str__(self):
        return f"{self.full_name} ({self.employee_code})"


class EmploymentContract(CommonBaseModel):
    CONTRACT_TYPE_CHOICES = (
        ('PROBATION', 'Thử việc'),
        ('FIXED_TERM', 'Xác định thời hạn'),
        ('INDEFINITE', 'Không xác định thời hạn'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Hiệu lực'),
        ('EXPIRED', 'Hết hạn'),
        ('TERMINATED', 'Chấm dứt'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="contracts")
    contract_number = models.CharField(max_length=100)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPE_CHOICES, default='FIXED_TERM')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    base_salary = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    allowance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"HĐ {self.contract_number} - {self.employee.full_name}"


class LeaveType(CommonBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="leave_types")
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    days_per_year = models.IntegerField(default=12)
    is_paid = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class LeaveRequest(CommonBaseModel):
    STATUS_CHOICES = (
        ('PENDING', 'Chờ duyệt'),
        ('APPROVED', 'Đã duyệt'),
        ('REJECTED', 'Từ chối'),
        ('CANCELLED', 'Hủy'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    total_days = models.DecimalField(max_digits=5, decimal_places=1, default=1.0)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_leaves")
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-create_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type} ({self.start_date} -> {self.end_date})"


class EmployeeLeaveBalance(CommonBaseModel):
    """Theo dõi quỹ phép và số ngày phép còn lại hàng năm của nhân sự."""

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_balances")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name="employee_balances")
    year = models.PositiveIntegerField(verbose_name="Năm")
    allocated_days = models.DecimalField(max_digits=5, decimal_places=1, default=12.0, verbose_name="Phép tiêu chuẩn")
    seniority_bonus_days = models.DecimalField(max_digits=5, decimal_places=1, default=0.0, verbose_name="Phép thâm niên")
    carried_over_days = models.DecimalField(max_digits=5, decimal_places=1, default=0.0, verbose_name="Phép tồn năm trước")
    used_days = models.DecimalField(max_digits=5, decimal_places=1, default=0.0, verbose_name="Đã sử dụng")
    pending_days = models.DecimalField(max_digits=5, decimal_places=1, default=0.0, verbose_name="Đang chờ duyệt")
    is_deleted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('employee', 'leave_type', 'year')
        ordering = ['-year', 'employee']

    @property
    def total_allowed_days(self) -> float:
        return float(self.allocated_days + self.seniority_bonus_days + self.carried_over_days)

    @property
    def remaining_days(self) -> float:
        return max(0.0, float(self.total_allowed_days - float(self.used_days) - float(self.pending_days)))

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.year}): Còn {self.remaining_days} ngày"


class WorkShift(CommonBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="work_shifts")
    code = models.CharField(max_length=50, verbose_name="Mã ca")
    name = models.CharField(max_length=100, verbose_name="Tên ca")
    start_time = models.TimeField(verbose_name="Giờ bắt đầu")
    end_time = models.TimeField(verbose_name="Giờ kết thúc")
    break_start = models.TimeField(null=True, blank=True, verbose_name="Nghỉ trưa từ")
    break_end = models.TimeField(null=True, blank=True, verbose_name="Nghỉ trưa đến")
    working_hours = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("8.00"), verbose_name="Số giờ công")
    work_factor = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal("1.00"), verbose_name="Hệ số công")
    is_overnight = models.BooleanField(default=False, verbose_name="Ca qua đêm")
    grace_period_late_minutes = models.PositiveIntegerField(default=5, verbose_name="Dung sai đi muộn (phút)")
    grace_period_early_minutes = models.PositiveIntegerField(default=5, verbose_name="Dung sai về sớm (phút)")
    is_active = models.BooleanField(default=True, verbose_name="Kích hoạt")

    class Meta:
        unique_together = ('company', 'code')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class ShiftAssignment(CommonBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="shift_assignments")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="shift_assignments")
    shift = models.ForeignKey(WorkShift, on_delete=models.CASCADE, related_name="assignments")
    date = models.DateField(db_index=True, verbose_name="Ngày làm việc")
    is_off_day = models.BooleanField(default=False, verbose_name="Ngày nghỉ")
    note = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ghi chú")

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['date', 'employee']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date}: {self.shift.code}"


class BiometricPunchLog(CommonBaseModel):
    PUNCH_CHOICES = (
        ('CHECK_IN', 'Vào'),
        ('CHECK_OUT', 'Ra'),
        ('AUTO', 'Tự động'),
    )
    SOURCE_CHOICES = (
        ('ZKTECO', 'Máy ZKTeco'),
        ('EXCEL_IMPORT', 'Nhập file Excel'),
        ('WEB_APP', 'Web App'),
        ('MANUAL', 'Thủ công'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="punch_logs")
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="punch_logs")
    device = models.ForeignKey(BiometricDevice, on_delete=models.SET_NULL, null=True, blank=True, related_name="punch_logs", verbose_name="Thiết bị chấm công")
    location = models.ForeignKey(WorkLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name="punch_logs", verbose_name="Trụ sở hoặc chi nhánh")
    biometric_id = models.CharField(max_length=50, verbose_name="Mã máy chấm công")
    punch_time = models.DateTimeField(db_index=True, verbose_name="Thời gian quẹt")
    device_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tên máy chấm công")
    device_ip = models.CharField(max_length=50, blank=True, null=True, verbose_name="IP máy chấm công")
    punch_type = models.CharField(max_length=20, choices=PUNCH_CHOICES, default='AUTO', verbose_name="Loại quẹt")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='ZKTECO', verbose_name="Nguồn dữ liệu")
    is_duplicate = models.BooleanField(default=False, db_index=True, verbose_name="Cờ quẹt trùng lặp")

    class Meta:
        ordering = ['-punch_time']

    def __str__(self):
        emp_name = self.employee.full_name if self.employee else self.biometric_id
        return f"{emp_name} - {self.punch_time.strftime('%Y-%m-%d %H:%M:%S')} ({self.punch_type})"


class AttendanceRecord(CommonBaseModel):
    STATUS_CHOICES = (
        ('PRESENT', 'Có mặt'),
        ('LATE', 'Đi muộn'),
        ('EARLY_LEAVE', 'Về sớm'),
        ('ABSENT', 'Vắng mặt'),
        ('ON_LEAVE', 'Nghỉ phép'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendances")
    shift = models.ForeignKey(WorkShift, on_delete=models.SET_NULL, null=True, blank=True, related_name="attendance_records")
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    scheduled_in = models.TimeField(null=True, blank=True)
    scheduled_out = models.TimeField(null=True, blank=True)
    late_minutes = models.PositiveIntegerField(default=0)
    early_minutes = models.PositiveIntegerField(default=0)
    working_hours = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.00"))
    effective_work_hours = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.00"))
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.00"))
    status_code = models.CharField(max_length=20, default='X', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')
    is_manually_adjusted = models.BooleanField(default=False)
    adjustment_reason = models.TextField(blank=True, null=True)
    is_locked = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']


class AttendanceRequest(CommonBaseModel):
    REQUEST_TYPE_CHOICES = (
        ('LEAVE', 'Đơn xin nghỉ'),
        ('REGULARISATION', 'Đề nghị cập nhật công'),
        ('BUSINESS_TRIP', 'Đề nghị công tác'),
        ('OVERTIME', 'Đơn làm thêm giờ'),
        ('LATE_EARLY', 'Đơn đi muộn về sớm'),
    )
    STATUS_CHOICES = (
        ('PENDING_STAGE_1', 'Chờ Quản lý duyệt'),
        ('APPROVED_STAGE_1', 'Quản lý đã duyệt - Chờ HR duyệt'),
        ('APPROVED', 'Đã phê duyệt'),
        ('REJECTED', 'Từ chối'),
        ('CANCELLED', 'Hủy đơn'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="attendance_requests")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendance_requests")
    request_type = models.CharField(max_length=30, choices=REQUEST_TYPE_CHOICES, db_index=True, verbose_name="Loại đơn")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Loại phép")
    start_date = models.DateField(verbose_name="Từ ngày")
    end_date = models.DateField(verbose_name="Đến ngày")
    start_time = models.TimeField(null=True, blank=True, verbose_name="Từ giờ")
    end_time = models.TimeField(null=True, blank=True, verbose_name="Đến giờ")
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Số giờ")
    reason = models.TextField(blank=True, null=True, verbose_name="Lý do")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_STAGE_1', db_index=True, verbose_name="Trạng thái")
    manager_reviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_requests_stage1", verbose_name="Quản lý duyệt")
    manager_approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian quản lý duyệt")
    hr_reviewer = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_requests_stage2", verbose_name="HR duyệt")
    hr_approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian HR duyệt")
    rejection_reason = models.TextField(blank=True, null=True, verbose_name="Lý do từ chối")

    class Meta:
        ordering = ['-create_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_request_type_display()} ({self.start_date}): {self.status}"


class MonthlyAttendanceSummary(CommonBaseModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="monthly_attendance_summaries")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="monthly_attendance_summaries")
    month = models.PositiveSmallIntegerField(verbose_name="Tháng")
    year = models.PositiveIntegerField(verbose_name="Năm")
    standard_work_days = models.DecimalField(max_digits=4, decimal_places=1, default=Decimal("22.0"), verbose_name="Công chuẩn")
    actual_work_days = models.DecimalField(max_digits=4, decimal_places=1, default=Decimal("0.0"), verbose_name="Công thực tế")
    paid_leave_days = models.DecimalField(max_digits=4, decimal_places=1, default=Decimal("0.0"), verbose_name="Nghỉ phép hưởng lương")
    unpaid_leave_days = models.DecimalField(max_digits=4, decimal_places=1, default=Decimal("0.0"), verbose_name="Nghỉ không lương")
    overtime_hours_weekday = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0.0"), verbose_name="Giờ OT ngày thường")
    overtime_hours_weekend = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0.0"), verbose_name="Giờ OT cuối tuần")
    overtime_hours_holiday = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0.0"), verbose_name="Giờ OT lễ tết")
    late_occurrences = models.PositiveSmallIntegerField(default=0, verbose_name="Số lần đi muộn")
    early_occurrences = models.PositiveSmallIntegerField(default=0, verbose_name="Số lần về sớm")
    is_locked = models.BooleanField(default=False, verbose_name="Đã khóa")
    locked_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="locked_summaries")
    locked_at = models.DateTimeField(null=True, blank=True)
    pushed_to_payroll_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian chuyển tính lương")

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month', 'employee']

    def __str__(self):
        return f"Summary {self.month}/{self.year} - {self.employee.full_name}: {self.actual_work_days}/{self.standard_work_days} công"


class MonthlyPayrollRecord(CommonBaseModel):
    """Bảng lương hàng tháng cho nhân viên (Vietnam Payroll & Tax)."""

    STATUS_DRAFT = 'DRAFT'
    STATUS_APPROVED = 'APPROVED'
    STATUS_PAID = 'PAID'
    STATUS_CHOICES = (
        (STATUS_DRAFT, 'Bản nháp'),
        (STATUS_APPROVED, 'Đã phê duyệt'),
        (STATUS_PAID, 'Đã chi trả'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="payroll_records")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="payroll_records")
    month = models.PositiveSmallIntegerField(verbose_name="Tháng")
    year = models.PositiveIntegerField(verbose_name="Năm")

    gross_salary = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Lương Gross")
    allowance = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Phụ cấp")
    bonus = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Thưởng")

    working_days_actual = models.PositiveSmallIntegerField(default=22, verbose_name="Ngày công thực tế")
    standard_working_days = models.PositiveSmallIntegerField(default=22, verbose_name="Ngày công chuẩn")
    unpaid_leave_days = models.PositiveSmallIntegerField(default=0, verbose_name="Ngày nghỉ không lương")
    dependents_count = models.PositiveSmallIntegerField(default=0, verbose_name="Số người phụ thuộc")

    total_income = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Tổng thu nhập")

    # Người lao động đóng (10.5%)
    bhxh_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHXH (8%)")
    bhyt_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHYT (1.5%)")
    bhtn_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHTN (1%)")
    total_insurance = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng BH NLĐ")

    # Người sử dụng lao động đóng (23.5%)
    employer_bhxh = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHXH NSDLĐ (17.5%)")
    employer_bhyt = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHYT NSDLĐ (3%)")
    employer_bhtn = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHTN NSDLĐ (1%)")
    employer_union_fee = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Kinh phí Công đoàn (2%)")
    total_employer_insurance = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng BH NSDLĐ")

    taxable_income = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Thu nhập tính thuế")
    personal_income_tax = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Thuế TNCN")

    net_salary = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Lương thực nhận (Net)")
    total_company_expense = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng chi phí Doanh nghiệp")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    payment_date = models.DateField(null=True, blank=True, verbose_name="Ngày thanh toán")
    note = models.TextField(blank=True, default="", verbose_name="Ghi chú")

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month', 'employee']

    def __str__(self):
        return f"Payroll {self.month}/{self.year} - {self.employee.full_name}: Net {self.net_salary:,.0f} VND"

