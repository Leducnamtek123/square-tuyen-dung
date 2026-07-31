from django.contrib import admin
from apps.hrm.models import (
    Department,
    Designation,
    Employee,
    EmploymentContract,
    LeaveType,
    LeaveRequest,
    AttendanceRecord,
)


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
