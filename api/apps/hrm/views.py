import csv
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Count, Q, Prefetch, Sum
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts import permissions as perms_custom
from apps.accounts.active_company import apply_active_company_from_request, active_company_header_failed
from apps.profiles.models import Company, CompanyMember
from apps.hrm.models import (
    WorkLocation,
    BiometricDevice,
    AttendanceRecord,
    AttendanceRequest,
    BiometricPunchLog,
    Department,
    Designation,
    Employee,
    EmployeeLeaveBalance,
    EmploymentContract,
    LeaveRequest,
    LeaveType,
    MonthlyAttendanceSummary,
    MonthlyPayrollRecord,
    ShiftAssignment,
    WorkShift,
    EmployeeCareerHistory,
    EmployeeDocument,
)
from apps.hrm.serializers import (
    WorkLocationSerializer,
    BiometricDeviceSerializer,
    AttendanceRecordSerializer,
    DepartmentSerializer,
    DesignationSerializer,
    EmployeeLeaveBalanceSerializer,
    EmployeeSerializer,
    EmploymentContractSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
    OnboardCandidateSerializer,
    MonthlyPayrollRecordSerializer,
    AttendanceRequestSerializer,
    BiometricPunchLogSerializer,
    MonthlyAttendanceSummarySerializer,
    QuickCheckinSerializer,
    RenewContractSerializer,
    ShiftAssignmentBatchSerializer,
    ShiftAssignmentSerializer,
    WorkShiftSerializer,
    EmployeeCareerHistorySerializer,
    EmployeeDocumentSerializer,
)
from apps.hrm.services import CandidateToEmployeeConverter, generate_next_employee_code
from shared.configs import variable_system as var_sys


def _get_company_for_request(request):
    """
    Resolves the active company for the authenticated request.
    Strict tenant isolation: If user is not authenticated or not a verified
    member/owner of the company, returns None. NEVER falls back to Company.objects.first().
    """
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return None

    company = apply_active_company_from_request(request)
    if company:
        return company

    if active_company_header_failed(request):
        # Header was explicitly sent but invalid or unauthorized for this user
        return None

    # Check user's direct active_company property (owner of single company or active membership)
    return getattr(user, 'active_company', None)


class DepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return Department.objects.none()
        return Department.objects.filter(company=company)

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền quản lý phòng ban cho công ty này.")
        serializer.save(company=company)

    @action(detail=False, methods=['get'], url_path='org-chart')
    def org_chart(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response([])

        all_depts = list(Department.objects.filter(company=company).select_related('manager', 'parent'))
        if not all_depts:
            return Response([])

        dept_ids = {d.id for d in all_depts}
        root_depts = [d for d in all_depts if not d.parent_id or d.parent_id not in dept_ids]
        if not root_depts:
            root_depts = all_depts

        emp_counts = dict(
            Employee.objects.filter(company=company, status__in=['PROBATION', 'ACTIVE'])
            .values('department_id')
            .annotate(cnt=Count('id'))
            .values_list('department_id', 'cnt')
        )

        children_map = {}
        for d in all_depts:
            if d.parent_id and d.parent_id in dept_ids and d.parent_id != d.id:
                children_map.setdefault(d.parent_id, []).append(d)

        visited = set()

        def build_tree(dept):
            if dept.id in visited:
                return None
            visited.add(dept.id)
            children = children_map.get(dept.id, [])
            child_nodes = []
            for child in children:
                node = build_tree(child)
                if node:
                    child_nodes.append(node)
            return {
                'id': dept.id,
                'name': dept.name or f'Phòng ban #{dept.id}',
                'code': dept.code or '',
                'manager_name': dept.manager.full_name if dept.manager else None,
                'employee_count': emp_counts.get(dept.id, 0),
                'children': child_nodes,
            }

        tree = []
        for dept in root_depts:
            node = build_tree(dept)
            if node:
                tree.append(node)
        return Response(tree)


class DesignationViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = DesignationSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return Designation.objects.none()
        return Designation.objects.filter(company=company)

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền quản lý chức danh cho công ty này.")
        serializer.save(company=company)


class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return Employee.objects.none()

        qs = Employee.objects.filter(company=company).select_related(
            'department', 'designation', 'reports_to', 'user', 'candidate_profile', 'onboarded_from_activity'
        ).prefetch_related('contracts')

        dept_id = self.request.query_params.get('department')
        if dept_id:
            qs = qs.filter(department_id=dept_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search)
                | Q(employee_code__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )

        return qs

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền tạo nhân viên cho công ty này.")

        code = serializer.validated_data.get('employee_code')
        if not code:
            code = generate_next_employee_code(company)

        first_name = serializer.validated_data.get('first_name', '').strip()
        last_name = serializer.validated_data.get('last_name', '').strip()
        full_name = f"{last_name} {first_name}".strip()

        serializer.save(
            company=company,
            employee_code=code,
            full_name=full_name,
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        first_name = serializer.validated_data.get('first_name', instance.first_name).strip()
        last_name = serializer.validated_data.get('last_name', instance.last_name).strip()
        full_name = f"{last_name} {first_name}".strip()
        if full_name and full_name != instance.full_name:
            instance.full_name = full_name
            instance.save(update_fields=['full_name', 'update_at'])

    @action(detail=False, methods=['post'], url_path='onboard-from-candidate')
    def onboard_from_candidate(self, request):
        """
        Idempotent and atomic endpoint to convert a hired candidate / application
        into a Native HRM Employee.
        """
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền tiếp nhận nhân sự cho công ty này.")

        serializer = OnboardCandidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        employee, created = CandidateToEmployeeConverter.convert(
            company=company,
            actor=request.user,
            data=serializer.validated_data,
        )

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(EmployeeSerializer(employee).data, status=response_status)

    @action(detail=False, methods=['get'], url_path='export-payroll')
    def export_payroll(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response({'detail': 'Company not found'}, status=status.HTTP_403_FORBIDDEN)

        active_contracts_prefetch = Prefetch(
            'contracts',
            queryset=EmploymentContract.objects.filter(status='ACTIVE'),
            to_attr='active_contracts',
        )
        employees = Employee.objects.filter(company=company).select_related(
            'department', 'designation'
        ).prefetch_related(active_contracts_prefetch)

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="hrm_payroll_export.csv"'
        response.write('\ufeff')

        writer = csv.writer(response)
        writer.writerow(['Mã nhân viên', 'Họ và tên', 'Email', 'Phòng ban', 'Chức danh', 'Trạng thái', 'Ngày vào làm', 'Lương cơ bản (VND)'])

        for emp in employees:
            active_contract = emp.active_contracts[0] if getattr(emp, 'active_contracts', None) else None
            salary = active_contract.base_salary if active_contract else 0
            writer.writerow([
                emp.employee_code,
                emp.full_name,
                emp.email,
                emp.department.name if emp.department else '',
                emp.designation.title if emp.designation else '',
                emp.status,
                emp.join_date or '',
                salary or 0,
            ])

        return response


class EmploymentContractViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = EmploymentContractSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return EmploymentContract.objects.none()
        return EmploymentContract.objects.filter(employee__company=company).select_related('employee')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền quản lý hợp đồng cho công ty này.")
        employee = serializer.validated_data.get('employee')
        if employee and employee.company != company:
            raise PermissionDenied("Nhân viên này không thuộc công ty của bạn.")
        status_val = serializer.validated_data.get('status', 'ACTIVE')
        with transaction.atomic():
            if status_val == 'ACTIVE' and employee:
                EmploymentContract.objects.filter(employee=employee, status='ACTIVE').update(
                    status='EXPIRED', update_at=timezone.now()
                )
            serializer.save()

    @action(detail=True, methods=['post'], url_path='renew')
    def renew(self, request, pk=None):
        """Tái ký / gia hạn hợp đồng lao động mới cho nhân viên."""
        contract = self.get_object()
        company = _get_company_for_request(request)
        if not company or contract.employee.company_id != company.id:
            raise PermissionDenied("Không có quyền thao tác trên hợp đồng này.")

        serializer = RenewContractSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            contract.status = 'EXPIRED'
            contract.save(update_fields=['status', 'update_at'])

            new_contract = EmploymentContract.objects.create(
                employee=contract.employee,
                contract_number=data['contract_number'],
                contract_type=data['contract_type'],
                start_date=data['start_date'],
                end_date=data.get('end_date'),
                base_salary=data['base_salary'],
                allowance=data.get('allowance', 0),
                status='ACTIVE',
                notes=data.get('notes', f'Gia hạn từ hợp đồng {contract.contract_number}'),
            )

            # Nếu từ Thử việc chuyển sang HĐ có thời hạn/không thời hạn, chuyển trạng thái nhân viên sang ACTIVE
            if contract.employee.status == 'PROBATION' and data['contract_type'] in ['FIXED_TERM', 'INDEFINITE']:
                contract.employee.status = 'ACTIVE'
                contract.employee.save(update_fields=['status', 'update_at'])

        return Response(EmploymentContractSerializer(new_contract).data, status=status.HTTP_201_CREATED)


class LeaveTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = LeaveTypeSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return LeaveType.objects.none()
        return LeaveType.objects.filter(company=company)

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền cấu hình loại nghỉ phép cho công ty này.")
        serializer.save(company=company)


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = EmployeeLeaveBalanceSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return EmployeeLeaveBalance.objects.none()
        qs = EmployeeLeaveBalance.objects.filter(employee__company=company).select_related('employee', 'leave_type')
        emp_id = self.request.query_params.get('employee')
        if emp_id:
            qs = qs.filter(employee_id=emp_id)
        year = self.request.query_params.get('year')
        if year:
            qs = qs.filter(year=year)
        return qs

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền quản lý quỹ phép cho công ty này.")
        employee = serializer.validated_data.get('employee')
        if employee and employee.company != company:
            raise PermissionDenied("Nhân viên không thuộc công ty của bạn.")
        serializer.save()

    @action(detail=False, methods=['post'], url_path='auto-allocate')
    def auto_allocate(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền thao tác cho công ty này.")
        year = int(request.data.get('year', timezone.now().year))
        annual_leave_type = LeaveType.objects.filter(company=company, code='ANNUAL').first() or LeaveType.objects.filter(company=company, is_paid=True).first()
        if not annual_leave_type:
            annual_leave_type = LeaveType.objects.create(
                company=company,
                name="Nghỉ phép năm",
                code="ANNUAL",
                days_per_year=12,
                is_paid=True
            )
        employees = Employee.objects.filter(company=company, status__in=['ACTIVE', 'PROBATION'])
        allocated_count = 0
        for emp in employees:
            seniority_years = 0
            if emp.join_date:
                seniority_years = max(0, (timezone.now().date() - emp.join_date).days // 365)
            # Mỗi 5 năm thâm niên được cộng thêm 1 ngày phép theo luật LĐ Việt Nam
            seniority_bonus = seniority_years // 5
            EmployeeLeaveBalance.objects.update_or_create(
                employee=emp,
                leave_type=annual_leave_type,
                year=year,
                defaults={
                    'allocated_days': annual_leave_type.days_per_year,
                    'seniority_bonus_days': seniority_bonus,
                }
            )
            allocated_count += 1
        return Response({'message': f'Đã cấp phát quỹ phép năm {year} cho {allocated_count} nhân viên.'})


class LeaveRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.IsEmployerOrAdminUser]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return LeaveRequest.objects.none()
        return LeaveRequest.objects.filter(employee__company=company).select_related('employee', 'leave_type', 'approved_by')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền gửi đơn nghỉ phép cho công ty này.")
        employee = serializer.validated_data.get('employee')
        if employee and employee.company != company:
            raise PermissionDenied("Nhân viên này không thuộc công ty của bạn.")

        leave_type = serializer.validated_data.get('leave_type')
        start_date = serializer.validated_data.get('start_date')
        total_days = serializer.validated_data.get('total_days', Decimal("1.0"))

        with transaction.atomic():
            if leave_type and employee:
                year = start_date.year if start_date else timezone.now().year
                balance = EmployeeLeaveBalance.objects.select_for_update().filter(
                    employee=employee,
                    leave_type=leave_type,
                    year=year
                ).first()
                if balance:
                    if leave_type.is_paid and float(total_days) > balance.remaining_days:
                        raise ValidationError({
                            "total_days": [f"Số ngày phép khả dụng ({balance.remaining_days:.1f} ngày) không đủ cho đơn nghỉ ({float(total_days):.1f} ngày)."]
                        })
                    balance.pending_days = float(balance.pending_days) + float(total_days)
                    balance.save(update_fields=['pending_days', 'update_at'])

            leave_req = serializer.save()

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk=None):
        leave_req = self.get_object()
        if leave_req.status == 'APPROVED':
            return Response(LeaveRequestSerializer(leave_req).data)

        with transaction.atomic():
            leave_req.status = 'APPROVED'
            leave_req.approved_at = timezone.now()
            approver = Employee.objects.filter(user=request.user, company=leave_req.employee.company).first()
            if approver:
                leave_req.approved_by = approver
            leave_req.save(update_fields=['status', 'approved_at', 'approved_by', 'update_at'])

            # Trừ số ngày chờ duyệt, cộng vào số ngày đã dùng
            if leave_req.leave_type:
                year = leave_req.start_date.year
                balance = EmployeeLeaveBalance.objects.filter(
                    employee=leave_req.employee,
                    leave_type=leave_req.leave_type,
                    year=year
                ).first()
                if balance:
                    balance.pending_days = max(0.0, float(balance.pending_days) - float(leave_req.total_days))
                    balance.used_days = float(balance.used_days) + float(leave_req.total_days)
                    balance.save(update_fields=['pending_days', 'used_days', 'update_at'])

        return Response(LeaveRequestSerializer(leave_req).data)

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject(self, request, pk=None):
        leave_req = self.get_object()
        prev_status = leave_req.status
        with transaction.atomic():
            leave_req.status = 'REJECTED'
            leave_req.rejection_reason = request.data.get('rejection_reason', '')
            leave_req.save(update_fields=['status', 'rejection_reason', 'update_at'])

            if prev_status == 'PENDING' and leave_req.leave_type:
                year = leave_req.start_date.year
                balance = EmployeeLeaveBalance.objects.filter(
                    employee=leave_req.employee,
                    leave_type=leave_req.leave_type,
                    year=year
                ).first()
                if balance:
                    balance.pending_days = max(0.0, float(balance.pending_days) - float(leave_req.total_days))
                    balance.save(update_fields=['pending_days', 'update_at'])

        return Response(LeaveRequestSerializer(leave_req).data)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return AttendanceRecord.objects.none()
        return AttendanceRecord.objects.filter(employee__company=company).select_related('employee')

    @action(detail=False, methods=['get'], url_path='timesheet')
    def timesheet(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response({'days': [], 'employees': []})

        import calendar
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        dept_id = request.query_params.get('department')

        _, num_days = calendar.monthrange(year, month)
        days = []
        for d in range(1, num_days + 1):
            curr_date = timezone.datetime(year, month, d).date()
            days.append({
                'day': d,
                'date': curr_date.isoformat(),
                'is_weekend': curr_date.weekday() >= 5,
                'day_of_week': curr_date.strftime('%a')
            })

        emp_qs = Employee.objects.filter(company=company, status__in=['PROBATION', 'ACTIVE']).select_related('department', 'designation')
        if dept_id:
            emp_qs = emp_qs.filter(department_id=dept_id)

        attendances = AttendanceRecord.objects.filter(
            employee__company=company,
            date__year=year,
            date__month=month
        ).select_related('employee')

        att_map = {}
        for att in attendances:
            att_map[(att.employee_id, att.date.day)] = {
                'id': att.id,
                'status': att.status,
                'working_hours': float(att.working_hours),
                'check_in': att.check_in.strftime('%H:%M') if att.check_in else None,
                'check_out': att.check_out.strftime('%H:%M') if att.check_out else None,
            }

        from datetime import date as dt_date
        month_start_date = dt_date(year, month, 1)
        month_end_date = dt_date(year, month, num_days)

        leaves = LeaveRequest.objects.filter(
            employee__company=company,
            status='APPROVED',
            start_date__lte=month_end_date,
            end_date__gte=month_start_date
        )
        leave_map = {}
        for l in leaves:
            eff_start = max(month_start_date, l.start_date)
            eff_end = min(month_end_date, l.end_date)
            for d in range(eff_start.day, eff_end.day + 1):
                leave_map[(l.employee_id, d)] = 'ON_LEAVE'

        employee_data = []
        for emp in emp_qs:
            records = {}
            total_present = 0
            total_late = 0
            total_leave = 0
            total_hours = 0.0

            for d in range(1, num_days + 1):
                att = att_map.get((emp.id, d))
                if att:
                    records[d] = att
                    if att['status'] in ['PRESENT', 'LATE', 'EARLY_LEAVE']:
                        total_present += 1
                        total_hours += att['working_hours']
                    if att['status'] == 'LATE':
                        total_late += 1
                elif (emp.id, d) in leave_map:
                    records[d] = {'status': 'ON_LEAVE', 'working_hours': 0, 'check_in': None, 'check_out': None}
                    total_leave += 1
                else:
                    curr_date = timezone.datetime(year, month, d).date()
                    if curr_date.weekday() >= 5:
                        records[d] = {'status': 'WEEKEND', 'working_hours': 0, 'check_in': None, 'check_out': None}
                    else:
                        records[d] = {'status': 'ABSENT', 'working_hours': 0, 'check_in': None, 'check_out': None}

            employee_data.append({
                'employee_id': emp.id,
                'employee_code': emp.employee_code,
                'full_name': emp.full_name,
                'department_name': emp.department.name if emp.department else '',
                'designation_title': emp.designation.title if emp.designation else '',
                'records': records,
                'stats': {
                    'total_present': total_present,
                    'total_late': total_late,
                    'total_leave': total_leave,
                    'total_hours': round(total_hours, 1)
                }
            })

        return Response({
            'month': month,
            'year': year,
            'total_days': num_days,
            'days': days,
            'employees': employee_data
        })

    @action(detail=False, methods=['post'], url_path='quick-checkin')
    def quick_checkin(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền thao tác.")
        serializer = QuickCheckinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        emp = Employee.objects.filter(id=data['employee_id'], company=company).first()
        if not emp:
            raise ValidationError({"employee_id": "Nhân viên không tồn tại hoặc không thuộc công ty."})

        target_date = data.get('date') or timezone.now().date()
        record, created = AttendanceRecord.objects.update_or_create(
            employee=emp,
            date=target_date,
            defaults={
                'status': data['status'],
                'check_in': data.get('check_in') or timezone.now().time(),
                'check_out': data.get('check_out'),
                'working_hours': data.get('working_hours', 8.0),
                'notes': data.get('notes', ''),
            }
        )
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class HrmDashboardStatsAPIView(APIView):
    permission_classes = [perms_custom.CanManageEmployees]

    def get(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response({
                'active_employees': 0,
                'probation_employees': 0,
                'pending_leaves': 0,
                'expiring_contracts': 0,
                'department_breakdown': [],
            })

        active_count = Employee.objects.filter(company=company, status='ACTIVE').count()
        probation_count = Employee.objects.filter(company=company, status='PROBATION').count()
        pending_leaves_count = LeaveRequest.objects.filter(employee__company=company, status='PENDING').count()

        today = timezone.now().date()
        next_30_days = today + timedelta(days=30)
        expiring_contracts_count = EmploymentContract.objects.filter(
            employee__company=company,
            status='ACTIVE',
            end_date__gte=today,
            end_date__lte=next_30_days,
        ).count()

        depts = Department.objects.filter(company=company).annotate(
            emp_count=Count('employees', filter=Q(employees__status__in=['PROBATION', 'ACTIVE']))
        ).values('id', 'name', 'code', 'emp_count')

        return Response({
            'active_employees': active_count,
            'probation_employees': probation_count,
            'pending_leaves': pending_leaves_count,
            'expiring_contracts': expiring_contracts_count,
            'department_breakdown': list(depts),
        })


class MonthlyPayrollViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = MonthlyPayrollRecordSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return MonthlyPayrollRecord.objects.none()
        qs = MonthlyPayrollRecord.objects.filter(company=company).select_related('employee', 'employee__department')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        status_param = self.request.query_params.get('status')
        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=False, methods=['get'], url_path='summary-kpis')
    def summary_kpis(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response({})
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        records = MonthlyPayrollRecord.objects.filter(company=company, month=month, year=year)
        total_gross = sum(r.gross_salary for r in records)
        total_net = sum(r.net_salary for r in records)
        total_pit = sum(r.personal_income_tax for r in records)
        total_emp_insurance = sum(r.total_insurance for r in records)
        total_employer_insurance = sum(r.total_employer_insurance for r in records)
        total_company_expense = sum(r.total_company_expense for r in records)
        return Response({
            'month': month,
            'year': year,
            'total_employees': records.count(),
            'total_gross': total_gross,
            'total_net': total_net,
            'total_pit': total_pit,
            'total_emp_insurance': total_emp_insurance,
            'total_employer_insurance': total_employer_insurance,
            'total_company_expense': total_company_expense,
            'draft_count': records.filter(status='DRAFT').count(),
            'approved_count': records.filter(status='APPROVED').count(),
            'paid_count': records.filter(status='PAID').count(),
        })

    @action(detail=False, methods=['post'], url_path='approve-all')
    def approve_all(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền thao tác.")
        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))
        updated_count = MonthlyPayrollRecord.objects.filter(
            company=company, month=month, year=year, status='DRAFT'
        ).update(status='APPROVED', update_at=timezone.now())
        return Response({'message': f'Đã phê duyệt bảng lương tháng {month}/{year} ({updated_count} bản ghi).'})

    @action(detail=False, methods=['post'], url_path='mark-paid-all')
    def mark_paid_all(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền thao tác.")
        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))
        today = timezone.now().date()
        updated_count = MonthlyPayrollRecord.objects.filter(
            company=company, month=month, year=year, status='APPROVED'
        ).update(status='PAID', payment_date=today, update_at=timezone.now())
        return Response({'message': f'Đã chi trả bảng lương tháng {month}/{year} ({updated_count} bản ghi).'})

    @action(detail=False, methods=['post'], url_path='calculate')
    def calculate(self, request):
        """Tính toán bảng lương tháng cho một nhân viên hoặc toàn bộ nhân viên công ty."""
        from decimal import Decimal
        from .payroll_engine import calculate_vietnam_payroll
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền truy cập công ty này.")

        employee_id = request.data.get('employee_id') or request.data.get('employee')
        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))
        standard_days = int(request.data.get('standard_working_days', 22))

        employees = Employee.objects.filter(company=company, status__in=['ACTIVE', 'PROBATION'])
        if employee_id:
            employees = employees.filter(id=employee_id)

        created_records = []
        force_recalc = request.data.get('force', False)
        for emp in employees:
            existing_payroll = MonthlyPayrollRecord.objects.filter(
                company=company, employee=emp, month=month, year=year
            ).first()
            if existing_payroll and existing_payroll.status in [MonthlyPayrollRecord.STATUS_APPROVED, MonthlyPayrollRecord.STATUS_PAID] and not force_recalc:
                created_records.append(existing_payroll)
                continue

            contract = emp.contracts.filter(status='ACTIVE').order_by('-start_date').first()
            gross = contract.base_salary if contract else Decimal("10000000")
            allowance = contract.allowance if contract else Decimal("0")

            unpaid_leave_agg = LeaveRequest.objects.filter(
                employee=emp,
                status='APPROVED',
                leave_type__is_paid=False,
                start_date__year=year,
                start_date__month=month,
            ).aggregate(total_days=Sum('total_days'))
            unpaid_leave_days = int(unpaid_leave_agg['total_days'] or 0)

            has_attendance_entries = AttendanceRecord.objects.filter(
                employee=emp,
                date__year=year,
                date__month=month,
            ).exists()

            attendance_days = AttendanceRecord.objects.filter(
                employee=emp,
                date__year=year,
                date__month=month,
                status__in=['PRESENT', 'LATE', 'EARLY_LEAVE']
            ).count()

            if has_attendance_entries:
                actual_days = attendance_days
            else:
                actual_days = max(0, standard_days - unpaid_leave_days)

            dep_count = getattr(emp, 'dependents_count', 0) or 0

            calc = calculate_vietnam_payroll(
                gross_salary=gross,
                allowance=allowance,
                bonus=Decimal(str(request.data.get('bonus', 0))),
                working_days_actual=actual_days,
                standard_working_days=standard_days,
                unpaid_leave_days=unpaid_leave_days,
                dependents_count=dep_count,
            )

            record, _ = MonthlyPayrollRecord.objects.update_or_create(
                company=company,
                employee=emp,
                month=month,
                year=year,
                defaults={
                    'gross_salary': calc['gross_salary'],
                    'allowance': calc['allowance'],
                    'bonus': calc['bonus'],
                    'working_days_actual': calc['working_days_actual'],
                    'standard_working_days': calc['standard_working_days'],
                    'unpaid_leave_days': calc['unpaid_leave_days'],
                    'dependents_count': calc['tax_deductions']['dependents_count'],
                    'total_income': calc['total_income'],
                    'bhxh_amount': calc['insurance_deductions']['bhxh_8_percent'],
                    'bhyt_amount': calc['insurance_deductions']['bhyt_1_5_percent'],
                    'bhtn_amount': calc['insurance_deductions']['bhtn_1_percent'],
                    'total_insurance': calc['insurance_deductions']['total_insurance'],
                    'employer_bhxh': calc['employer_contributions']['bhxh_17_5_percent'],
                    'employer_bhyt': calc['employer_contributions']['bhyt_3_percent'],
                    'employer_bhtn': calc['employer_contributions']['bhtn_1_percent'],
                    'employer_union_fee': calc['employer_contributions']['union_fee_2_percent'],
                    'total_employer_insurance': calc['employer_contributions']['total_employer_insurance'],
                    'taxable_income': calc['tax_deductions']['taxable_income'],
                    'personal_income_tax': calc['tax_deductions']['personal_income_tax'],
                    'net_salary': calc['net_salary'],
                    'total_company_expense': calc['total_company_expense'],
                    'status': MonthlyPayrollRecord.STATUS_DRAFT,
                }
            )
            created_records.append(record)

        return Response({
            'message': f'Đã tính toán bảng lương tháng {month}/{year} cho {len(created_records)} nhân viên.',
            'records': MonthlyPayrollRecordSerializer(created_records, many=True).data
        })


class EmployeeSelfServiceView(APIView):
    """Cổng tự phục vụ dành cho nhân viên xem hồ sơ, hợp đồng, quỹ phép và bảng lương cá nhân."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        emp = Employee.objects.filter(user=request.user, status__in=['ACTIVE', 'PROBATION']).select_related('company', 'department', 'designation').first()
        if not emp:
            return Response({'detail': 'Không tìm thấy hồ sơ nhân sự liên kết với tài khoản này.'}, status=status.HTTP_404_NOT_FOUND)

        contracts = EmploymentContract.objects.filter(employee=emp).order_by('-start_date')
        active_contract = contracts.filter(status='ACTIVE').first()
        year = timezone.now().year
        leave_balances = EmployeeLeaveBalance.objects.filter(employee=emp, year=year).select_related('leave_type')
        recent_payrolls = MonthlyPayrollRecord.objects.filter(employee=emp).order_by('-year', '-month')[:6]
        recent_attendance_summaries = MonthlyAttendanceSummary.objects.filter(employee=emp).order_by('-year', '-month')[:6]

        return Response({
            'employee': EmployeeSerializer(emp).data,
            'active_contract': EmploymentContractSerializer(active_contract).data if active_contract else None,
            'leave_balances': EmployeeLeaveBalanceSerializer(leave_balances, many=True).data,
            'recent_payrolls': MonthlyPayrollRecordSerializer(recent_payrolls, many=True).data,
            'recent_attendance_summaries': MonthlyAttendanceSummarySerializer(recent_attendance_summaries, many=True).data,
        })


class WorkShiftViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = WorkShiftSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return WorkShift.objects.none()
        return WorkShift.objects.filter(company=company).order_by('code')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền quản lý ca làm việc cho công ty này.")
        serializer.save(company=company)


class ShiftAssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = ShiftAssignmentSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return ShiftAssignment.objects.none()
        qs = ShiftAssignment.objects.filter(company=company).select_related('employee', 'shift', 'employee__department')
        
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)

        department_id = self.request.query_params.get('department_id')
        if department_id:
            qs = qs.filter(employee__department_id=department_id)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)

        return qs.order_by('date', 'employee__first_name')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền phân ca cho công ty này.")
        serializer.save(company=company)

    @action(detail=False, methods=['post'], url_path='batch')
    def batch(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Bạn không có quyền phân ca cho công ty này.")

        serializer = ShiftAssignmentBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        employee_ids = data['employee_ids']
        shift_id = data.get('shift_id')
        start_date = data['start_date']
        end_date = data['end_date']
        applicable_days = set(data.get('applicable_days_of_week', [0, 1, 2, 3, 4, 5, 6]))
        is_off_day = data.get('is_off_day', False)
        note = data.get('note', '')

        employees = Employee.objects.filter(company=company, id__in=employee_ids)
        shift = None
        if shift_id:
            try:
                shift = WorkShift.objects.get(company=company, id=shift_id)
            except WorkShift.DoesNotExist:
                raise ValidationError({"shift_id": "Ca làm việc không tồn tại hoặc không thuộc công ty."})

        curr_date = start_date
        total_assigned = 0
        with transaction.atomic():
            while curr_date <= end_date:
                if curr_date.weekday() in applicable_days:
                    for emp in employees:
                        ShiftAssignment.objects.update_or_create(
                            company=company,
                            employee=emp,
                            date=curr_date,
                            defaults={
                                'shift': shift,
                                'is_off_day': is_off_day,
                                'note': note,
                            }
                        )
                        total_assigned += 1
                curr_date += timedelta(days=1)

        return Response({
            'success': True,
            'created_or_updated': total_assigned,
        }, status=status.HTTP_200_OK)


class AttendanceRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendanceRequestSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return AttendanceRequest.objects.none()
        qs = AttendanceRequest.objects.filter(company=company).select_related(
            'employee', 'leave_type', 'manager_reviewer', 'hr_reviewer', 'employee__department'
        )

        request_type = self.request.query_params.get('request_type')
        if request_type:
            qs = qs.filter(request_type=request_type)

        req_status = self.request.query_params.get('status')
        if req_status:
            qs = qs.filter(status=req_status)

        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)

        department_id = self.request.query_params.get('department_id')
        if department_id:
            qs = qs.filter(employee__department_id=department_id)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            qs = qs.filter(end_date__gte=start_date)
        if end_date:
            qs = qs.filter(start_date__lte=end_date)

        return qs.order_by('-create_at')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền gửi đơn cho công ty này.")

        emp = serializer.validated_data.get('employee')
        if not emp:
            emp = Employee.objects.filter(company=company, user=self.request.user).first()
            if not emp:
                raise ValidationError({"employee": "Không tìm thấy hồ sơ nhân viên tương ứng."})
            serializer.save(company=company, employee=emp)
        else:
            serializer.save(company=company)

    @action(detail=True, methods=['post'], url_path='approve-stage-1')
    def approve_stage_1(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        attendance_request = self.get_object()

        if attendance_request.status != 'PENDING_STAGE_1':
            return Response(
                {'detail': f'Không thể duyệt cấp 1 khi đơn đang ở trạng thái {attendance_request.get_status_display()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reviewer = Employee.objects.filter(company=company, user=request.user).first()
        attendance_request.status = 'APPROVED_STAGE_1'
        attendance_request.manager_reviewer = reviewer
        attendance_request.manager_approved_at = timezone.now()
        attendance_request.save()

        return Response(AttendanceRequestSerializer(attendance_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='approve-stage-2')
    def approve_stage_2(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        attendance_request = self.get_object()

        if attendance_request.status not in ['PENDING_STAGE_1', 'APPROVED_STAGE_1']:
            return Response(
                {'detail': f'Không thể duyệt cấp 2 khi đơn đang ở trạng thái {attendance_request.get_status_display()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reviewer = Employee.objects.filter(company=company, user=request.user).first()
        attendance_request.status = 'APPROVED'
        attendance_request.hr_reviewer = reviewer
        attendance_request.hr_approved_at = timezone.now()
        attendance_request.save()

        self._apply_approved_request_to_attendance(attendance_request)

        return Response(AttendanceRequestSerializer(attendance_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        attendance_request = self.get_object()

        if attendance_request.status in ['APPROVED', 'CANCELLED', 'REJECTED']:
            return Response(
                {'detail': f'Đơn đã ở trạng thái {attendance_request.get_status_display()}, không thể từ chối.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason') or request.data.get('rejection_reason', '')
        attendance_request.status = 'REJECTED'
        attendance_request.rejection_reason = reason
        attendance_request.save()

        return Response(AttendanceRequestSerializer(attendance_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        attendance_request = self.get_object()

        if attendance_request.status in ['APPROVED', 'CANCELLED']:
            return Response(
                {'detail': f'Đơn đã ở trạng thái {attendance_request.get_status_display()}, không thể hủy.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance_request.status = 'CANCELLED'
        attendance_request.save()

        return Response(AttendanceRequestSerializer(attendance_request).data, status=status.HTTP_200_OK)

    def _apply_approved_request_to_attendance(self, req):
        from apps.hrm.models import AttendanceRecord, ShiftAssignment
        from decimal import Decimal
        curr_date = req.start_date
        while curr_date <= req.end_date:
            record, _ = AttendanceRecord.objects.get_or_create(
                employee=req.employee,
                date=curr_date,
            )
            assignment = ShiftAssignment.objects.filter(employee=req.employee, date=curr_date).first()
            shift = assignment.shift if assignment else getattr(record, 'shift', None)

            if record.is_locked:
                curr_date += timedelta(days=1)
                continue

            if req.request_type == 'REGULARISATION':
                if req.start_time:
                    record.check_in = req.start_time
                if req.end_time:
                    record.check_out = req.end_time
                record.is_manually_adjusted = True
                record.adjustment_reason = req.reason or "Duyệt đề nghị cập nhật công"
                record.status = 'PRESENT'
                if not record.working_hours and shift:
                    record.working_hours = shift.working_hours

            elif req.request_type == 'LEAVE':
                record.status = 'ON_LEAVE'
                record.notes = f"Nghỉ phép: {req.leave_type.name if req.leave_type else ''}. {req.reason or ''}"
                if req.leave_type and req.leave_type.is_paid:
                    record.working_hours = shift.working_hours if shift else Decimal("8.00")
                    balance = EmployeeLeaveBalance.objects.filter(
                        employee=req.employee,
                        leave_type=req.leave_type,
                        year=curr_date.year
                    ).first()
                    if balance:
                        balance.used_days = float(balance.used_days) + 1.0
                        balance.save(update_fields=['used_days', 'update_at'])

            elif req.request_type == 'BUSINESS_TRIP':
                record.status = 'PRESENT'
                record.notes = f"Đi công tác: {req.reason or ''}"
                record.working_hours = shift.working_hours if shift else Decimal("8.00")

            elif req.request_type == 'OVERTIME':
                ot_hrs = req.duration_hours or Decimal("0.00")
                record.overtime_hours = (record.overtime_hours or Decimal("0.00")) + ot_hrs
                record.notes = f"Tăng ca: {ot_hrs}h. {req.reason or ''}"

            elif req.request_type == 'LATE_EARLY':
                record.late_minutes = 0
                record.early_minutes = 0
                record.notes = f"Đơn đi muộn về sớm: {req.reason or ''}"

            record.save()
            curr_date += timedelta(days=1)


class BiometricPunchLogViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = BiometricPunchLogSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return BiometricPunchLog.objects.none()
        qs = BiometricPunchLog.objects.filter(company=company).select_related(
            'employee', 'employee__department', 'device', 'location'
        )

        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)

        source = self.request.query_params.get('source')
        if source:
            qs = qs.filter(source=source)

        date_val = self.request.query_params.get('date')
        if date_val:
            qs = qs.filter(punch_time__date=date_val)

        device_id = self.request.query_params.get('device_id')
        if device_id:
            qs = qs.filter(device_id=device_id)

        location_id = self.request.query_params.get('location_id')
        if location_id:
            qs = qs.filter(location_id=location_id)

        is_dup = self.request.query_params.get('is_duplicate')
        if is_dup is not None:
            qs = qs.filter(is_duplicate=(is_dup.lower() in ['true', '1']))

        return qs.order_by('-punch_time')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Bạn không có quyền quản lý log máy chấm công cho công ty này.")
        instance = serializer.save(company=company)
        from apps.hrm.services import mark_if_duplicate_on_punch
        mark_if_duplicate_on_punch(instance, window_seconds=120)

    @action(detail=False, methods=['post'], url_path='deduplicate')
    def deduplicate(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        date_str = request.data.get('date')
        target_date = None
        if date_str:
            try:
                from datetime import datetime as dt_cls
                target_date = dt_cls.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'detail': 'Định dạng ngày không hợp lệ (YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.hrm.services import deduplicate_punch_logs
        window_seconds = int(request.data.get('window_seconds', 120))
        dup_count = deduplicate_punch_logs(company, target_date=target_date, window_seconds=window_seconds)
        return Response({
            'message': f'Đã chạy thuật toán khử trùng lặp ({window_seconds}s). Phát hiện và gắn cờ {dup_count} bản ghi quẹt trùng.',
            'duplicate_count': dup_count,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='process-daily')
    def process_daily(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        date_str = request.data.get('date')
        if not date_str:
            target_date = timezone.now().date()
        else:
            try:
                from datetime import datetime as dt_cls
                target_date = dt_cls.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'detail': 'Định dạng ngày không hợp lệ (YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.hrm.services import process_punch_logs_for_date
        count = process_punch_logs_for_date(company, target_date)
        return Response({
            'message': f'Đã tổng hợp dữ liệu chấm công ngày {target_date} cho {count} nhân viên.',
            'count': count,
        }, status=status.HTTP_200_OK)



class MonthlyAttendanceSummaryViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = MonthlyAttendanceSummarySerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return MonthlyAttendanceSummary.objects.none()
        qs = MonthlyAttendanceSummary.objects.filter(company=company).select_related(
            'employee', 'employee__department', 'locked_by'
        )

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)

        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)

        department_id = self.request.query_params.get('department_id')
        if department_id:
            qs = qs.filter(employee__department_id=department_id)

        return qs.order_by('employee__first_name', 'employee__last_name')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        serializer.save(company=company)

    @action(detail=False, methods=['post'], url_path='recalculate')
    def recalculate(self, request):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")

        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))
        employee_ids = request.data.get('employee_ids', [])

        emp_qs = Employee.objects.filter(company=company, status__in=['ACTIVE', 'PROBATION'])
        if employee_ids:
            emp_qs = emp_qs.filter(id__in=employee_ids)

        summaries = []
        for emp in emp_qs:
            records = AttendanceRecord.objects.filter(
                employee=emp,
                date__year=year,
                date__month=month
            )

            actual_work_days = Decimal("0.0")
            paid_leave_days = Decimal("0.0")
            unpaid_leave_days = Decimal("0.0")
            ot_weekday = Decimal("0.0")
            ot_weekend = Decimal("0.0")
            ot_holiday = Decimal("0.0")
            late_count = 0
            early_count = 0

            for rec in records:
                if rec.status == 'ON_LEAVE':
                    is_unpaid = LeaveRequest.objects.filter(
                        employee=emp,
                        status='APPROVED',
                        leave_type__is_paid=False,
                        start_date__lte=rec.date,
                        end_date__gte=rec.date
                    ).exists()
                    if is_unpaid:
                        unpaid_leave_days += Decimal("1.0")
                    else:
                        paid_leave_days += Decimal("1.0")
                elif rec.status == 'ABSENT':
                    unpaid_leave_days += Decimal("1.0")
                elif rec.status in ['PRESENT', 'LATE', 'EARLY_LEAVE']:
                    if rec.working_hours and rec.working_hours > 0:
                        work_shift_hrs = rec.shift.working_hours if rec.shift else Decimal("8.00")
                        ratio = min(Decimal("1.0"), rec.working_hours / work_shift_hrs)
                        actual_work_days += ratio
                    else:
                        unpaid_leave_days += Decimal("1.0")

                if rec.late_minutes > 0:
                    late_count += 1
                if rec.early_minutes > 0:
                    early_count += 1

                if rec.overtime_hours and rec.overtime_hours > 0:
                    if rec.date.weekday() in [5, 6]:
                        ot_weekend += rec.overtime_hours
                    else:
                        ot_weekday += rec.overtime_hours

            summary, _ = MonthlyAttendanceSummary.objects.update_or_create(
                company=company,
                employee=emp,
                month=month,
                year=year,
                defaults={
                    'standard_work_days': Decimal("22.0"),
                    'actual_work_days': actual_work_days,
                    'paid_leave_days': paid_leave_days,
                    'unpaid_leave_days': unpaid_leave_days,
                    'overtime_hours_weekday': ot_weekday,
                    'overtime_hours_weekend': ot_weekend,
                    'overtime_hours_holiday': ot_holiday,
                    'late_occurrences': late_count,
                    'early_occurrences': early_count,
                }
            )
            summaries.append(summary)

        return Response({
            'message': f'Đã tổng hợp bảng công tháng {month}/{year} cho {len(summaries)} nhân viên.',
            'count': len(summaries),
            'summaries': MonthlyAttendanceSummarySerializer(summaries, many=True).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='lock')
    def lock(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        summary = self.get_object()

        reviewer = Employee.objects.filter(company=company, user=request.user).first()
        summary.is_locked = True
        summary.locked_by = reviewer
        summary.locked_at = timezone.now()
        summary.save()

        AttendanceRecord.objects.filter(
            employee=summary.employee,
            date__year=summary.year,
            date__month=summary.month
        ).update(is_locked=True)

        return Response(MonthlyAttendanceSummarySerializer(summary).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unlock')
    def unlock(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        summary = self.get_object()

        summary.is_locked = False
        summary.locked_by = None
        summary.locked_at = None
        summary.save()

        AttendanceRecord.objects.filter(
            employee=summary.employee,
            date__year=summary.year,
            date__month=summary.month
        ).update(is_locked=False)

        return Response(MonthlyAttendanceSummarySerializer(summary).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='push-to-payroll')
    def push_to_payroll(self, request, pk=None):
        company = _get_company_for_request(request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        summary = self.get_object()

        existing_payroll = MonthlyPayrollRecord.objects.filter(
            company=company,
            employee=summary.employee,
            month=summary.month,
            year=summary.year
        ).first()
        force_push = request.data.get('force', False)
        if existing_payroll and existing_payroll.status in [MonthlyPayrollRecord.STATUS_APPROVED, MonthlyPayrollRecord.STATUS_PAID] and not force_push:
            return Response(
                {'detail': f'Bảng lương tháng {summary.month}/{summary.year} của {summary.employee.full_name} đã ở trạng thái {existing_payroll.get_status_display()}, không thể ghi đè.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not summary.is_locked:
            reviewer = Employee.objects.filter(company=company, user=request.user).first()
            summary.is_locked = True
            summary.locked_by = reviewer
            summary.locked_at = timezone.now()

        active_contract = summary.employee.contracts.filter(status='ACTIVE').order_by('-start_date').first()
        base_salary = getattr(active_contract, 'base_salary', Decimal("10000000"))
        allowance = getattr(active_contract, 'allowance', Decimal("0"))

        actual_days = int(round(summary.actual_work_days + summary.paid_leave_days))
        standard_days = int(round(summary.standard_work_days))
        unpaid_days = int(round(summary.unpaid_leave_days))
        dep_count = getattr(summary.employee, 'dependents_count', 0) or 0

        from .payroll_engine import calculate_vietnam_payroll
        calc = calculate_vietnam_payroll(
            gross_salary=base_salary,
            allowance=allowance,
            bonus=Decimal("0"),
            working_days_actual=actual_days,
            standard_working_days=standard_days,
            unpaid_leave_days=unpaid_days,
            dependents_count=dep_count,
        )

        payroll_rec, _ = MonthlyPayrollRecord.objects.update_or_create(
            company=company,
            employee=summary.employee,
            month=summary.month,
            year=summary.year,
            defaults={
                'gross_salary': calc['gross_salary'],
                'allowance': calc['allowance'],
                'bonus': calc['bonus'],
                'working_days_actual': actual_days,
                'standard_working_days': standard_days,
                'unpaid_leave_days': unpaid_days,
                'dependents_count': calc['tax_deductions']['dependents_count'],
                'total_income': calc['total_income'],
                'bhxh_amount': calc['insurance_deductions']['bhxh_8_percent'],
                'bhyt_amount': calc['insurance_deductions']['bhyt_1_5_percent'],
                'bhtn_amount': calc['insurance_deductions']['bhtn_1_percent'],
                'total_insurance': calc['insurance_deductions']['total_insurance'],
                'employer_bhxh': calc['employer_contributions']['bhxh_17_5_percent'],
                'employer_bhyt': calc['employer_contributions']['bhyt_3_percent'],
                'employer_bhtn': calc['employer_contributions']['bhtn_1_percent'],
                'employer_union_fee': calc['employer_contributions']['union_fee_2_percent'],
                'total_employer_insurance': calc['employer_contributions']['total_employer_insurance'],
                'taxable_income': calc['tax_deductions']['taxable_income'],
                'personal_income_tax': calc['tax_deductions']['personal_income_tax'],
                'net_salary': calc['net_salary'],
                'total_company_expense': calc['total_company_expense'],
                'status': MonthlyPayrollRecord.STATUS_DRAFT,
            }
        )

        summary.pushed_to_payroll_at = timezone.now()
        summary.save()

        return Response({
            'message': f'Đã chuyển dữ liệu ngày công vào bảng lương tháng {summary.month}/{summary.year}.',
            'payroll_id': payroll_rec.id,
            'summary': MonthlyAttendanceSummarySerializer(summary).data
        }, status=status.HTTP_200_OK)


class WorkLocationViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = WorkLocationSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return WorkLocation.objects.none()
        qs = WorkLocation.objects.filter(company=company).prefetch_related('devices', 'employees')

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ('true', '1'))

        location_type = self.request.query_params.get('location_type')
        if location_type:
            qs = qs.filter(location_type=location_type)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(code__icontains=search) | Q(city__icontains=search))

        return qs.order_by('name')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Không có quyền tạo trụ sở hoặc chi nhánh.")
        serializer.save(company=company)


class BiometricDeviceViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = BiometricDeviceSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return BiometricDevice.objects.none()
        qs = BiometricDevice.objects.filter(company=company).select_related('location')

        location_id = self.request.query_params.get('location_id')
        if location_id:
            qs = qs.filter(location_id=location_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        protocol = self.request.query_params.get('protocol')
        if protocol:
            qs = qs.filter(protocol=protocol)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(device_code__icontains=search) | Q(ip_or_domain__icontains=search))

        return qs.order_by('location', 'name')

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Không có quyền tạo thiết bị chấm công.")
        serializer.save(company=company)

    @action(detail=True, methods=['post'], url_path='test-connection')
    def test_connection(self, request, pk=None):
        """Kiểm tra kết nối TCP socket hoặc ping tới máy chấm công."""
        device = self.get_object()
        import socket
        import time

        start_time = time.time()
        ip = device.ip_or_domain.strip()
        port = int(device.device_port or 4370)

        success = False
        message = ""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3.0)
            res = sock.connect_ex((ip, port))
            sock.close()
            elapsed_ms = round((time.time() - start_time) * 1000, 1)

            if res == 0:
                success = True
                device.status = 'ONLINE'
                device.last_error_message = None
                message = f"Kết nối thành công tới thiết bị qua {ip}:{port} với thời gian phản hồi {elapsed_ms}ms."
            else:
                device.status = 'ERROR'
                device.last_error_message = f"Mã lỗi socket: {res}"
                message = f"Không thể mở kết nối tới {ip}:{port}. Mã lỗi mạng là {res}."
        except socket.timeout:
            elapsed_ms = round((time.time() - start_time) * 1000, 1)
            device.status = 'OFFLINE'
            device.last_error_message = "Thời gian chờ quá hạn"
            message = f"Thời gian chờ kết nối tới {ip}:{port} quá hạn. Vui lòng kiểm tra cổng 4370 trên modem và nguồn máy chấm công."
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 1)
            device.status = 'ERROR'
            device.last_error_message = str(e)
            message = f"Lỗi khi kiểm tra kết nối: {str(e)}"

        device.last_ping = timezone.now()
        device.save()

        return Response({
            "success": success,
            "status": device.status,
            "message": message,
            "response_time_ms": elapsed_ms,
            "device": BiometricDeviceSerializer(device).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='sync')
    def trigger_sync(self, request, pk=None):
        """Kích hoạt đồng bộ log tức thì cho thiết bị."""
        device = self.get_object()
        now = timezone.now()

        device.last_sync_time = now
        device.save()

        return Response({
            "success": True,
            "message": f"Đã gửi lệnh đồng bộ dữ liệu tới thiết bị {device.name}.",
            "new_punches_count": 0,
            "total_punches_synced": device.total_punches_synced,
            "device": BiometricDeviceSerializer(device).data
        }, status=status.HTTP_200_OK)


class EmployeeCareerHistoryViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = EmployeeCareerHistorySerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return EmployeeCareerHistory.objects.none()
        qs = EmployeeCareerHistory.objects.filter(company=company).select_related(
            'employee', 'old_department', 'new_department', 'old_designation', 'new_designation'
        )
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        event_type = self.request.query_params.get('event_type')
        if event_type:
            qs = qs.filter(event_type=event_type)
        return qs

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        serializer.save(company=company)


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = EmployeeDocumentSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return EmployeeDocument.objects.none()
        qs = EmployeeDocument.objects.filter(company=company).select_related('employee')
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        document_type = self.request.query_params.get('document_type')
        if document_type:
            qs = qs.filter(document_type=document_type)
        return qs

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        if not company:
            raise PermissionDenied("Không có quyền thực hiện.")
        serializer.save(company=company)







