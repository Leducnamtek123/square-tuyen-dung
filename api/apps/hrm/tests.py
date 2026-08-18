from datetime import date
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.jobs.models import JobPost, JobPostActivity
from apps.profiles.models import (
    Career,
    Company,
    CompanyMember,
    CompanyRole,
    JobSeekerProfile,
    Resume,
)
from apps.hrm.models import (
    Department,
    Designation,
    Employee,
    EmploymentContract,
    LeaveRequest,
    LeaveType,
)
from apps.hrm.services import CandidateToEmployeeConverter, generate_next_employee_code
from shared.configs import variable_system as var_sys


class HrmAppTestCase(TestCase):
    def setUp(self):
        # Company A Owner
        self.owner_a = User.objects.create_user(
            'owner_a@company-a.vn',
            'Owner A',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        self.company_a = Company.objects.create(
            user=self.owner_a,
            company_name='Company A Corp',
            company_email='hr@company-a.vn',
            company_phone='0901111111',
            tax_code='TAX-COMP-A',
        )

        # Company B Owner
        self.owner_b = User.objects.create_user(
            'owner_b@company-b.vn',
            'Owner B',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        self.company_b = Company.objects.create(
            user=self.owner_b,
            company_name='Company B Corp',
            company_email='hr@company-b.vn',
            company_phone='0902222222',
            tax_code='TAX-COMP-B',
        )

        # Candidate User
        self.candidate_user = User.objects.create_user(
            'candidate@jobseeker.vn',
            'Nguyễn Văn Ứng Viên',
            password='Password123!',
            role=var_sys.JOB_SEEKER,
        )
        self.candidate_profile = JobSeekerProfile.objects.create(
            user=self.candidate_user,
            phone='0988888888',
            gender='M',
            birthday=date(1998, 5, 20),
            permanent_address='123 Đường ABC, Quận 1, TP.HCM',
            tax_code='TAX-CAND-999',
        )

        # Job Post for Company A
        self.career = Career.objects.create(name='Công nghệ thông tin')
        self.job_post_a = JobPost.objects.create(
            user=self.owner_a,
            company=self.company_a,
            job_name='Senior Python / React Developer',
            deadline=date(2026, 12, 31),
            quantity=2,
            position=5,
            type_of_workplace=1,
            experience=4,
            academic_level=2,
            job_type=1,
            salary_min=20000000,
            salary_max=35000000,
            career=self.career,
            status=var_sys.JobPostStatus.APPROVED,
        )

        # Resume & Application
        self.resume = Resume.objects.create(
            user=self.candidate_user,
            job_seeker_profile=self.candidate_profile,
            career=self.career,
            title='Senior Fullstack Developer CV',
        )
        self.application_a = JobPostActivity.objects.create(
            job_post=self.job_post_a,
            user=self.candidate_user,
            resume=self.resume,
            full_name=self.candidate_user.full_name,
            email=self.candidate_user.email,
            phone='0988888888',
            status=var_sys.ApplicationStatus.INTERVIEWED,
        )

        self.client_a = APIClient()
        self.client_a.force_authenticate(user=self.owner_a)

    def test_department_and_designation_creation(self):
        dept = Department.objects.create(
            company=self.company_a,
            name='Phòng Công Nghệ Thông Tin',
            code='DEPT-IT',
        )
        desig = Designation.objects.create(
            company=self.company_a,
            title='Backend Architect',
            code='BE-ARCH',
        )
        self.assertEqual(Department.objects.filter(company=self.company_a).count(), 1)
        self.assertEqual(Designation.objects.filter(company=self.company_a).count(), 1)

        response = self.client_a.get('/api/v1/native-hrm/departments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_tenant_isolation_hrm_access(self):
        """HR from Company B must NOT see Company A's employees."""
        # Create an employee in Company A
        Employee.objects.create(
            company=self.company_a,
            employee_code='SQ-EMP-001',
            first_name='An',
            last_name='Nguyễn',
            full_name='Nguyễn An',
            email='an.nguyen@comp-a.vn',
            status='ACTIVE',
        )

        client_b = APIClient()
        client_b.force_authenticate(user=self.owner_b)

        response_b = client_b.get('/api/v1/native-hrm/employees/')
        self.assertEqual(response_b.status_code, status.HTTP_200_OK)
        # Should be empty for Company B
        results = response_b.data if isinstance(response_b.data, list) else response_b.data.get('results', [])
        self.assertEqual(len(results), 0)

    def test_candidate_user_forbidden_from_hrm_apis(self):
        """Regular Job Seeker must receive 403 Forbidden when calling HRM APIs."""
        candidate_client = APIClient()
        candidate_client.force_authenticate(user=self.candidate_user)

        response = candidate_client.get('/api/v1/native-hrm/employees/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response_dashboard = candidate_client.get('/api/v1/native-hrm/dashboard/stats/')
        self.assertEqual(response_dashboard.status_code, status.HTTP_403_FORBIDDEN)

    def test_candidate_to_employee_conversion_success(self):
        """End-to-end test of converting JobPostActivity to Employee."""
        dept = Department.objects.create(company=self.company_a, name='Kỹ Thuật Phần Mềm', code='DEPT-ENG')
        desig = Designation.objects.create(company=self.company_a, title='Senior Developer', code='SR-DEV')

        payload = {
            'job_application_id': self.application_a.id,
            'department_id': dept.id,
            'designation_id': desig.id,
            'join_date': '2026-09-01',
            'probation_end_date': '2026-11-01',
            'base_salary': 30000000,
            'employment_type': 'FULL_TIME',
            'status': 'PROBATION',
        }

        response = self.client_a.post(
            '/api/v1/native-hrm/employees/onboard-from-candidate/',
            payload,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify Employee fields
        emp = Employee.objects.get(email=self.candidate_user.email, company=self.company_a)
        self.assertEqual(emp.user, self.candidate_user)
        self.assertEqual(emp.candidate_profile, self.candidate_profile)
        self.assertEqual(emp.onboarded_from_activity, self.application_a)
        self.assertEqual(emp.department, dept)
        self.assertEqual(emp.designation, desig)
        self.assertEqual(emp.gender, 'MALE')
        self.assertEqual(emp.address, '123 Đường ABC, Quận 1, TP.HCM')
        self.assertTrue(emp.employee_code.startswith('SQ-EMP-'))

        # Verify CompanyMember created
        self.assertTrue(
            CompanyMember.objects.filter(
                company=self.company_a,
                user=self.candidate_user,
                status=CompanyMember.STATUS_ACTIVE,
            ).exists()
        )

        # Verify Contract created
        contract = EmploymentContract.objects.filter(employee=emp).first()
        self.assertIsNotNone(contract)
        self.assertEqual(contract.base_salary, 30000000)
        self.assertEqual(contract.contract_type, 'PROBATION')

        # Verify Application updated to HIRED (5)
        self.application_a.refresh_from_db()
        self.assertEqual(self.application_a.status, var_sys.ApplicationStatus.HIRED)

    def test_candidate_conversion_with_camel_case_application_id(self):
        """Conversion with frontend camelCase applicationId and related fields."""
        dept = Department.objects.create(name="Product Engineering", company=self.company_a)
        desig = Designation.objects.create(title="Senior Frontend Engineer", company=self.company_a)

        payload = {
            'applicationId': self.application_a.id,
            'departmentId': dept.id,
            'designationId': desig.id,
            'joinDate': '2026-09-01',
            'probationEndDate': '2026-11-01',
            'baseSalary': 35000000,
            'allowance': 5000000,
            'employmentType': 'FULL_TIME',
        }

        response = self.client_a.post(
            '/api/v1/native-hrm/employees/onboard-from-candidate/',
            payload,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        emp = Employee.objects.get(email=self.candidate_user.email, company=self.company_a)
        self.assertEqual(emp.onboarded_from_activity, self.application_a)
        self.assertEqual(emp.department, dept)
        self.assertEqual(emp.designation, desig)

    def test_candidate_conversion_idempotency(self):
        """Calling conversion twice must return existing employee without duplicating."""
        payload = {
            'job_application_id': self.application_a.id,
            'join_date': '2026-09-01',
            'base_salary': 25000000,
        }

        # First Call
        resp1 = self.client_a.post(
            '/api/v1/native-hrm/employees/onboard-from-candidate/',
            payload,
            format='json',
        )
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)
        first_emp_id = resp1.data['id']

        # Second Call
        resp2 = self.client_a.post(
            '/api/v1/native-hrm/employees/onboard-from-candidate/',
            payload,
            format='json',
        )
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertEqual(resp2.data['id'], first_emp_id)

        # Verify only 1 Employee exists
        self.assertEqual(
            Employee.objects.filter(email=self.candidate_user.email, company=self.company_a).count(),
            1,
        )

    def test_cross_company_conversion_rejected(self):
        """Company B cannot convert an application belonging to Company A."""
        client_b = APIClient()
        client_b.force_authenticate(user=self.owner_b)

        payload = {
            'job_application_id': self.application_a.id,
            'join_date': '2026-09-01',
        }

        response = client_b.post(
            '/api/v1/native-hrm/employees/onboard-from-candidate/',
            payload,
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_conversion_transaction_rollback(self):
        """If an error occurs during conversion, entire transaction rolls back."""
        from unittest.mock import patch
        
        payload = {
            'job_application_id': self.application_a.id,
            'join_date': '2026-09-01',
            'base_salary': 20000000,
        }

        # Mock EmploymentContract.objects.create to simulate failure
        with patch('apps.hrm.models.EmploymentContract.objects.create', side_effect=Exception("Database failure on contract")):
            with self.assertRaises(Exception):
                self.client_a.post(
                    '/api/v1/native-hrm/employees/onboard-from-candidate/',
                    payload,
                    format='json',
                )

        # Verify no Employee was persisted
        self.assertFalse(
            Employee.objects.filter(email=self.candidate_user.email, company=self.company_a).exists()
        )
        # Verify Application status remains unchanged
        self.application_a.refresh_from_db()
        self.assertEqual(self.application_a.status, var_sys.ApplicationStatus.INTERVIEWED)

    def test_cross_company_department_isolation(self):
        """Company A cannot see Company B's departments and vice-versa."""
        dept_a = Department.objects.create(name="Engineering A", company=self.company_a)
        dept_b = Department.objects.create(name="Engineering B", company=self.company_b)

        client_a = APIClient()
        client_a.force_authenticate(user=self.owner_a)

        resp_a = client_a.get('/api/v1/native-hrm/departments/')
        self.assertEqual(resp_a.status_code, status.HTTP_200_OK)
        results_a = resp_a.data.get('results', resp_a.data) if isinstance(resp_a.data, dict) else resp_a.data
        dept_ids_a = [d['id'] for d in results_a]
        self.assertIn(dept_a.id, dept_ids_a)
        self.assertNotIn(dept_b.id, dept_ids_a)

    def test_unauthorized_company_header_rejected(self):
        """Owner A attempting to pass X-Active-Company-Id for Company B cannot access Company B data."""
        Department.objects.create(name="Top Secret B", company=self.company_b)

        client_a = APIClient()
        client_a.force_authenticate(user=self.owner_a)
        resp = client_a.get('/api/v1/native-hrm/departments/', HTTP_X_ACTIVE_COMPANY_ID=str(self.company_b.id))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

