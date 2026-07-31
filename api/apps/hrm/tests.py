from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.profiles.models import Company
from apps.hrm.models import Department, Designation, Employee, EmploymentContract, LeaveRequest


class HrmAppTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            'hr_admin@example.com',
            'HR Admin',
            password='Password123!',
            role=1
        )
        self.company = Company.objects.create(
            user=self.user,
            company_name='Square Test Company',
            company_email='hr@square.vn'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_department_creation_and_list(self):
        dept = Department.objects.create(
            company=self.company,
            name='Phòng Công Nghệ Thông Tin',
            code='DEPT-IT'
        )
        self.assertEqual(Department.objects.count(), 1)
        
        response = self.client.get('/api/v1/native-hrm/departments/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_301_MOVED_PERMANENTLY])

    def test_employee_creation(self):
        dept = Department.objects.create(company=self.company, name='Phòng IT', code='DEPT-IT')
        desig = Designation.objects.create(company=self.company, title='Developer', code='DEV')
        
        emp = Employee.objects.create(
            company=self.company,
            employee_code='SQ-EMP-001',
            first_name='Nam',
            last_name='Lê',
            full_name='Lê Nam',
            email='nam.le@square.vn',
            department=dept,
            designation=desig,
            status='ACTIVE',
            employment_type='FULL_TIME'
        )
        self.assertEqual(Employee.objects.count(), 1)
        self.assertEqual(emp.full_name, 'Lê Nam')

    def test_onboard_candidate_api(self):
        payload = {
            'first_name': 'Văn A',
            'last_name': 'Nguyen',
            'email': 'nguyenvana@example.com',
            'phone': '0901234567',
            'join_date': '2026-08-01',
            'base_salary': 15000000,
            'employment_type': 'FULL_TIME'
        }
        response = self.client.post('/api/v1/native-hrm/employees/onboard-from-candidate/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.filter(email='nguyenvana@example.com').count(), 1)
