from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.jobs.models import JobPost, JobPostActivity, JobOfferLetter
from apps.profiles.models import Company, CompanyMember, CompanyRole, JobSeekerProfile
from apps.hrm.models import (
    Department,
    Designation,
    Employee,
    EmployeeDocument,
    EmploymentContract,
    EmployeeOnboardingProcess,
    OnboardingTaskItem,
    EmployeeCareerHistory,
)
from apps.hrm.services import (
    CandidateToEmployeeConverter,
    initialize_onboarding_process,
    approve_preboarding_document,
    reject_preboarding_document,
    complete_task_item,
    confirm_day_one_attendance,
    submit_probation_evaluation,
    cancel_onboarding_process,
)
from shared.configs import variable_system as var_sys


class OnboardingLifecycleTestCase(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            'hr_lead@corp-test.vn',
            'HR Lead',
            password='Password123!',
            role=var_sys.EMPLOYER,
        )
        self.company = Company.objects.create(
            user=self.owner,
            company_name='Test Onboarding Corp',
            company_email='hr@corp-test.vn',
        )
        self.dept = Department.objects.create(company=self.company, name='Phòng Công nghệ', code='IT')
        self.desig = Designation.objects.create(company=self.company, title='Kỹ sư Phần mềm', code='SWE')

        # Candidate user & application
        self.candidate_user = User.objects.create_user(
            'dev_candidate@gmail.com',
            'Nguyễn Văn Ứng Viên',
            password='Password123!',
            role=var_sys.JOB_SEEKER,
        )
        self.job = JobPost.objects.create(
            user=self.owner,
            company=self.company,
            job_name='Senior Backend Developer',
            status=var_sys.JobPostStatus.APPROVED,
            deadline=timezone.now().date() + timedelta(days=30),
            quantity=2,
            job_description='<p>Mô tả công việc</p>',
            position=4,
            type_of_workplace=1,
            experience=2,
            academic_level=2,
            job_type=1,
            salary_min=20000000,
            salary_max=35000000,
            contact_person_name='HR Manager',
            contact_person_phone='0901234567',
            contact_person_email='hr@test.com',
        )
        self.application = JobPostActivity.objects.create(
            user=self.candidate_user,
            job_post=self.job,
            full_name='Nguyễn Văn Ứng Viên',
            email='dev_candidate@gmail.com',
            phone='0987654321',
            status=var_sys.ApplicationStatus.INTERVIEWED,
        )
        self.offer = JobOfferLetter.objects.create(
            application=self.application,
            job_post=self.job,
            company=self.company,
            candidate=self.candidate_user,
            position_title='Senior Backend Developer',
            salary_offered=Decimal('25000000'),
            allowance=Decimal('2000000'),
            start_date=timezone.now().date() + timedelta(days=7),
            expiration_date=timezone.now().date() + timedelta(days=3),
            status=JobOfferLetter.STATUS_ACCEPTED,
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)

    def test_onboard_candidate_initializes_onboarding_process_and_tasks(self):
        """Converting a candidate automatically generates an OnboardingProcess and 10 standard tasks."""
        employee, created = CandidateToEmployeeConverter.convert(
            company=self.company,
            actor=self.owner,
            data={
                'job_application_id': self.application.id,
                'department_id': self.dept.id,
                'designation_id': self.desig.id,
                'base_salary': 25000000,
                'allowance': 2000000,
                'join_date': self.offer.start_date,
                'probation_end_date': self.offer.start_date + timedelta(days=60),
            },
        )
        self.assertTrue(created)
        self.assertEqual(employee.status, 'PROBATION')

        # Check process exists
        process = EmployeeOnboardingProcess.objects.filter(employee=employee).first()
        self.assertIsNotNone(process)
        self.assertEqual(process.stage, 'PREBOARDING_DOCS')
        self.assertEqual(process.target_start_date, self.offer.start_date)

        # Check standard tasks generated
        tasks = process.tasks.all()
        self.assertGreaterEqual(tasks.count(), 10)
        codes = list(tasks.values_list('code', flat=True))
        self.assertIn('UPLOAD_ID_CARD', codes)
        self.assertIn('PROVISION_EMAIL', codes)
        self.assertIn('CONFIRM_ATTENDANCE', codes)
        self.assertIn('FINAL_PROBATION_REVIEW', codes)

    def test_approve_preboarding_document_creates_employee_document(self):
        """Approving preboarding document automatically creates EmployeeDocument record and recalculates progress."""
        employee, _ = CandidateToEmployeeConverter.convert(
            company=self.company,
            actor=self.owner,
            data={'job_application_id': self.application.id},
        )
        process = employee.onboarding_process
        id_task = process.tasks.filter(code='UPLOAD_ID_CARD').first()
        self.assertIsNotNone(id_task)

        approved_task = approve_preboarding_document(
            task_id=id_task.id,
            actor=self.owner,
            file_url='https://s3.infohr.vn/private-documents/cccd_front_back.pdf',
            document_type='IDENTITY_CARD',
            name='Căn cước công dân 2 mặt',
        )
        self.assertTrue(approved_task.is_completed)
        self.assertIsNotNone(approved_task.document)
        self.assertEqual(approved_task.document.document_type, 'IDENTITY_CARD')
        self.assertEqual(approved_task.document.employee, employee)

        process.refresh_from_db()
        self.assertGreater(process.progress_percent, 0)

    def test_day_one_confirmation_activates_contract_and_records_career_history(self):
        """Confirming Day 1 activates contract and moves stage to PROBATION_EVALUATION."""
        employee, _ = CandidateToEmployeeConverter.convert(
            company=self.company,
            actor=self.owner,
            data={'job_application_id': self.application.id, 'base_salary': 20000000},
        )
        process = employee.onboarding_process

        updated_process = confirm_day_one_attendance(process_id=process.id, actor=self.owner)
        self.assertEqual(updated_process.stage, 'PROBATION_EVALUATION')
        self.assertEqual(updated_process.actual_start_date, timezone.now().date())

        # Check contract active
        contract = employee.contracts.first()
        self.assertEqual(contract.status, 'ACTIVE')

        # Check career history recorded
        history = EmployeeCareerHistory.objects.filter(employee=employee, event_type='ONBOARDING').first()
        self.assertIsNotNone(history)

    def test_probation_evaluation_passed_promotes_employee_to_active(self):
        """Passing probation review sets Employee status to ACTIVE and stage to COMPLETED."""
        employee, _ = CandidateToEmployeeConverter.convert(
            company=self.company,
            actor=self.owner,
            data={'job_application_id': self.application.id},
        )
        process = employee.onboarding_process

        completed_process = submit_probation_evaluation(
            process_id=process.id,
            result='PASSED',
            notes='Hoàn thành xuất sắc 100% mục tiêu thử việc, hòa nhập tốt.',
            actor=self.owner,
        )
        self.assertEqual(completed_process.stage, 'COMPLETED')
        employee.refresh_from_db()
        self.assertEqual(employee.status, 'ACTIVE')

        # Check career history
        promotion_history = EmployeeCareerHistory.objects.filter(
            employee=employee,
            event_type='PROMOTION',
        ).first()
        self.assertIsNotNone(promotion_history)

    def test_cancel_onboarding_process(self):
        """Cancelling onboarding sets stage to CANCELLED and Employee status to RESIGNED."""
        employee, _ = CandidateToEmployeeConverter.convert(
            company=self.company,
            actor=self.owner,
            data={'job_application_id': self.application.id},
        )
        process = employee.onboarding_process

        cancelled_process = cancel_onboarding_process(
            process_id=process.id,
            reason='Ứng viên từ chối đi làm vào phút chót',
            actor=self.owner,
        )
        self.assertEqual(cancelled_process.stage, 'CANCELLED')
        self.assertEqual(cancelled_process.cancel_reason, 'Ứng viên từ chối đi làm vào phút chót')
        employee.refresh_from_db()
        self.assertEqual(employee.status, 'RESIGNED')

    def test_api_onboarding_endpoints(self):
        """Test API endpoints for listing, stats, approve-document, confirm Day 1, and probation evaluation."""
        employee, _ = CandidateToEmployeeConverter.convert(
            company=self.company,
            actor=self.owner,
            data={'job_application_id': self.application.id, 'base_salary': 18000000},
        )
        process = employee.onboarding_process

        # 1. Test stats endpoint
        res_stats = self.client.get('/api/v1/native-hrm/onboarding-processes/stats/')
        self.assertEqual(res_stats.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res_stats.data['total_onboarding'], 1)
        self.assertGreaterEqual(res_stats.data['pending_preboarding_docs'], 1)

        # 2. Test list endpoint
        res_list = self.client.get('/api/v1/native-hrm/onboarding-processes/')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res_list.data) > 0 or res_list.data.get('count', 0) > 0)

        # 3. Test approve document endpoint
        id_task = process.tasks.filter(code='UPLOAD_ID_CARD').first()
        res_approve = self.client.post(
            f'/api/v1/native-hrm/onboarding-processes/{process.id}/tasks/{id_task.id}/approve-document/',
            data={
                'file_url': 'https://s3.infohr.vn/cccd.pdf',
                'document_type': 'IDENTITY_CARD',
                'name': 'Bản chụp CCCD',
            },
            format='json',
        )
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)
        self.assertTrue(res_approve.data['is_completed'])

        # 4. Test confirm day one endpoint
        res_day_one = self.client.post(
            f'/api/v1/native-hrm/onboarding-processes/{process.id}/confirm-day-one/',
            format='json',
        )
        self.assertEqual(res_day_one.status_code, status.HTTP_200_OK)
        self.assertEqual(res_day_one.data['stage'], 'PROBATION_EVALUATION')

        # 5. Test probation evaluation endpoint
        res_eval = self.client.post(
            f'/api/v1/native-hrm/onboarding-processes/{process.id}/probation-evaluation/',
            data={
                'result': 'PASSED',
                'notes': 'Hoàn thành xuất sắc',
            },
            format='json',
        )
        self.assertEqual(res_eval.status_code, status.HTTP_200_OK)
        self.assertEqual(res_eval.data['stage'], 'COMPLETED')

