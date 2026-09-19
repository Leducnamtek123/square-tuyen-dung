import io
from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.profiles.models import Company, CompanyMember, CompanyRole
from apps.hrm.models import (
    AttendanceRecord,
    AttendanceRequest,
    Department,
    Designation,
    Employee,
    EmployeeLeaveBalance,
    EmploymentContract,
    LeaveRequest,
    LeaveType,
)
from shared.configs import variable_system as var_sys


class EnterpriseHrmSecurityEdgeCasesTestCase(TestCase):
    """
    Enterprise HRM & Security Pentest QA Test Suite.
    Exhaustively tests edge cases, multi-tenant IDOR, and anomaly fuzzing across
    apps/hrm, apps/exchange, and apps/profiles.
    """

    def setUp(self):
        # Company A Setup
        self.owner_a = User.objects.create_user(
            'owner_a@sec-comp-a.vn',
            'Owner A',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        self.company_a = Company.objects.create(
            user=self.owner_a,
            company_name='Security Corp A',
            company_email='hr@sec-comp-a.vn',
            company_phone='0901111111',
            tax_code='TAX-SEC-A',
        )

        # Company B Setup
        self.owner_b = User.objects.create_user(
            'owner_b@sec-comp-b.vn',
            'Owner B',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        self.company_b = Company.objects.create(
            user=self.owner_b,
            company_name='Security Corp B',
            company_email='hr@sec-comp-b.vn',
            company_phone='0902222222',
            tax_code='TAX-SEC-B',
        )

        # Employee A1 (User & Employee in Company A)
        self.user_emp_a1 = User.objects.create_user(
            'emp_a1@sec-comp-a.vn',
            'Employee A1',
            password='Password123!',
            role=var_sys.JOB_SEEKER,
        )
        self.employee_a1 = Employee.objects.create(
            company=self.company_a,
            user=self.user_emp_a1,
            employee_code='EMP-A1',
            first_name='A1',
            last_name='Nguyễn',
            full_name='Nguyễn A1',
            email=self.user_emp_a1.email,
            status='ACTIVE',
            join_date=date(2025, 1, 1),
        )

        # Employee A2 (Manager/Colleague in Company A)
        self.user_emp_a2 = User.objects.create_user(
            'emp_a2@sec-comp-a.vn',
            'Employee A2',
            password='Password123!',
            role=var_sys.JOB_SEEKER,
        )
        self.employee_a2 = Employee.objects.create(
            company=self.company_a,
            user=self.user_emp_a2,
            employee_code='EMP-A2',
            first_name='A2',
            last_name='Trần',
            full_name='Trần A2',
            email=self.user_emp_a2.email,
            status='ACTIVE',
            join_date=date(2025, 1, 1),
        )

        # Employee B1 in Company B
        self.user_emp_b1 = User.objects.create_user(
            'emp_b1@sec-comp-b.vn',
            'Employee B1',
            password='Password123!',
            role=var_sys.JOB_SEEKER,
        )
        self.employee_b1 = Employee.objects.create(
            company=self.company_b,
            user=self.user_emp_b1,
            employee_code='EMP-B1',
            first_name='B1',
            last_name='Lê',
            full_name='Lê B1',
            email=self.user_emp_b1.email,
            status='ACTIVE',
            join_date=date(2025, 1, 1),
        )

        # Departments
        self.dept_a1 = Department.objects.create(
            company=self.company_a,
            name='Engineering A',
            code='ENG-A',
        )
        self.dept_b1 = Department.objects.create(
            company=self.company_b,
            name='Engineering B',
            code='ENG-B',
        )

        # Leave Type in Company A
        self.leave_type_annual = LeaveType.objects.create(
            company=self.company_a,
            name='Nghỉ phép năm',
            code='ANNUAL',
            days_per_year=12,
            is_paid=True,
        )
        # Leave Balance for A1
        self.balance_a1 = EmployeeLeaveBalance.objects.create(
            employee=self.employee_a1,
            leave_type=self.leave_type_annual,
            year=timezone.now().year,
            allocated_days=12.0,
            used_days=0.0,
            pending_days=0.0,
        )

        # API Clients
        self.client_owner_a = APIClient()
        self.client_owner_a.force_authenticate(user=self.owner_a)

        self.client_emp_a1 = APIClient()
        self.client_emp_a1.force_authenticate(user=self.user_emp_a1)

        self.client_owner_b = APIClient()
        self.client_owner_b.force_authenticate(user=self.owner_b)

    # =========================================================================
    # 1. ATTENDANCE EDGE CASES
    # =========================================================================

    def test_attendance_checkout_before_checkin_rejected(self):
        """Attendance check_out earlier than check_in must be rejected with 400."""
        payload = {
            'employee': self.employee_a1.id,
            'date': str(date(2026, 1, 10)),
            'check_in': '17:30:00',
            'check_out': '08:30:00',
            'status': 'PRESENT',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/attendances/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('check_out', str(res.data).lower())

    def test_attendance_negative_working_hours_rejected(self):
        """Negative working hours or negative overtime hours must be rejected with 400."""
        payload = {
            'employee': self.employee_a1.id,
            'date': str(date(2026, 1, 11)),
            'working_hours': -8.0,
            'status': 'PRESENT',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/attendances/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Test negative overtime
        payload_ot = {
            'employee': self.employee_a1.id,
            'date': str(date(2026, 1, 12)),
            'overtime_hours': -2.5,
            'status': 'PRESENT',
        }
        res_ot = self.client_owner_a.post('/api/v1/native-hrm/attendances/', payload_ot)
        self.assertEqual(res_ot.status_code, status.HTTP_400_BAD_REQUEST)

    def test_attendance_future_checkin_rejected(self):
        """Attendance record on a future date must be rejected with 400."""
        future_date = timezone.now().date() + timedelta(days=5)
        payload = {
            'employee': self.employee_a1.id,
            'date': str(future_date),
            'status': 'PRESENT',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/attendances/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tương lai', str(res.data).lower())

    def test_attendance_duplicate_same_day_rejected(self):
        """Cannot create duplicate attendance records for the same employee on the same date."""
        record_date = date(2026, 1, 15)
        AttendanceRecord.objects.create(
            employee=self.employee_a1,
            date=record_date,
            status='PRESENT',
            working_hours=Decimal('8.00'),
        )
        payload = {
            'employee': self.employee_a1.id,
            'date': str(record_date),
            'status': 'PRESENT',
            'working_hours': 8.0,
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/attendances/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue('unique' in str(res.data).lower() or 'tồn tại' in str(res.data).lower())

    # =========================================================================
    # 2. LEAVE REQUEST EDGE CASES
    # =========================================================================

    def test_leave_request_end_date_before_start_date_rejected(self):
        """Leave request with end_date earlier than start_date must be rejected with 400."""
        payload = {
            'employee': self.employee_a1.id,
            'leave_type': self.leave_type_annual.id,
            'start_date': '2026-06-15',
            'end_date': '2026-06-10',
            'total_days': 5.0,
            'reason': 'Nghỉ mát',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/leave-requests/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('end_date', str(res.data).lower())

    def test_leave_request_zero_or_negative_days_rejected(self):
        """Leave request with total_days <= 0 must be rejected with 400."""
        for invalid_days in [0, -1, -0.5]:
            payload = {
                'employee': self.employee_a1.id,
                'leave_type': self.leave_type_annual.id,
                'start_date': '2026-07-01',
                'end_date': '2026-07-03',
                'total_days': invalid_days,
                'reason': 'Nghỉ phép test ngày âm',
            }
            res = self.client_owner_a.post('/api/v1/native-hrm/leave-requests/', payload)
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leave_request_employee_cannot_self_approve(self):
        """An employee must NOT be able to self-approve their own leave request (Escalation attack)."""
        leave_req = LeaveRequest.objects.create(
            employee=self.employee_a1,
            leave_type=self.leave_type_annual,
            start_date=date(2026, 8, 1),
            end_date=date(2026, 8, 2),
            total_days=Decimal('2.0'),
            status='PENDING',
        )
        # Attempt self-approval as Employee A1
        res = self.client_emp_a1.patch(f'/api/v1/native-hrm/leave-requests/{leave_req.id}/approve/')
        self.assertIn(res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED])
        leave_req.refresh_from_db()
        self.assertEqual(leave_req.status, 'PENDING')

    def test_attendance_request_employee_cannot_self_approve_stage_1_or_2(self):
        """An employee must NOT be able to self-approve their own 2-stage attendance/leave request."""
        # Create AttendanceRequest for A1
        att_req = AttendanceRequest.objects.create(
            company=self.company_a,
            employee=self.employee_a1,
            request_type='LEAVE',
            leave_type=self.leave_type_annual,
            start_date=date(2026, 8, 10),
            end_date=date(2026, 8, 10),
            status='PENDING_STAGE_1',
        )
        # Attempt stage 1 self-approval
        res1 = self.client_emp_a1.post(f'/api/v1/native-hrm/attendance-requests/{att_req.id}/approve-stage-1/')
        self.assertEqual(res1.status_code, status.HTTP_403_FORBIDDEN)

        # Advance to PENDING_STAGE_2 / APPROVED_STAGE_1 via admin/owner
        att_req.status = 'APPROVED_STAGE_1'
        att_req.save()

        # Attempt stage 2 self-approval
        res2 = self.client_emp_a1.post(f'/api/v1/native-hrm/attendance-requests/{att_req.id}/approve-stage-2/')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)
        att_req.refresh_from_db()
        self.assertEqual(att_req.status, 'APPROVED_STAGE_1')

    def test_leave_request_overlapping_dates_rejected(self):
        """Submitting an overlapping leave request for the same employee must be rejected."""
        LeaveRequest.objects.create(
            employee=self.employee_a1,
            leave_type=self.leave_type_annual,
            start_date=date(2026, 9, 10),
            end_date=date(2026, 9, 15),
            total_days=Decimal('5.0'),
            status='PENDING',
        )
        # Overlapping request: Sept 12 to Sept 18
        payload = {
            'employee': self.employee_a1.id,
            'leave_type': self.leave_type_annual.id,
            'start_date': '2026-09-12',
            'end_date': '2026-09-18',
            'total_days': 5.0,
            'reason': 'Nghỉ trùng thời gian',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/leave-requests/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('trùng', str(res.data).lower())

    # =========================================================================
    # 3. EMPLOYMENT CONTRACT EDGE CASES
    # =========================================================================

    def test_contract_negative_base_salary_rejected(self):
        """Employment contract with negative base_salary must be rejected with 400."""
        payload = {
            'employee': self.employee_a1.id,
            'contract_number': 'HD-NEG-001',
            'contract_type': 'FIXED_TERM',
            'start_date': '2026-01-01',
            'end_date': '2026-12-31',
            'base_salary': -15000000.0,
            'status': 'ACTIVE',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/contracts/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('base_salary', str(res.data).lower())

    def test_contract_end_date_before_start_date_rejected(self):
        """Employment contract with end_date before start_date must be rejected with 400."""
        payload = {
            'employee': self.employee_a1.id,
            'contract_number': 'HD-REV-001',
            'contract_type': 'FIXED_TERM',
            'start_date': '2026-12-31',
            'end_date': '2026-01-01',
            'base_salary': 15000000.0,
            'status': 'ACTIVE',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/contracts/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('end_date', str(res.data).lower())

    def test_contract_negative_probation_period_rejected(self):
        """Employment contract with negative probation_period_months must be rejected."""
        payload = {
            'employee': self.employee_a1.id,
            'contract_number': 'HD-PROB-001',
            'contract_type': 'PROBATION',
            'start_date': '2026-01-01',
            'end_date': '2026-03-01',
            'probation_period_months': -2,
            'base_salary': 10000000.0,
            'status': 'ACTIVE',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/contracts/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('probation', str(res.data).lower())

    def test_contract_cancelling_already_ended_contract_rejected(self):
        """Cannot cancel, delete, or renew a contract that is already TERMINATED or EXPIRED."""
        contract = EmploymentContract.objects.create(
            employee=self.employee_a1,
            contract_number='HD-TERM-001',
            contract_type='FIXED_TERM',
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            base_salary=Decimal('15000000'),
            status='TERMINATED',
        )
        # Attempt to cancel via cancel action
        res_cancel = self.client_owner_a.post(f'/api/v1/native-hrm/contracts/{contract.id}/cancel/')
        self.assertEqual(res_cancel.status_code, status.HTTP_400_BAD_REQUEST)

        # Attempt to renew via renew action
        res_renew = self.client_owner_a.post(f'/api/v1/native-hrm/contracts/{contract.id}/renew/', {
            'new_contract_number': 'HD-TERM-002',
            'start_date': '2026-01-01',
            'end_date': '2026-12-31',
            'base_salary': 16000000,
        })
        self.assertEqual(res_renew.status_code, status.HTTP_400_BAD_REQUEST)

        # Attempt to delete via DELETE
        res_del = self.client_owner_a.delete(f'/api/v1/native-hrm/contracts/{contract.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_400_BAD_REQUEST)

    # =========================================================================
    # 4. CROSS-COMPANY IDOR INJECTIONS
    # =========================================================================

    def test_cross_company_department_parent_rejected(self):
        """Cross-company Department Parent Injection: Company A cannot assign Company B's dept as parent."""
        payload = {
            'name': 'Malicious Child Dept',
            'code': 'MAL-CHILD',
            'parent': self.dept_b1.id,
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/departments/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('parent', str(res.data).lower())

    def test_circular_department_parent_rejected(self):
        """Circular department parent hierarchy (e.g. self-parent or recursive loop) must be rejected."""
        # Self-parent attempt
        res_self = self.client_owner_a.patch(f'/api/v1/native-hrm/departments/{self.dept_a1.id}/', {
            'parent': self.dept_a1.id,
        })
        self.assertEqual(res_self.status_code, status.HTTP_400_BAD_REQUEST)

        # 2-node cycle attempt: Dept A2 -> Dept A1 -> Dept A2
        dept_a2 = Department.objects.create(
            company=self.company_a,
            name='Sub Engineering A',
            code='SUB-ENG-A',
            parent=self.dept_a1,
        )
        res_cycle = self.client_owner_a.patch(f'/api/v1/native-hrm/departments/{self.dept_a1.id}/', {
            'parent': dept_a2.id,
        })
        self.assertEqual(res_cycle.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('vòng', str(res_cycle.data).lower())

    def test_cross_company_reports_to_rejected(self):
        """Cross-company Reports-To Injection: Company A employee cannot report to Company B employee."""
        payload = {
            'employee_code': 'EMP-A3-IDOR',
            'first_name': 'IDOR',
            'last_name': 'Test',
            'full_name': 'IDOR Test',
            'email': 'idor.test@company-a.vn',
            'reports_to': self.employee_b1.id,
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/employees/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reports_to', str(res.data).lower())

    def test_cross_company_department_injection_rejected(self):
        """Assigning Company B's department to Company A's employee must be rejected."""
        payload = {
            'employee_code': 'EMP-A4-DEPT-IDOR',
            'first_name': 'Dept',
            'last_name': 'IDOR',
            'full_name': 'Dept IDOR',
            'email': 'dept.idor@company-a.vn',
            'department': self.dept_b1.id,
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/employees/', payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('department', str(res.data).lower())

    # =========================================================================
    # 5. APPS/PROFILES IDOR & CROSS-TENANT DEFENSES
    # =========================================================================

    def test_cross_tenant_member_addition_blocked(self):
        """Owner of Company A cannot add members to Company B."""
        target_user = User.objects.create_user(
            'newmember@victim.vn',
            'Victim Member',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        payload = {
            'userId': target_user.id,
            'title': 'Intruder',
            'status': CompanyMember.STATUS_ACTIVE,
        }
        # Attempt to post to CompanyMember endpoint with Company B header
        res = self.client_owner_a.post(
            '/api/v1/info/web/company-members/',
            payload,
            format='json',
            HTTP_X_ACTIVE_COMPANY_ID=str(self.company_b.id),
        )
        # Should be rejected because Owner A has no access to Company B
        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])
        self.assertFalse(CompanyMember.objects.filter(company=self.company_b, user=target_user).exists())

    def test_cross_tenant_role_assignment_blocked(self):
        """Cannot assign a role belonging to Company B to a member in Company A."""
        role_b = CompanyRole.objects.create(
            company=self.company_b,
            name='Company B Role',
            code='ROLE_B',
            is_active=True,
        )
        new_emp = User.objects.create_user(
            'new_a_emp@sec-comp-a.vn',
            'New Member A',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        payload = {
            'userId': new_emp.id,
            'roleId': role_b.id,
            'status': CompanyMember.STATUS_ACTIVE,
        }
        res = self.client_owner_a.post('/api/v1/info/web/company-members/', payload, format='json')
        # Should be rejected with 400 or 403 because role does not belong to Company A
        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN])

    # =========================================================================
    # 6. APPS/EXCHANGE TENANT ISOLATION
    # =========================================================================

    def test_exchange_export_tenant_isolation(self):
        """Company A cannot view or download Company B's export jobs."""
        from apps.exchange.models import ExportJob
        job_b = ExportJob.objects.create(
            company=self.company_b,
            created_by=self.owner_b,
            entity_type='employee',
            status=ExportJob.Status.COMPLETED,
        )
        # Access via Company A client
        res = self.client_owner_a.get(f'/api/v1/exchange/exports/{job_b.public_id}/')
        self.assertIn(res.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

        res_dl = self.client_owner_a.get(f'/api/v1/exchange/exports/{job_b.public_id}/download/')
        self.assertIn(res_dl.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    # =========================================================================
    # 7. GLOBAL ANOMALY & FUZZING TESTS
    # =========================================================================

    def test_global_pagination_extreme_values_never_500(self):
        """Endpoints must never throw 500 Internal Server Error when given anomalous pagination."""
        endpoints = [
            '/api/v1/native-hrm/employees/',
            '/api/v1/native-hrm/departments/',
            '/api/v1/native-hrm/attendances/',
            '/api/v1/native-hrm/leave-requests/',
        ]
        fuzz_params = [
            {'page': -999},
            {'page': 0},
            {'page': 1000000000},
            {'pageSize': -50},
            {'pageSize': 999999999},
            {'page': 'invalid_string'},
            {'pageSize': 'invalid_size'},
            {'page': 'NaN'},
        ]
        for ep in endpoints:
            for params in fuzz_params:
                res = self.client_owner_a.get(ep, params)
                self.assertNotEqual(
                    res.status_code,
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    f"Crash (500) on endpoint {ep} with params {params}"
                )
                self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])

    def test_global_10k_char_payload_fuzzing_never_500(self):
        """Sending 10,000-character string payload must not crash the server with 500."""
        huge_string = 'A' * 10000
        payload = {
            'name': huge_string,
            'code': 'HUGE-DEPT',
            'description': huge_string,
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/departments/', payload)
        self.assertNotEqual(res.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_global_4byte_unicode_emoji_fuzzing(self):
        """4-byte Unicode characters (emojis, mathematical symbols) must be accepted or cleanly handled."""
        emoji_name = 'Phòng AI & Big Data 🚀🔥🦄 𝕏'
        payload = {
            'name': emoji_name,
            'code': 'AI-EMOJI',
            'description': 'Description with unicode: 💎🎉 𠜎 𠱓',
        }
        res = self.client_owner_a.post('/api/v1/native-hrm/departments/', payload)
        self.assertNotEqual(res.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        if res.status_code == status.HTTP_201_CREATED:
            self.assertEqual(res.data['name'], emoji_name)

    def test_global_type_confusion_fuzzing(self):
        """Endpoints must reject or sanitize unexpected types (arrays/dicts for scalar fields) without 500."""
        anomalous_payloads = [
            {'name': ['Array', 'Inside', 'String']},
            {'code': {'nested': 'dict'}},
            {'is_active': 'not_a_boolean'},
            {'parent': 'not_an_int'},
        ]
        for bad_field in anomalous_payloads:
            res = self.client_owner_a.post('/api/v1/native-hrm/departments/', bad_field, format='json')
            self.assertNotEqual(
                res.status_code,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                f"Crash (500) on type confusion payload: {bad_field}"
            )
