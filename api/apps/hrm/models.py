from django.db import models
from shared.models import CommonBaseModel
from apps.accounts.models import User
from apps.profiles.models import Company, JobSeekerProfile


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


class AttendanceRecord(CommonBaseModel):
    STATUS_CHOICES = (
        ('PRESENT', 'Có mặt'),
        ('LATE', 'Đi muộn'),
        ('EARLY_LEAVE', 'Về sớm'),
        ('ABSENT', 'Vắng mặt'),
        ('ON_LEAVE', 'Nghỉ phép'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="attendances")
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    working_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']


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

    company = models.ForeignKey('info.Company', on_delete=models.CASCADE, related_name="payroll_records")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="payroll_records")
    month = models.PositiveSmallIntegerField(verbose_name="Tháng")
    year = models.PositiveIntegerField(verbose_name="Năm")

    gross_salary = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Lương Gross")
    allowance = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Phụ cấp")
    bonus = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Thưởng")

    working_days_actual = models.PositiveSmallIntegerField(default=22, verbose_name="Ngày công thực tế")
    standard_working_days = models.PositiveSmallIntegerField(default=22, verbose_name="Ngày công chuẩn")
    unpaid_leave_days = models.PositiveSmallIntegerField(default=0, verbose_name="Ngày nghỉ không lương")

    total_income = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Tổng thu nhập")

    bhxh_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHXH (8%)")
    bhyt_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHYT (1.5%)")
    bhtn_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="BHTN (1%)")
    total_insurance = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Tổng bảo hiểm")

    taxable_income = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Thu nhập tính thuế")
    personal_income_tax = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name="Thuế TNCN")

    net_salary = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Lương thực nhận (Net)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    payment_date = models.DateField(null=True, blank=True, verbose_name="Ngày thanh toán")
    note = models.TextField(blank=True, default="", verbose_name="Ghi chú")

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month', 'employee']

    def __str__(self):
        return f"Payroll {self.month}/{self.year} - {self.employee.full_name}: Net {self.net_salary:,.0f} VND"

