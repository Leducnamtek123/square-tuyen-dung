from datetime import date
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
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
from apps.hrm.payroll_engine import calculate_vietnam_payroll, calculate_pit_vietnam
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

    def test_payroll_engine_vietnam_compliance(self):
        """Test calculation of Vietnam Gross-to-Net and employer contributions."""
        # 1. Test Gross 15,000,000 VND, 0 dependents
        res = calculate_vietnam_payroll(gross_salary=Decimal("15000000"), dependents_count=0)
        self.assertEqual(res['gross_salary'], Decimal("15000000"))
        # Employee insurance: 8% + 1.5% + 1% = 10.5% = 1,575,000
        self.assertEqual(res['insurance_deductions']['total_insurance'], Decimal("1575000"))
        # Employer insurance: 17.5% + 3% + 1% + 2% = 23.5% = 3,525,000
        self.assertEqual(res['employer_contributions']['total_employer_insurance'], Decimal("3525000"))
        # Taxable income = 15,000,000 - 1,575,000 - 11,000,000 = 2,425,000
        # Tax: Bracket 1 (5% of 2,425,000) = 121,250
        self.assertEqual(res['tax_deductions']['personal_income_tax'], Decimal("121250"))
        # Net salary: 15,000,000 - 1,575,000 - 121,250 = 13,303,750
        self.assertEqual(res['net_salary'], Decimal("13303750"))
        # Total company cost: 15,000,000 + 3,525,000 = 18,525,000
        self.assertEqual(res['total_company_expense'], Decimal("18525000"))

    def test_leave_balance_auto_allocation_and_seniority(self):
        """Test auto allocation of annual leaves including seniority bonus calculation."""
        # Employee joined 11 years ago -> 11 // 5 = 2 extra days
        emp = Employee.objects.create(
            company=self.company_a,
            employee_code='SQ-EMP-SENIOR',
            first_name='Văn',
            last_name='Trần',
            full_name='Trần Văn',
            email='tran.van@company-a.vn',
            join_date=date(2015, 1, 1),
            status='ACTIVE',
        )

        resp = self.client_a.post('/api/v1/native-hrm/leave-balances/auto-allocate/', {'year': 2026})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        balance = EmployeeLeaveBalance.objects.get(employee=emp, year=2026)
        self.assertEqual(balance.allocated_days, Decimal("12.0"))
        self.assertEqual(balance.seniority_bonus_days, Decimal("2.0"))
        self.assertEqual(balance.total_allowed_days, 14.0)
        self.assertEqual(balance.remaining_days, 14.0)

    def test_leave_request_approval_updates_balance(self):
        """Test submitting leave increments pending_days, approving decrements pending and increments used."""
        emp = Employee.objects.create(
            company=self.company_a,
            employee_code='SQ-EMP-LEAVE',
            first_name='Hoa',
            last_name='Lê',
            full_name='Lê Hoa',
            email='le.hoa@company-a.vn',
            status='ACTIVE',
        )
        leave_type = LeaveType.objects.create(
            company=self.company_a,
            name='Nghỉ phép năm',
            code='ANNUAL',
            days_per_year=12,
            is_paid=True,
        )
        balance = EmployeeLeaveBalance.objects.create(
            employee=emp,
            leave_type=leave_type,
            year=2026,
            allocated_days=Decimal("12.0"),
            seniority_bonus_days=Decimal("0.0"),
        )

        # 1. Create Leave Request for 2 days
        create_resp = self.client_a.post('/api/v1/native-hrm/leave-requests/', {
            'employee': emp.id,
            'leave_type': leave_type.id,
            'start_date': '2026-06-10',
            'end_date': '2026-06-11',
            'total_days': 2.0,
            'reason': 'Du lịch nghỉ dưỡng',
        })
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        leave_req_id = create_resp.data['id']

        balance.refresh_from_db()
        self.assertEqual(balance.pending_days, Decimal("2.0"))
        self.assertEqual(balance.remaining_days, 10.0)

        # 2. Approve Leave Request
        approve_resp = self.client_a.patch(f'/api/v1/native-hrm/leave-requests/{leave_req_id}/approve/')
        self.assertEqual(approve_resp.status_code, status.HTTP_200_OK)

        balance.refresh_from_db()
        self.assertEqual(balance.pending_days, Decimal("0.0"))
        self.assertEqual(balance.used_days, Decimal("2.0"))
        self.assertEqual(balance.remaining_days, 10.0)

    def test_monthly_timesheet_and_quick_checkin(self):
        """Test quick check-in and timesheet matrix calculation."""
        emp = Employee.objects.create(
            company=self.company_a,
            employee_code='SQ-EMP-ATT',
            first_name='Minh',
            last_name='Phạm',
            full_name='Phạm Minh',
            email='pham.minh@company-a.vn',
            status='ACTIVE',
        )

        # Quick check-in
        checkin_resp = self.client_a.post('/api/v1/native-hrm/attendances/quick-checkin/', {
            'employee_id': emp.id,
            'date': '2026-08-15',
            'status': 'PRESENT',
            'check_in': '08:30:00',
            'check_out': '17:30:00',
            'working_hours': 8.0,
        })
        self.assertEqual(checkin_resp.status_code, status.HTTP_201_CREATED)

        # Retrieve timesheet
        timesheet_resp = self.client_a.get('/api/v1/native-hrm/attendances/timesheet/?month=8&year=2026')
        self.assertEqual(timesheet_resp.status_code, status.HTTP_200_OK)
        data = timesheet_resp.data
        self.assertEqual(data['month'], 8)
        self.assertEqual(data['year'], 2026)
        self.assertEqual(data['total_days'], 31)
        self.assertTrue(len(data['employees']) >= 1)

        emp_entry = next((e for e in data['employees'] if e['employee_id'] == emp.id), None)
        self.assertIsNotNone(emp_entry)
        self.assertEqual(emp_entry['records'][15]['status'], 'PRESENT')
        self.assertEqual(emp_entry['stats']['total_present'], 1)

    def test_monthly_payroll_calculation_and_workflow(self):
        """Test monthly payroll calculate, KPI summary, approve all, and mark paid all."""
        emp = Employee.objects.create(
            company=self.company_a,
            employee_code='SQ-EMP-PAY',
            first_name='Tuấn',
            last_name='Đỗ',
            full_name='Đỗ Tuấn',
            email='do.tuan@company-a.vn',
            status='ACTIVE',
        )
        EmploymentContract.objects.create(
            employee=emp,
            contract_number='HD-2026-TUAN',
            contract_type='FIXED_TERM',
            start_date=date(2026, 1, 1),
            base_salary=Decimal("20000000"),
            allowance=Decimal("2000000"),
            status='ACTIVE',
        )

        # 1. Calculate Payroll
        calc_resp = self.client_a.post('/api/v1/native-hrm/payroll/calculate/', {
            'month': 8,
            'year': 2026,
            'standard_working_days': 22,
        })
        self.assertEqual(calc_resp.status_code, status.HTTP_200_OK)
        payroll = MonthlyPayrollRecord.objects.get(employee=emp, month=8, year=2026)
        self.assertEqual(payroll.status, 'DRAFT')
        self.assertTrue(payroll.net_salary > 0)
        self.assertTrue(payroll.total_company_expense > payroll.gross_salary)

        # 2. Get KPIs
        kpi_resp = self.client_a.get('/api/v1/native-hrm/payroll/summary-kpis/?month=8&year=2026')
        self.assertEqual(kpi_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(kpi_resp.data['total_employees'] >= 1)
        self.assertEqual(kpi_resp.data['draft_count'], 1)

        # 3. Approve All
        approve_resp = self.client_a.post('/api/v1/native-hrm/payroll/approve-all/', {'month': 8, 'year': 2026})
        self.assertEqual(approve_resp.status_code, status.HTTP_200_OK)
        payroll.refresh_from_db()
        self.assertEqual(payroll.status, 'APPROVED')

        # 4. Mark Paid All
        paid_resp = self.client_a.post('/api/v1/native-hrm/payroll/mark-paid-all/', {'month': 8, 'year': 2026})
        self.assertEqual(paid_resp.status_code, status.HTTP_200_OK)
        payroll.refresh_from_db()
        self.assertEqual(payroll.status, 'PAID')
        self.assertIsNotNone(payroll.payment_date)

    def test_contract_renewal_workflow(self):
        """Test renewing contract sets previous to EXPIRED and upgrades PROBATION employee to ACTIVE."""
        emp = Employee.objects.create(
            company=self.company_a,
            employee_code='SQ-EMP-PROB',
            first_name='Bình',
            last_name='Vũ',
            full_name='Vũ Bình',
            email='vu.binh@company-a.vn',
            status='PROBATION',
        )
        old_contract = EmploymentContract.objects.create(
            employee=emp,
            contract_number='HD-PROB-001',
            contract_type='PROBATION',
            start_date=date(2026, 6, 1),
            end_date=date(2026, 8, 1),
            base_salary=Decimal("12000000"),
            status='ACTIVE',
        )

        renew_resp = self.client_a.post(f'/api/v1/native-hrm/contracts/{old_contract.id}/renew/', {
            'contract_number': 'HD-OFFICIAL-001',
            'contract_type': 'FIXED_TERM',
            'start_date': '2026-08-02',
            'end_date': '2027-08-02',
            'base_salary': 18000000,
            'allowance': 1500000,
        })
        self.assertEqual(renew_resp.status_code, status.HTTP_201_CREATED)

        old_contract.refresh_from_db()
        self.assertEqual(old_contract.status, 'EXPIRED')

        emp.refresh_from_db()
        self.assertEqual(emp.status, 'ACTIVE')

        new_contract = EmploymentContract.objects.get(contract_number='HD-OFFICIAL-001')
        self.assertEqual(new_contract.employee, emp)
        self.assertEqual(new_contract.status, 'ACTIVE')
        self.assertEqual(new_contract.base_salary, Decimal("18000000"))

    def test_employee_self_service_me_endpoint(self):
        """Employee accessing /api/v1/native-hrm/me/ retrieves personal profile and records."""
        emp_user = User.objects.create_user(
            'self.service@jobseeker.vn',
            'Nguyễn Tự Phục Vụ',
            password='Password123!',
            role=var_sys.JOB_SEEKER,
        )
        emp = Employee.objects.create(
            company=self.company_a,
            user=emp_user,
            employee_code='SQ-EMP-SELF',
            first_name='Tự Phục Vụ',
            last_name='Nguyễn',
            full_name='Nguyễn Tự Phục Vụ',
            email='self.service@jobseeker.vn',
            status='ACTIVE',
        )
        contract = EmploymentContract.objects.create(
            employee=emp,
            contract_number='HD-SELF-001',
            contract_type='INDEFINITE',
            start_date=date(2026, 1, 1),
            base_salary=Decimal("25000000"),
            status='ACTIVE',
        )

        emp_client = APIClient()
        emp_client.force_authenticate(user=emp_user)

        resp = emp_client.get('/api/v1/native-hrm/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['employee']['employee_code'], 'SQ-EMP-SELF')
        self.assertEqual(resp.data['active_contract']['contract_number'], 'HD-SELF-001')


