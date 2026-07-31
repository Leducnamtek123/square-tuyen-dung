from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.accounts.active_company import apply_active_company_from_request
from apps.profiles.models import Company, JobSeekerProfile
from apps.jobs.models import JobPostActivity
from apps.hrm.models import (
    Department,
    Designation,
    Employee,
    EmploymentContract,
    LeaveType,
    LeaveRequest,
    AttendanceRecord,
)
from apps.hrm.serializers import (
    DepartmentSerializer,
    DesignationSerializer,
    EmployeeSerializer,
    EmploymentContractSerializer,
    LeaveTypeSerializer,
    LeaveRequestSerializer,
    AttendanceRecordSerializer,
    OnboardCandidateSerializer,
)


def _get_company_for_request(request):
    company = apply_active_company_from_request(request)
    if company:
        return company
    
    # Fallback to user's first owned company or first created company
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        owned_company = Company.objects.filter(user=user).first()
        if owned_company:
            return owned_company
        member_company = Company.objects.filter(members__user=user).first()
        if member_company:
            return member_company
    
    return Company.objects.first()


class DepartmentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return Department.objects.none()
        return Department.objects.filter(company=company)

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        serializer.save(company=company)

    @action(detail=False, methods=['get'], url_path='org-chart')
    def org_chart(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response([])
        
        departments = Department.objects.filter(company=company, parent__isnull=True)
        
        def build_tree(dept):
            children = Department.objects.filter(parent=dept)
            employees = Employee.objects.filter(department=dept, status__in=['PROBATION', 'ACTIVE'])
            return {
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'manager_name': dept.manager.full_name if dept.manager else None,
                'employee_count': employees.count(),
                'children': [build_tree(child) for child in children]
            }

        tree = [build_tree(dept) for dept in departments]
        return Response(tree)


class DesignationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DesignationSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return Designation.objects.none()
        return Designation.objects.filter(company=company)

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        serializer.save(company=company)


class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return Employee.objects.none()
        
        qs = Employee.objects.filter(company=company)
        
        # Filtering
        dept_id = self.request.query_params.get('department')
        if dept_id:
            qs = qs.filter(department_id=dept_id)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
            
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(employee_code__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
            
        return qs

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        
        # Auto generate employee code if not provided
        code = serializer.validated_data.get('employee_code')
        if not code:
            count = Employee.objects.filter(company=company).count() + 1
            code = f"SQ-EMP-{count:03d}"
            
        first_name = serializer.validated_data.get('first_name', '')
        last_name = serializer.validated_data.get('last_name', '')
        full_name = f"{last_name} {first_name}".strip()
        
        serializer.save(
            company=company,
            employee_code=code,
            full_name=full_name
        )

    @action(detail=False, methods=['post'], url_path='onboard-from-candidate')
    def onboard_from_candidate(self, request):
        serializer = OnboardCandidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        company = _get_company_for_request(request)
        if not company:
            return Response({'detail': 'Company not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate employee code
        count = Employee.objects.filter(company=company).count() + 1
        emp_code = f"SQ-EMP-{count:03d}"
        
        candidate_profile = None
        if data.get('candidate_profile_id'):
            candidate_profile = JobSeekerProfile.objects.filter(id=data['candidate_profile_id']).first()
        elif data.get('job_application_id'):
            app = JobPostActivity.objects.filter(id=data['job_application_id']).first()
            if app:
                candidate_profile = getattr(app, 'resume', None)
                if candidate_profile and hasattr(candidate_profile, 'candidate_profile'):
                    candidate_profile = candidate_profile.candidate_profile
                    
        full_name = f"{data.get('last_name', '')} {data.get('first_name', '')}".strip()
        
        dept = None
        if data.get('department_id'):
            dept = Department.objects.filter(id=data['department_id']).first()
            
        desig = None
        if data.get('designation_id'):
            desig = Designation.objects.filter(id=data['designation_id']).first()

        employee = Employee.objects.create(
            company=company,
            candidate_profile=candidate_profile,
            employee_code=emp_code,
            first_name=data['first_name'],
            last_name=data['last_name'],
            full_name=full_name,
            email=data['email'],
            phone=data.get('phone', ''),
            department=dept,
            designation=desig,
            join_date=data['join_date'],
            probation_end_date=data.get('probation_end_date'),
            employment_type=data.get('employment_type', 'FULL_TIME'),
            status='PROBATION'
        )
        
        # Create initial contract if base_salary provided
        if data.get('base_salary'):
            contract_num = f"HD-{emp_code}-01"
            EmploymentContract.objects.create(
                employee=employee,
                contract_number=contract_num,
                contract_type='PROBATION',
                start_date=data['join_date'],
                end_date=data.get('probation_end_date'),
                base_salary=data['base_salary'],
                status='ACTIVE'
            )
            
        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)


class EmploymentContractViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EmploymentContractSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return EmploymentContract.objects.none()
        return EmploymentContract.objects.filter(employee__company=company)


class LeaveTypeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LeaveTypeSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return LeaveType.objects.none()
        return LeaveType.objects.filter(company=company)

    def perform_create(self, serializer):
        company = _get_company_for_request(self.request)
        serializer.save(company=company)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return LeaveRequest.objects.none()
        return LeaveRequest.objects.filter(employee__company=company)

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk=None):
        leave_req = self.get_object()
        leave_req.status = 'APPROVED'
        leave_req.approved_at = timezone.now()
        
        # Find manager employee if possible
        approver = Employee.objects.filter(user=request.user).first()
        if approver:
            leave_req.approved_by = approver
            
        leave_req.save()
        return Response(LeaveRequestSerializer(leave_req).data)

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject(self, request, pk=None):
        leave_req = self.get_object()
        leave_req.status = 'REJECTED'
        leave_req.rejection_reason = request.data.get('rejection_reason', '')
        leave_req.save()
        return Response(LeaveRequestSerializer(leave_req).data)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        company = _get_company_for_request(self.request)
        if not company:
            return AttendanceRecord.objects.none()
        return AttendanceRecord.objects.filter(employee__company=company)


class HrmDashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        company = _get_company_for_request(request)
        if not company:
            return Response({
                'active_employees': 0,
                'probation_employees': 0,
                'pending_leaves': 0,
                'expiring_contracts': 0,
                'department_breakdown': []
            })
            
        active_count = Employee.objects.filter(company=company, status='ACTIVE').count()
        probation_count = Employee.objects.filter(company=company, status='PROBATION').count()
        pending_leaves_count = LeaveRequest.objects.filter(employee__company=company, status='PENDING').count()
        
        # Expiring contracts in 30 days
        today = timezone.now().date()
        next_30_days = today + timedelta(days=30)
        expiring_contracts_count = EmploymentContract.objects.filter(
            employee__company=company,
            status='ACTIVE',
            end_date__gte=today,
            end_date__lte=next_30_days
        ).count()
        
        # Department breakdown
        depts = Department.objects.filter(company=company).annotate(
            emp_count=Count('employees', filter=Q(employees__status__in=['PROBATION', 'ACTIVE']))
        ).values('id', 'name', 'code', 'emp_count')

        return Response({
            'active_employees': active_count,
            'probation_employees': probation_count,
            'pending_leaves': pending_leaves_count,
            'expiring_contracts': expiring_contracts_count,
            'department_breakdown': list(depts)
        })
