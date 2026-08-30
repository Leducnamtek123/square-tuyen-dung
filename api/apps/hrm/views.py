import csv
from datetime import timedelta
from django.db import transaction
from django.db.models import Count, Q, Prefetch
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
    AttendanceRecord,
    Department,
    Designation,
    Employee,
    EmployeeLeaveBalance,
    EmploymentContract,
    LeaveRequest,
    LeaveType,
    MonthlyPayrollRecord,
)
from apps.hrm.serializers import (
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
    QuickCheckinSerializer,
    RenewContractSerializer,
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

        leave_req = serializer.save()

        # Cập nhật số ngày chờ duyệt trên Quỹ phép
        if leave_req.leave_type:
            year = leave_req.start_date.year
            balance = EmployeeLeaveBalance.objects.filter(
                employee=leave_req.employee,
                leave_type=leave_req.leave_type,
                year=year
            ).first()
            if balance:
                balance.pending_days = float(balance.pending_days) + float(leave_req.total_days)
                balance.save(update_fields=['pending_days', 'update_at'])

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

        leaves = LeaveRequest.objects.filter(
            employee__company=company,
            status='APPROVED',
            start_date__year=year,
            start_date__month=month
        )
        leave_map = {}
        for l in leaves:
            start_d = max(1, l.start_date.day)
            end_d = min(num_days, l.end_date.day)
            for d in range(start_d, end_d + 1):
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
        for emp in employees:
            contract = emp.contracts.filter(status='ACTIVE').order_by('-start_date').first()
            gross = contract.base_salary if contract else Decimal("10000000")
            allowance = contract.allowance if contract else Decimal("0")

            unpaid_leave_days = LeaveRequest.objects.filter(
                employee=emp,
                status='APPROVED',
                leave_type__is_paid=False,
                start_date__year=year,
                start_date__month=month,
            ).count()

            attendance_days = AttendanceRecord.objects.filter(
                employee=emp,
                date__year=year,
                date__month=month,
                status__in=['PRESENT', 'LATE', 'EARLY_LEAVE']
            ).count()
            actual_days = attendance_days if attendance_days > 0 else standard_days

            calc = calculate_vietnam_payroll(
                gross_salary=gross,
                allowance=allowance,
                bonus=Decimal(str(request.data.get('bonus', 0))),
                working_days_actual=actual_days,
                standard_working_days=standard_days,
                unpaid_leave_days=unpaid_leave_days,
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

        return Response({
            'employee': EmployeeSerializer(emp).data,
            'active_contract': EmploymentContractSerializer(active_contract).data if active_contract else None,
            'leave_balances': EmployeeLeaveBalanceSerializer(leave_balances, many=True).data,
            'recent_payrolls': MonthlyPayrollRecordSerializer(recent_payrolls, many=True).data
        })

