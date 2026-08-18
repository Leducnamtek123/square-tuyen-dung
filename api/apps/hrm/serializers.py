from rest_framework import serializers
from apps.hrm.models import (
    Department,
    Designation,
    Employee,
    EmploymentContract,
    LeaveType,
    LeaveRequest,
    AttendanceRecord,
)


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'company', 'name', 'code', 'parent', 'parent_name',
            'manager', 'manager_name', 'description', 'is_active',
            'employee_count', 'create_at', 'update_at'
        ]
        read_only_fields = ['company', 'create_at', 'update_at']


class DesignationSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Designation
        fields = [
            'id', 'company', 'title', 'code', 'description',
            'is_active', 'employee_count', 'create_at', 'update_at'
        ]
        read_only_fields = ['company', 'create_at', 'update_at']


class EmploymentContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = EmploymentContract
        fields = [
            'id', 'employee', 'employee_name', 'contract_number',
            'contract_type', 'start_date', 'end_date', 'base_salary',
            'allowance', 'status', 'notes', 'create_at', 'update_at'
        ]
        read_only_fields = ['create_at', 'update_at']


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_title = serializers.CharField(source='designation.title', read_only=True)
    reports_to_name = serializers.CharField(source='reports_to.full_name', read_only=True)
    contracts = EmploymentContractSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'company', 'user', 'candidate_profile', 'onboarded_from_activity',
            'employee_code', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'avatar',
            'gender', 'date_of_birth', 'address', 'department', 'department_name',
            'designation', 'designation_title', 'reports_to', 'reports_to_name',
            'status', 'employment_type', 'join_date', 'probation_end_date',
            'resign_date', 'bank_name', 'bank_account_number', 'bank_account_holder',
            'tax_id', 'social_insurance_id', 'contracts', 'create_at', 'update_at'
        ]
        read_only_fields = ['company', 'create_at', 'update_at']


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'company', 'name', 'code', 'days_per_year', 'is_paid']
        read_only_fields = ['company']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'total_days', 'reason', 'status',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'create_at', 'update_at'
        ]
        read_only_fields = ['create_at', 'update_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee', 'employee_name', 'date', 'check_in', 'check_out',
            'working_hours', 'status', 'notes', 'create_at', 'update_at'
        ]
        read_only_fields = ['create_at', 'update_at']


class OnboardCandidateSerializer(serializers.Serializer):
    job_application_id = serializers.IntegerField(required=False, allow_null=True)
    application_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    applicationId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    candidate_profile_id = serializers.IntegerField(required=False, allow_null=True)
    candidateProfileId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default='')
    department_id = serializers.IntegerField(required=False, allow_null=True)
    departmentId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    designation_id = serializers.IntegerField(required=False, allow_null=True)
    designationId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    reports_to_id = serializers.IntegerField(required=False, allow_null=True)
    reportsToId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    join_date = serializers.DateField(required=False, allow_null=True)
    joinDate = serializers.DateField(required=False, allow_null=True, write_only=True)
    probation_end_date = serializers.DateField(required=False, allow_null=True)
    probationEndDate = serializers.DateField(required=False, allow_null=True, write_only=True)
    base_salary = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=0)
    baseSalary = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=0, write_only=True)
    allowance = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=0)
    employment_type = serializers.CharField(required=False, default='FULL_TIME')
    employmentType = serializers.CharField(required=False, write_only=True)
    status = serializers.CharField(required=False, default='PROBATION')
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if not attrs.get('job_application_id'):
            attrs['job_application_id'] = attrs.get('application_id') or attrs.get('applicationId')
        if not attrs.get('candidate_profile_id'):
            attrs['candidate_profile_id'] = attrs.get('candidateProfileId')
        if not attrs.get('department_id'):
            attrs['department_id'] = attrs.get('departmentId')
        if not attrs.get('designation_id'):
            attrs['designation_id'] = attrs.get('designationId')
        if not attrs.get('reports_to_id'):
            attrs['reports_to_id'] = attrs.get('reportsToId')
        if not attrs.get('join_date'):
            attrs['join_date'] = attrs.get('joinDate')
        if not attrs.get('probation_end_date'):
            attrs['probation_end_date'] = attrs.get('probationEndDate')
        if not attrs.get('base_salary') and attrs.get('baseSalary'):
            attrs['base_salary'] = attrs.get('baseSalary')
        if not attrs.get('employment_type') and attrs.get('employmentType'):
            attrs['employment_type'] = attrs.get('employmentType')
        return attrs
