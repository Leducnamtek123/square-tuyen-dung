from decimal import Decimal
from rest_framework import serializers
from apps.accounts.models import User
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

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'isActive' in payload and 'is_active' not in payload:
            payload['is_active'] = payload.get('isActive')
        return super().to_internal_value(payload)

    def validate(self, attrs):
        request = self.context.get('request')
        parent = attrs.get('parent')
        manager = attrs.get('manager')
        company = attrs.get('company')
        if not company and self.instance:
            company = self.instance.company
        if not company and request:
            from apps.hrm.views import _get_company_for_request
            company = _get_company_for_request(request)

        if parent:
            if company and parent.company_id != company.id:
                raise serializers.ValidationError({"parent": "Phòng ban cha không thuộc cùng công ty."})
            if self.instance and parent.id == self.instance.id:
                raise serializers.ValidationError({"parent": "Phòng ban không thể làm cha của chính nó."})
            # Circular hierarchy detection
            if self.instance:
                curr = parent.parent
                seen = {self.instance.id, parent.id}
                while curr:
                    if curr.id == self.instance.id:
                        raise serializers.ValidationError({"parent": "Phát hiện vòng lặp phân cấp phòng ban (circular hierarchy)."})
                    if curr.id in seen:
                        break
                    seen.add(curr.id)
                    curr = curr.parent

        if manager:
            if company and manager.company_id != company.id:
                raise serializers.ValidationError({"manager": "Trưởng phòng phải là nhân viên thuộc cùng công ty."})

        return attrs


class DesignationSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Designation
        fields = [
            'id', 'company', 'title', 'code', 'description',
            'is_active', 'employee_count', 'create_at', 'update_at'
        ]
        read_only_fields = ['company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'isActive' in payload and 'is_active' not in payload:
            payload['is_active'] = payload.get('isActive')
        return super().to_internal_value(payload)


class EmploymentContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    probation_period_months = serializers.IntegerField(required=False, write_only=True)
    probation_months = serializers.IntegerField(required=False, write_only=True)

    class Meta:
        model = EmploymentContract
        fields = [
            'id', 'employee', 'employee_name', 'contract_number',
            'contract_type', 'start_date', 'end_date', 'base_salary',
            'allowance', 'status', 'notes', 'probation_period_months',
            'probation_months', 'create_at', 'update_at'
        ]
        read_only_fields = ['create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'contractNumber': 'contract_number',
            'contractType': 'contract_type',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'baseSalary': 'base_salary',
            'probationPeriodMonths': 'probation_period_months',
            'probationMonths': 'probation_months',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)

    def validate(self, attrs):
        start_date = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date') if 'end_date' in attrs else (self.instance.end_date if self.instance else None)
        base_salary = attrs.get('base_salary') if 'base_salary' in attrs else (self.instance.base_salary if self.instance else None)
        allowance = attrs.get('allowance') if 'allowance' in attrs else (self.instance.allowance if self.instance else None)
        employee = attrs.get('employee') or (self.instance.employee if self.instance else None)
        probation_period = attrs.get('probation_period_months') if 'probation_period_months' in attrs else attrs.get('probation_months')

        if probation_period is not None and probation_period < 0:
            raise serializers.ValidationError({"probation_period_months": "Thời gian thử việc không thể là số âm."})

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Ngày kết thúc hợp đồng không thể trước ngày bắt đầu."})

        if base_salary is not None and base_salary < 0:
            raise serializers.ValidationError({"base_salary": "Lương cơ bản không thể là số âm."})

        if allowance is not None and allowance < 0:
            raise serializers.ValidationError({"allowance": "Phụ cấp không thể là số âm."})

        if self.instance and self.instance.status in ['TERMINATED', 'EXPIRED']:
            new_status = attrs.get('status')
            if new_status and new_status == 'TERMINATED' and self.instance.status == 'TERMINATED':
                raise serializers.ValidationError({"status": "Hợp đồng đã ở trạng thái chấm dứt, không thể thao tác lại."})
            if new_status and new_status == 'TERMINATED' and self.instance.status == 'EXPIRED':
                raise serializers.ValidationError({"status": "Không thể hủy hợp đồng đã hết hạn."})

        request = self.context.get('request')
        if request and employee:
            from apps.hrm.views import _get_company_for_request
            req_company = _get_company_for_request(request)
            if req_company and employee.company_id != req_company.id:
                raise serializers.ValidationError({"employee": "Nhân viên không thuộc công ty hiện tại."})

        return attrs


class EmployeeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        validators=[],
    )
    department_name = serializers.CharField(source='department.name', read_only=True)
    work_location_name = serializers.CharField(source='work_location.name', read_only=True)
    designation_title = serializers.CharField(source='designation.title', read_only=True)
    reports_to_name = serializers.CharField(source='reports_to.full_name', read_only=True)
    contracts = EmploymentContractSerializer(many=True, read_only=True)
    employee_code = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'company', 'user', 'candidate_profile', 'onboarded_from_activity',
            'employee_code', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'avatar',
            'gender', 'date_of_birth', 'address', 'department', 'department_name',
            'work_location', 'work_location_name',
            'designation', 'designation_title', 'reports_to', 'reports_to_name',
            'status', 'employment_type', 'join_date', 'probation_end_date',
            'resign_date', 'bank_name', 'bank_account_number', 'bank_account_holder',
            'tax_id', 'social_insurance_id', 'dependents_count', 'contracts', 'create_at', 'update_at'
        ]
        read_only_fields = ['company', 'create_at', 'update_at']
        extra_kwargs = {
            'employee_code': {'required': False, 'allow_blank': True},
            'full_name': {'required': False, 'allow_blank': True},
        }

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeCode': 'employee_code',
            'firstName': 'first_name',
            'lastName': 'last_name',
            'fullName': 'full_name',
            'dateOfBirth': 'date_of_birth',
            'reportsTo': 'reports_to',
            'workLocation': 'work_location',
            'workLocationId': 'work_location',
            'work_location_id': 'work_location',
            'employmentType': 'employment_type',
            'joinDate': 'join_date',
            'probationEndDate': 'probation_end_date',
            'resignDate': 'resign_date',
            'bankName': 'bank_name',
            'bankAccountNumber': 'bank_account_number',
            'bankAccountHolder': 'bank_account_holder',
            'taxId': 'tax_id',
            'socialInsuranceId': 'social_insurance_id',
            'dependentsCount': 'dependents_count',
            'candidateProfile': 'candidate_profile',
            'onboardedFromActivity': 'onboarded_from_activity',
            'userId': 'user',
            'user_id': 'user',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)

    def validate(self, attrs):
        department = attrs.get('department')
        designation = attrs.get('designation')
        reports_to = attrs.get('reports_to')
        company = attrs.get('company')
        if not company and self.instance:
            company = self.instance.company
        if not company:
            request = self.context.get('request')
            if request:
                from apps.hrm.views import _get_company_for_request
                company = _get_company_for_request(request)

        # Safe unlinking / verification for OneToOne user field
        user = attrs.get('user')
        if user:
            conflict_emps = Employee.objects.filter(user=user)
            if self.instance:
                conflict_emps = conflict_emps.exclude(id=self.instance.id)
            if conflict_emps.exists():
                conflict_emps.update(user=None)

        if company:
            if department and department.company_id != company.id:
                raise serializers.ValidationError({"department": "Phòng ban không thuộc công ty này."})
            if designation and designation.company_id != company.id:
                raise serializers.ValidationError({"designation": "Chức danh không thuộc công ty này."})
            if reports_to:
                if reports_to.company_id != company.id:
                    raise serializers.ValidationError({"reports_to": "Người quản lý trực tiếp không thuộc công ty này."})
                if self.instance and reports_to.id == self.instance.id:
                    raise serializers.ValidationError({"reports_to": "Nhân viên không thể tự báo cáo cho chính mình."})

        join_date = attrs.get('join_date') or (self.instance.join_date if self.instance else None)
        probation_end_date = attrs.get('probation_end_date') if 'probation_end_date' in attrs else (self.instance.probation_end_date if self.instance else None)
        if join_date and probation_end_date and probation_end_date < join_date:
            raise serializers.ValidationError({"probation_end_date": "Ngày kết thúc thử việc không thể trước ngày bắt đầu làm việc."})

        work_location = attrs.get('work_location')
        if work_location and company and work_location.company_id != company.id:
            raise serializers.ValidationError({"work_location": "Địa điểm làm việc không thuộc công ty này."})

        return attrs


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'company', 'name', 'code', 'days_per_year', 'is_paid']
        read_only_fields = ['company']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'daysPerYear': 'days_per_year',
            'isPaid': 'is_paid',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


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

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'leaveType': 'leave_type',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'totalDays': 'total_days',
            'rejectionReason': 'rejection_reason',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)

    def validate(self, attrs):
        start_date = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date') or (self.instance.end_date if self.instance else None)
        total_days = attrs.get('total_days') if 'total_days' in attrs else (self.instance.total_days if self.instance else None)
        employee = attrs.get('employee') or (self.instance.employee if self.instance else None)
        leave_type = attrs.get('leave_type') or (self.instance.leave_type if self.instance else None)

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Ngày kết thúc nghỉ phép không thể trước ngày bắt đầu."})

        if total_days is not None and total_days <= 0:
            raise serializers.ValidationError({"total_days": "Tổng số ngày nghỉ phép phải lớn hơn 0."})

        if employee and leave_type and leave_type.company_id != employee.company_id:
            raise serializers.ValidationError({"leave_type": "Loại nghỉ phép không thuộc công ty của nhân viên này."})

        request = self.context.get('request')
        if request and employee:
            from apps.hrm.views import _get_company_for_request
            req_company = _get_company_for_request(request)
            if req_company and employee.company_id != req_company.id:
                raise serializers.ValidationError({"employee": "Nhân viên không thuộc công ty hiện tại."})

        # Check overlapping leave requests for same employee
        if employee and start_date and end_date:
            overlap_qs = LeaveRequest.objects.filter(
                employee=employee,
                status__in=['PENDING', 'APPROVED'],
                start_date__lte=end_date,
                end_date__gte=start_date,
            )
            if self.instance:
                overlap_qs = overlap_qs.exclude(id=self.instance.id)
            if overlap_qs.exists():
                raise serializers.ValidationError({"start_date": "Nhân viên đã có đơn nghỉ phép trùng với khoảng thời gian này."})

        return attrs


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True, default=None, allow_null=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True, default=None, allow_null=True)
    shift_code = serializers.CharField(source='shift.code', read_only=True, default=None, allow_null=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee', 'employee_name', 'employee_code', 'department_name',
            'shift', 'shift_name', 'shift_code', 'date', 'check_in', 'check_out',
            'scheduled_in', 'scheduled_out', 'late_minutes', 'early_minutes',
            'working_hours', 'effective_work_hours', 'overtime_hours',
            'status_code', 'status', 'status_label',
            'is_manually_adjusted', 'adjustment_reason', 'is_locked',
            'notes', 'create_at', 'update_at'
        ]
        read_only_fields = ['create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'shiftId': 'shift',
            'checkIn': 'check_in',
            'checkOut': 'check_out',
            'scheduledIn': 'scheduled_in',
            'scheduledOut': 'scheduled_out',
            'lateMinutes': 'late_minutes',
            'earlyMinutes': 'early_minutes',
            'workingHours': 'working_hours',
            'effectiveWorkHours': 'effective_work_hours',
            'overtimeHours': 'overtime_hours',
            'statusCode': 'status_code',
            'isManuallyAdjusted': 'is_manually_adjusted',
            'adjustmentReason': 'adjustment_reason',
            'isLocked': 'is_locked',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)

    def validate(self, attrs):
        from django.utils import timezone
        check_in = attrs.get('check_in') if 'check_in' in attrs else (self.instance.check_in if self.instance else None)
        check_out = attrs.get('check_out') if 'check_out' in attrs else (self.instance.check_out if self.instance else None)
        working_hours = attrs.get('working_hours') if 'working_hours' in attrs else (self.instance.working_hours if self.instance else None)
        effective_work_hours = attrs.get('effective_work_hours') if 'effective_work_hours' in attrs else (self.instance.effective_work_hours if self.instance else None)
        overtime_hours = attrs.get('overtime_hours') if 'overtime_hours' in attrs else (self.instance.overtime_hours if self.instance else None)
        late_minutes = attrs.get('late_minutes') if 'late_minutes' in attrs else (self.instance.late_minutes if self.instance else None)
        early_minutes = attrs.get('early_minutes') if 'early_minutes' in attrs else (self.instance.early_minutes if self.instance else None)
        employee = attrs.get('employee') or (self.instance.employee if self.instance else None)
        record_date = attrs.get('date') or (self.instance.date if self.instance else None)

        if record_date and record_date > timezone.now().date():
            raise serializers.ValidationError({"date": "Không thể chấm công cho ngày trong tương lai."})

        if record_date and record_date == timezone.now().date():
            now_time = timezone.now().time()
            if check_in and check_in > now_time:
                raise serializers.ValidationError({"check_in": "Giờ check-in không thể ở tương lai."})

        if check_in and check_out and check_out < check_in:
            raise serializers.ValidationError({"check_out": "Giờ ra (check-out) phải sau giờ vào (check-in) trong cùng ngày."})

        if working_hours is not None and working_hours < 0:
            raise serializers.ValidationError({"working_hours": "Số giờ làm việc không thể là số âm."})

        if effective_work_hours is not None and effective_work_hours < 0:
            raise serializers.ValidationError({"effective_work_hours": "Số giờ làm việc thực tế không thể là số âm."})

        if overtime_hours is not None and overtime_hours < 0:
            raise serializers.ValidationError({"overtime_hours": "Số giờ làm thêm không thể là số âm."})

        if late_minutes is not None and late_minutes < 0:
            raise serializers.ValidationError({"late_minutes": "Số phút đi muộn không thể là số âm."})

        if early_minutes is not None and early_minutes < 0:
            raise serializers.ValidationError({"early_minutes": "Số phút về sớm không thể là số âm."})

        if not self.instance and employee and record_date:
            if AttendanceRecord.objects.filter(employee=employee, date=record_date).exists():
                raise serializers.ValidationError({"date": "Bản ghi chấm công cho ngày này đã tồn tại."})

        request = self.context.get('request')
        if request and employee:
            from apps.hrm.views import _get_company_for_request
            req_company = _get_company_for_request(request)
            if req_company and employee.company_id != req_company.id:
                raise serializers.ValidationError({"employee": "Nhân viên không thuộc công ty hiện tại."})

        return attrs


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

        base_salary = attrs.get('base_salary')
        if base_salary is not None and Decimal(str(base_salary)) < 0:
            raise serializers.ValidationError({"base_salary": "Lương cơ bản không thể là số âm."})

        allowance = attrs.get('allowance')
        if allowance is not None and Decimal(str(allowance)) < 0:
            raise serializers.ValidationError({"allowance": "Phụ cấp không thể là số âm."})

        join_date = attrs.get('join_date')
        probation_end_date = attrs.get('probation_end_date')
        if join_date and probation_end_date and probation_end_date < join_date:
            raise serializers.ValidationError({"probation_end_date": "Ngày kết thúc thử việc không thể trước ngày bắt đầu làm việc."})

        request = self.context.get('request')
        if request:
            from apps.hrm.views import _get_company_for_request
            req_company = _get_company_for_request(request)
            if req_company:
                dept_id = attrs.get('department_id')
                if dept_id and not Department.objects.filter(id=dept_id, company=req_company).exists():
                    raise serializers.ValidationError({"department_id": "Phòng ban không thuộc công ty hiện tại."})
                desig_id = attrs.get('designation_id')
                if desig_id and not Designation.objects.filter(id=desig_id, company=req_company).exists():
                    raise serializers.ValidationError({"designation_id": "Chức danh không thuộc công ty hiện tại."})
                rep_id = attrs.get('reports_to_id')
                if rep_id and not Employee.objects.filter(id=rep_id, company=req_company).exists():
                    raise serializers.ValidationError({"reports_to_id": "Người quản lý trực tiếp không thuộc công ty hiện tại."})

        return attrs


class EmployeeLeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    total_allowed_days = serializers.FloatField(read_only=True)
    remaining_days = serializers.FloatField(read_only=True)

    class Meta:
        from .models import EmployeeLeaveBalance
        model = EmployeeLeaveBalance
        fields = [
            'id', 'employee', 'employee_name', 'employee_code', 'leave_type', 'leave_type_name',
            'year', 'allocated_days', 'seniority_bonus_days', 'carried_over_days',
            'used_days', 'pending_days', 'total_allowed_days', 'remaining_days',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'create_at', 'update_at', 'total_allowed_days', 'remaining_days']


class RenewContractSerializer(serializers.Serializer):
    contract_number = serializers.CharField(max_length=100)
    contract_type = serializers.ChoiceField(choices=EmploymentContract.CONTRACT_TYPE_CHOICES)
    start_date = serializers.DateField()
    end_date = serializers.DateField(required=False, allow_null=True)
    base_salary = serializers.DecimalField(max_digits=15, decimal_places=2)
    allowance = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=0)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'contractNumber': 'contract_number',
            'contractType': 'contract_type',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'baseSalary': 'base_salary',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class QuickCheckinSerializer(serializers.Serializer):
    employee_id = serializers.IntegerField()
    date = serializers.DateField(required=False)
    status = serializers.ChoiceField(choices=AttendanceRecord.STATUS_CHOICES, default='PRESENT')
    check_in = serializers.TimeField(required=False, allow_null=True)
    check_out = serializers.TimeField(required=False, allow_null=True)
    working_hours = serializers.DecimalField(max_digits=4, decimal_places=2, required=False, default=8.0)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee_id',
            'checkIn': 'check_in',
            'checkOut': 'check_out',
            'workingHours': 'working_hours',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class MonthlyPayrollRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True, default=None, allow_null=True)
    designation_title = serializers.CharField(source='employee.designation.title', read_only=True, default=None, allow_null=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        from .models import MonthlyPayrollRecord
        model = MonthlyPayrollRecord
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code', 'department_name', 'designation_title',
            'month', 'year', 'gross_salary', 'allowance', 'bonus',
            'working_days_actual', 'standard_working_days', 'unpaid_leave_days', 'dependents_count',
            'total_income',
            # NLĐ đóng
            'bhxh_amount', 'bhyt_amount', 'bhtn_amount', 'total_insurance',
            # NSDLĐ đóng
            'employer_bhxh', 'employer_bhyt', 'employer_bhtn', 'employer_union_fee', 'total_employer_insurance',
            # Thuế & Thực nhận
            'taxable_income', 'personal_income_tax', 'net_salary', 'total_company_expense',
            'status', 'status_label', 'payment_date', 'note', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'grossSalary': 'gross_salary',
            'workingDaysActual': 'working_days_actual',
            'standardWorkingDays': 'standard_working_days',
            'unpaidLeaveDays': 'unpaid_leave_days',
            'dependentsCount': 'dependents_count',
            'totalIncome': 'total_income',
            'totalInsurance': 'total_insurance',
            'netSalary': 'net_salary',
            'taxableIncome': 'taxable_income',
            'personalIncomeTax': 'personal_income_tax',
            'totalCompanyExpense': 'total_company_expense',
            'paymentDate': 'payment_date',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class WorkShiftSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import WorkShift
        model = WorkShift
        fields = [
            'id', 'company', 'code', 'name', 'start_time', 'end_time',
            'break_start', 'break_end', 'working_hours', 'work_factor',
            'grace_period_late_minutes', 'grace_period_early_minutes',
            'is_overnight', 'is_active', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'startTime': 'start_time',
            'endTime': 'end_time',
            'breakStart': 'break_start',
            'breakEnd': 'break_end',
            'workingHours': 'working_hours',
            'workFactor': 'work_factor',
            'gracePeriodLateMinutes': 'grace_period_late_minutes',
            'gracePeriodEarlyMinutes': 'grace_period_early_minutes',
            'isOvernight': 'is_overnight',
            'isNightShift': 'is_overnight',
            'isActive': 'is_active',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class ShiftAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    shift_code = serializers.CharField(source='shift.code', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)

    class Meta:
        from .models import ShiftAssignment
        model = ShiftAssignment
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code', 'department_name',
            'shift', 'shift_code', 'shift_name', 'date', 'is_off_day', 'note',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'shiftId': 'shift',
            'isOffDay': 'is_off_day',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class ShiftAssignmentBatchSerializer(serializers.Serializer):
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    shift_id = serializers.IntegerField(required=False, allow_null=True)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    applicable_days_of_week = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=6),
        required=False,
        default=[0, 1, 2, 3, 4, 5, 6]
    )
    is_off_day = serializers.BooleanField(default=False)
    note = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("start_date phải trước hoặc bằng end_date.")
        if not data.get('is_off_day') and not data.get('shift_id'):
            raise serializers.ValidationError("Vui lòng chọn ca làm việc nếu không phải ngày nghỉ.")
        return data


class AttendanceRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    manager_reviewer_name = serializers.CharField(source='manager_reviewer.full_name', read_only=True)
    hr_reviewer_name = serializers.CharField(source='hr_reviewer.full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    request_type_label = serializers.CharField(source='get_request_type_display', read_only=True)

    class Meta:
        from .models import AttendanceRequest
        model = AttendanceRequest
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code', 'department_name',
            'request_type', 'request_type_label', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'start_time', 'end_time', 'duration_hours',
            'reason', 'status', 'status_label',
            'manager_reviewer', 'manager_reviewer_name', 'manager_approved_at',
            'hr_reviewer', 'hr_reviewer_name', 'hr_approved_at',
            'rejection_reason', 'create_at', 'update_at'
        ]
        read_only_fields = [
            'id', 'company', 'status', 'status_label',
            'manager_reviewer', 'manager_approved_at',
            'hr_reviewer', 'hr_approved_at', 'rejection_reason',
            'create_at', 'update_at'
        ]

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'employee_id': 'employee',
            'requestType': 'request_type',
            'leaveTypeId': 'leave_type',
            'leave_type_id': 'leave_type',
            'startDate': 'start_date',
            'endDate': 'end_date',
            'startTime': 'start_time',
            'endTime': 'end_time',
            'durationHours': 'duration_hours',
            'rejectionReason': 'rejection_reason',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)

    def validate(self, attrs):
        start_date = attrs.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date') or (self.instance.end_date if self.instance else None)
        start_time = attrs.get('start_time') or (self.instance.start_time if self.instance else None)
        end_time = attrs.get('end_time') or (self.instance.end_time if self.instance else None)
        duration_hours = attrs.get('duration_hours') if 'duration_hours' in attrs else (self.instance.duration_hours if self.instance else None)
        employee = attrs.get('employee') or (self.instance.employee if self.instance else None)
        leave_type = attrs.get('leave_type') or (self.instance.leave_type if self.instance else None)

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Ngày kết thúc không thể trước ngày bắt đầu."})

        if start_date and end_date and start_date == end_date and start_time and end_time and end_time < start_time:
            raise serializers.ValidationError({"end_time": "Giờ kết thúc không thể trước giờ bắt đầu trong cùng ngày."})

        if duration_hours is not None and duration_hours <= 0:
            raise serializers.ValidationError({"duration_hours": "Thời lượng đề nghị phải lớn hơn 0."})

        if employee and leave_type and leave_type.company_id != employee.company_id:
            raise serializers.ValidationError({"leave_type": "Loại nghỉ phép không thuộc công ty của nhân viên này."})

        return attrs


class WorkLocationSerializer(serializers.ModelSerializer):
    location_type_label = serializers.CharField(source='get_location_type_display', read_only=True)
    device_count = serializers.IntegerField(source='devices.count', read_only=True)
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        from .models import WorkLocation
        model = WorkLocation
        fields = [
            'id', 'company', 'name', 'code', 'location_type', 'location_type_label',
            'address', 'city', 'latitude', 'longitude', 'radius_meters',
            'allowed_ip_ranges', 'timezone', 'is_active', 'device_count', 'employee_count',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'locationType': 'location_type',
            'radiusMeters': 'radius_meters',
            'allowedIpRanges': 'allowed_ip_ranges',
            'isActive': 'is_active',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class BiometricDeviceSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    location_code = serializers.CharField(source='location.code', read_only=True)
    protocol_label = serializers.CharField(source='get_protocol_display', read_only=True)
    direction_label = serializers.CharField(source='get_direction_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        from .models import BiometricDevice
        model = BiometricDevice
        fields = [
            'id', 'company', 'location', 'location_name', 'location_code',
            'name', 'device_code', 'protocol', 'protocol_label',
            'ip_or_domain', 'device_port', 'service_port', 'comm_key',
            'direction', 'direction_label', 'serial_number', 'model_name',
            'status', 'status_label', 'last_ping', 'last_sync_time',
            'last_error_message', 'total_punches_synced', 'auto_sync_interval',
            'is_active', 'create_at', 'update_at'
        ]
        read_only_fields = [
            'id', 'company', 'last_ping', 'last_sync_time',
            'last_error_message', 'total_punches_synced', 'create_at', 'update_at'
        ]

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'locationId': 'location',
            'location_id': 'location',
            'deviceCode': 'device_code',
            'ipOrDomain': 'ip_or_domain',
            'devicePort': 'device_port',
            'servicePort': 'service_port',
            'commKey': 'comm_key',
            'serialNumber': 'serial_number',
            'modelName': 'model_name',
            'autoSyncInterval': 'auto_sync_interval',
            'isActive': 'is_active',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class BiometricPunchLogSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    device_title = serializers.CharField(source='device.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    punch_type_label = serializers.CharField(source='get_punch_type_display', read_only=True)
    source_label = serializers.CharField(source='get_source_display', read_only=True)
    biometric_id = serializers.CharField(max_length=50, required=False, allow_blank=True)

    class Meta:
        from .models import BiometricPunchLog
        model = BiometricPunchLog
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code', 'department_name',
            'device', 'device_title', 'location', 'location_name',
            'biometric_id', 'punch_time', 'device_name', 'device_ip',
            'punch_type', 'punch_type_label', 'source', 'source_label',
            'is_duplicate', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'employee_id': 'employee',
            'deviceId': 'device',
            'device_id': 'device',
            'locationId': 'location',
            'location_id': 'location',
            'biometricId': 'biometric_id',
            'punchTime': 'punch_time',
            'deviceName': 'device_name',
            'deviceIp': 'device_ip',
            'punchType': 'punch_type',
            'isDuplicate': 'is_duplicate',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)

    def validate(self, attrs):
        from django.utils import timezone
        if not attrs.get('biometric_id'):
            emp = attrs.get('employee')
            if emp:
                attrs['biometric_id'] = getattr(emp, 'employee_code', '') or str(emp.id)
            else:
                attrs['biometric_id'] = 'UNKNOWN'

        punch_time = attrs.get('punch_time')
        if punch_time and timezone.is_naive(punch_time):
            attrs['punch_time'] = timezone.make_aware(punch_time)
        return attrs


class MonthlyAttendanceSummarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    locked_by_name = serializers.CharField(source='locked_by.full_name', read_only=True)

    class Meta:
        from .models import MonthlyAttendanceSummary
        model = MonthlyAttendanceSummary
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code', 'department_name',
            'month', 'year', 'standard_work_days', 'actual_work_days',
            'paid_leave_days', 'unpaid_leave_days',
            'overtime_hours_weekday', 'overtime_hours_weekend', 'overtime_hours_holiday',
            'late_occurrences', 'early_occurrences',
            'is_locked', 'locked_by', 'locked_by_name', 'locked_at',
            'pushed_to_payroll_at', 'create_at', 'update_at'
        ]
        read_only_fields = [
            'id', 'company', 'is_locked', 'locked_by', 'locked_at',
            'pushed_to_payroll_at', 'create_at', 'update_at'
        ]

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'standardWorkDays': 'standard_work_days',
            'actualWorkDays': 'actual_work_days',
            'paidLeaveDays': 'paid_leave_days',
            'unpaidLeaveDays': 'unpaid_leave_days',
            'overtimeHoursWeekday': 'overtime_hours_weekday',
            'overtimeHoursWeekend': 'overtime_hours_weekend',
            'overtimeHoursHoliday': 'overtime_hours_holiday',
            'lateOccurrences': 'late_occurrences',
            'earlyOccurrences': 'early_occurrences',
            'isLocked': 'is_locked',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class EmployeeCareerHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    event_type_label = serializers.CharField(source='get_event_type_display', read_only=True)
    old_department_name = serializers.CharField(source='old_department.name', read_only=True)
    new_department_name = serializers.CharField(source='new_department.name', read_only=True)
    old_designation_title = serializers.CharField(source='old_designation.title', read_only=True)
    new_designation_title = serializers.CharField(source='new_designation.title', read_only=True)

    class Meta:
        from .models import EmployeeCareerHistory
        model = EmployeeCareerHistory
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code',
            'effective_date', 'event_type', 'event_type_label',
            'old_department', 'old_department_name',
            'new_department', 'new_department_name',
            'old_designation', 'old_designation_title',
            'new_designation', 'new_designation_title',
            'old_salary', 'new_salary',
            'decision_number', 'attachment', 'note',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'effectiveDate': 'effective_date',
            'eventType': 'event_type',
            'oldDepartmentId': 'old_department',
            'old_department_id': 'old_department',
            'newDepartmentId': 'new_department',
            'new_department_id': 'new_department',
            'oldDesignationId': 'old_designation',
            'old_designation_id': 'old_designation',
            'newDesignationId': 'new_designation',
            'new_designation_id': 'new_designation',
            'oldSalary': 'old_salary',
            'newSalary': 'new_salary',
            'decisionNumber': 'decision_number',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    document_type_label = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        from .models import EmployeeDocument
        model = EmployeeDocument
        fields = [
            'id', 'company', 'employee', 'employee_name', 'employee_code',
            'document_type', 'document_type_label',
            'name', 'file_url', 'issue_date', 'expiry_date', 'note',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at']

    def to_internal_value(self, data):
        payload = data.copy() if hasattr(data, 'copy') else dict(data)
        mappings = {
            'employeeId': 'employee',
            'documentType': 'document_type',
            'fileUrl': 'file_url',
            'issueDate': 'issue_date',
            'expiryDate': 'expiry_date',
        }
        for camel, snake in mappings.items():
            if camel in payload and snake not in payload:
                payload[snake] = payload.get(camel)
        return super().to_internal_value(payload)


class OnboardingTaskItemSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.full_name', read_only=True)
    document_url = serializers.CharField(source='document.file_url', read_only=True)
    document_name = serializers.CharField(source='document.name', read_only=True)
    stage_label = serializers.CharField(source='get_stage_display', read_only=True)
    assigned_role_label = serializers.CharField(source='get_assigned_role_display', read_only=True)

    class Meta:
        from .models import OnboardingTaskItem
        model = OnboardingTaskItem
        fields = [
            'id', 'process', 'stage', 'stage_label', 'code', 'title', 'description',
            'assigned_role', 'assigned_role_label', 'assigned_to', 'assigned_to_name',
            'is_required', 'is_completed', 'completed_at', 'completed_by', 'completed_by_name',
            'document', 'document_url', 'document_name', 'rejection_note', 'order',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'process', 'create_at', 'update_at']


class EmployeeOnboardingProcessSerializer(serializers.ModelSerializer):
    stage_label = serializers.CharField(source='get_stage_display', read_only=True)
    tasks = OnboardingTaskItemSerializer(many=True, read_only=True)
    employee_detail = serializers.SerializerMethodField()
    offer_detail = serializers.SerializerMethodField()

    class Meta:
        from .models import EmployeeOnboardingProcess
        model = EmployeeOnboardingProcess
        fields = [
            'id', 'company', 'employee', 'employee_detail',
            'offer_letter', 'offer_detail', 'application',
            'stage', 'stage_label', 'target_start_date', 'actual_start_date',
            'probation_end_date', 'progress_percent', 'cancel_reason',
            'cancelled_at', 'cancelled_by', 'tasks',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'company', 'create_at', 'update_at', 'progress_percent']

    def get_employee_detail(self, obj):
        emp = obj.employee
        if not emp:
            return None
        return {
            'id': emp.id,
            'employee_code': emp.employee_code,
            'full_name': emp.full_name,
            'email': emp.email,
            'phone': emp.phone,
            'avatar': emp.avatar,
            'department_id': emp.department_id,
            'department_name': emp.department.name if emp.department else None,
            'designation_id': emp.designation_id,
            'designation_title': emp.designation.title if emp.designation else None,
            'reports_to_name': emp.reports_to.full_name if emp.reports_to else None,
            'status': emp.status,
            'join_date': emp.join_date,
            'probation_end_date': emp.probation_end_date,
        }

    def get_offer_detail(self, obj):
        offer = obj.offer_letter
        if not offer:
            return None
        return {
            'id': offer.id,
            'position_title': offer.position_title,
            'salary_offered': offer.salary_offered,
            'allowance': offer.allowance,
            'start_date': offer.start_date,
            'status': offer.status,
            'candidate_signed_at': offer.candidate_signed_at,
        }


class ApproveDocumentPayloadSerializer(serializers.Serializer):
    file_url = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
    document_type = serializers.CharField(max_length=50, required=False, default='IDENTITY_CARD')
    name = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')


class RejectDocumentPayloadSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500, required=True)


class ProbationEvaluationPayloadSerializer(serializers.Serializer):
    result = serializers.ChoiceField(choices=['PASSED', 'EXTENDED', 'FAILED'])
    notes = serializers.CharField(max_length=1000, required=False, allow_blank=True, default='')
    extension_days = serializers.IntegerField(required=False, default=30)


class CancelOnboardingPayloadSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500, required=True)


class OnboardingStatsSerializer(serializers.Serializer):
    total_onboarding = serializers.IntegerField()
    pending_preboarding_docs = serializers.IntegerField()
    upcoming_day_one_7d = serializers.IntegerField()
    probation_due_15d = serializers.IntegerField()







