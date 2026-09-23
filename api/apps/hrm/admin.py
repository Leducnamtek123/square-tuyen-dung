from django.contrib import admin
from apps.hrm.models import (
    WorkLocation,
    BiometricDevice,
    Department,
    Designation,
    Employee,
    EmploymentContract,
    LeaveType,
    LeaveRequest,
    AttendanceRecord,
    EmployeeOnboardingProcess,
    OnboardingTaskItem,
)


@admin.register(WorkLocation)
class WorkLocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'location_type', 'city', 'company', 'is_active')
    search_fields = ('name', 'code', 'city')
    list_filter = ('location_type', 'is_active', 'company')


@admin.register(BiometricDevice)
class BiometricDeviceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'device_code', 'location', 'protocol', 'ip_or_domain', 'device_port', 'status', 'is_active')
    search_fields = ('name', 'device_code', 'ip_or_domain')
    list_filter = ('protocol', 'status', 'is_active', 'company')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'company', 'parent', 'manager', 'is_active')
    search_fields = ('name', 'code')
    list_filter = ('is_active', 'company')


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'code', 'company', 'is_active')
    search_fields = ('title', 'code')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee_code', 'full_name', 'email', 'company', 'department', 'designation', 'status', 'join_date')
    search_fields = ('employee_code', 'full_name', 'email', 'phone')
    list_filter = ('status', 'employment_type', 'company', 'department')


@admin.register(EmploymentContract)
class EmploymentContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'contract_number', 'employee', 'contract_type', 'start_date', 'end_date', 'status')
    search_fields = ('contract_number', 'employee__full_name')


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'days_per_year', 'is_paid')


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'leave_type', 'start_date', 'end_date', 'total_days', 'status')
    list_filter = ('status', 'leave_type')


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'date', 'check_in', 'check_out', 'status')
    list_filter = ('status', 'date')


class OnboardingTaskItemInline(admin.TabularInline):
    from apps.hrm.models import OnboardingTaskItem
    model = OnboardingTaskItem
    extra = 0
    fields = ('order', 'stage', 'code', 'title', 'assigned_role', 'is_completed', 'completed_at')


@admin.register(EmployeeOnboardingProcess)
class EmployeeOnboardingProcessAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'company', 'stage', 'progress_percent', 'target_start_date', 'actual_start_date', 'create_at')
    list_filter = ('stage', 'company')
    search_fields = ('employee__full_name', 'employee__employee_code', 'employee__email')
    inlines = [OnboardingTaskItemInline]

