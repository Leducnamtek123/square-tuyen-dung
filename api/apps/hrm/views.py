import csv
from datetime import timedelta
from django.db.models import Count, Q
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
    EmploymentContract,
    LeaveRequest,
    LeaveType,
)
from apps.hrm.serializers import (
    AttendanceRecordSerializer,
    DepartmentSerializer,
    DesignationSerializer,
    EmployeeSerializer,
    EmploymentContractSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
    OnboardCandidateSerializer,
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

        employees = Employee.objects.filter(company=company).select_related('department', 'designation')

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="hrm_payroll_export.csv"'
        response.write('\ufeff')

        writer = csv.writer(response)
        writer.writerow(['Mã nhân viên', 'Họ và tên', 'Email', 'Phòng ban', 'Chức danh', 'Trạng thái', 'Ngày vào làm', 'Lương cơ bản (VND)'])

        for emp in employees:
            active_contract = emp.contracts.filter(status='ACTIVE').first()
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
        serializer.save()

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk=None):
        leave_req = self.get_object()
        leave_req.status = 'APPROVED'
        leave_req.approved_at = timezone.now()

        approver = Employee.objects.filter(user=request.user, company=leave_req.employee.company).first()
        if approver:
            leave_req.approved_by = approver

        leave_req.save(update_fields=['status', 'approved_at', 'approved_by', 'update_at'])
        return Response(LeaveRequestSerializer(leave_req).data)

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject(self, request, pk=None):
        leave_req = self.get_object()
        leave_req.status = 'REJECTED'
        leave_req.rejection_reason = request.data.get('rejection_reason', '')
        leave_req.save(update_fields=['status', 'rejection_reason', 'update_at'])
        return Response(LeaveRequestSerializer(leave_req).data)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [perms_custom.CanManageEmployees]
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return AttendanceRecord.objects.none()
        return AttendanceRecord.objects.filter(employee__company=company).select_related('employee')


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
