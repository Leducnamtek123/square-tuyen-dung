import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import transaction
from django.utils import timezone
from shared.configs import variable_system as var_sys
from apps.jobs.models import JobPost, JobPostActivity
from apps.jobs.serializers import (
    JobPostSerializer,
    JobPostDetailSerializer,
    JobPostActivitySerializer,
    EmployerJobPostActivitySerializer,
    JobSeekerJobPostActivitySerializer,
)
from apps.jobs.filters import JobPostFilter, EmployerJobPostActivityFilter
from apps.jobs.services import JobActivityService, JobPostService
from apps.jobs.ai_scoring_service import score_job_application
from apps.profiles.models import Resume, Company, JobSeekerProfile
from apps.accounts.models import User
from apps.locations.models import City, Location
from apps.common.models import Career

print("=" * 60)
print("RUNNING JOBS, SEARCH & ATS VERIFICATION SUITE")
print("=" * 60)

passed = 0
total = 0

def record_test(name, success, details=""):
    global passed, total
    total += 1
    if success:
        passed += 1
        print(f"  [PASS] {name} - {details}")
    else:
        print(f"  [FAIL] {name} - {details}")
        sys.exit(1)

# TEST 1: JobPostFilter is_active / isActive filter
print("\n--- TEST SUITE 1: ORM Filters & JobPostFilter ---")
try:
    filter_active = JobPostFilter(data={'isActive': True}, queryset=JobPost.objects.all())
    qs_active = filter_active.qs
    count_active = qs_active.count()
    record_test("JobPostFilter(isActive=True) execution", True, f"Count: {count_active}")

    filter_inactive = JobPostFilter(data={'isActive': False}, queryset=JobPost.objects.all())
    qs_inactive = filter_inactive.qs
    count_inactive = qs_inactive.count()
    record_test("JobPostFilter(isActive=False) execution", True, f"Count: {count_inactive}")

    filter_snake = JobPostFilter(data={'is_active': True}, queryset=JobPost.objects.all())
    record_test("JobPostFilter(is_active=True) execution", True, f"Count: {filter_snake.qs.count()}")
except Exception as e:
    record_test("JobPostFilter execution", False, str(e))

# TEST 2: Serializers verification (JobPostSerializer, JobPostDetailSerializer)
print("\n--- TEST SUITE 2: JobPost Serializers & SerializerMethodFields ---")
job = JobPost.objects.first()
try:
    ser = JobPostSerializer(job)
    data = ser.data
    has_city = 'cityChooseData' in data
    has_career = 'careerChooseData' in data
    has_company = 'companyDict' in data
    has_file = 'fileUrl' in data
    record_test("JobPostSerializer includes cityChooseData", has_city, f"Val: {data.get('cityChooseData')}")
    record_test("JobPostSerializer includes careerChooseData", has_career, f"Val: {data.get('careerChooseData')}")
    record_test("JobPostSerializer includes companyDict", has_company, f"Company: {data.get('companyDict', {}).get('company_name') if data.get('companyDict') else 'None'}")
    record_test("JobPostSerializer includes fileUrl", has_file, f"Val: {data.get('fileUrl')}")

    # JobPostDetailSerializer
    detail_ser = JobPostDetailSerializer(job)
    detail_data = detail_ser.data
    record_test("JobPostDetailSerializer instantiation & data generation", 'cityChooseData' in detail_data and 'fileUrl' in detail_data)
except Exception as e:
    record_test("JobPost serializers verification", False, str(e))

# TEST 3: ATS Application Lifecycle & Resume Linking
print("\n--- TEST SUITE 3: ATS Application Lifecycle & Resume Linking ---")
with transaction.atomic():
    test_job = JobPost.objects.filter(status=var_sys.JobPostStatus.APPROVED).first()
    if not test_job:
        test_job = JobPost.objects.first()
        test_job.status = var_sys.JobPostStatus.APPROVED
        test_job.save(update_fields=['status'])

    candidate = User.objects.filter(role_name__in=['CANDIDATE', 'JOB_SEEKER', 'job_seeker']).first() or User.objects.last()

    resume = Resume.objects.filter(user=candidate).first()
    if not resume:
        resume = Resume.objects.create(
            user=candidate,
            title="Senior Python Developer CV",
            file_url="https://minio.example.com/resumes/senior_dev.pdf",
            is_active=True
        )

    # If the candidate has an existing activity for test_job, delete it within transaction to test fresh apply
    JobPostActivity.objects.filter(user=candidate, job_post=test_job).delete()

    applied_act = JobActivityService.apply_to_job(
        candidate,
        {
            'job_post': test_job,
            'resume': resume,
            'full_name': "Candidate ATS Tester",
            'email': candidate.email or "cand@test.com",
            'phone': "0987654321",
        }
    )
    record_test("JobActivityService.apply_to_job creates activity", bool(applied_act and applied_act.id), f"ID: {applied_act.id}")
    record_test("Activity linked correct resume", applied_act.resume_id == resume.id, f"Resume ID: {applied_act.resume_id}")

    # Verify cv_file / file_url / fileUrl properties on model
    record_test("JobPostActivity.cv_file property resolves", applied_act.cv_file is not None or resume.file_url is not None, f"cv_file: {applied_act.cv_file}")
    record_test("JobPostActivity.fileUrl property resolves", applied_act.fileUrl == applied_act.file_url, f"fileUrl: {applied_act.fileUrl}")

    # TEST 4: AI Matching & Scoring resilience
    print("\n--- TEST SUITE 4: AI Matching / Scoring Graceful Handling ---")
    score_res = score_job_application(applied_act)
    record_test("AI scoring completes without exception", isinstance(score_res, dict), f"Result keys: {list(score_res.keys())}")
    record_test("AI scoring has integer score", isinstance(score_res.get("score"), int), f"Score: {score_res.get('score')}")

    # Test scoring with None/empty job description in-memory
    orig_desc = applied_act.job_post.job_description
    applied_act.job_post.job_description = None
    score_res_empty = score_job_application(applied_act)
    record_test("AI scoring handles empty job_description gracefully", isinstance(score_res_empty, dict), f"Score: {score_res_empty.get('score')}")
    applied_act.job_post.job_description = orig_desc

    # TEST 5: Employer ATS View & Serializer Fields
    print("\n--- TEST SUITE 5: Employer ATS View & Serializer Fields ---")
    emp_ser = EmployerJobPostActivitySerializer(
        applied_act,
        fields=["id", "fileUrl", "resume", "resumeDict", "cityChooseData", "careerChooseData", "companyDict", "userDict", "status", "ai_analysis_score"]
    )
    emp_data = emp_ser.data
    record_test("EmployerJobPostActivitySerializer includes fileUrl", 'fileUrl' in emp_data, f"fileUrl: {emp_data.get('fileUrl')}")
    record_test("EmployerJobPostActivitySerializer includes resume", 'resume' in emp_data, f"resume: {emp_data.get('resume')}")
    record_test("EmployerJobPostActivitySerializer includes resumeDict", 'resumeDict' in emp_data, f"resumeDict title: {emp_data.get('resumeDict', {}).get('title') if emp_data.get('resumeDict') else None}")
    record_test("EmployerJobPostActivitySerializer includes companyDict", 'companyDict' in emp_data)
    record_test("EmployerJobPostActivitySerializer includes cityChooseData", 'cityChooseData' in emp_data)
    record_test("EmployerJobPostActivitySerializer includes careerChooseData", 'careerChooseData' in emp_data)
    record_test("JobPostActivitySerializer alias points to Employer serializer", JobPostActivitySerializer is EmployerJobPostActivitySerializer)

    transaction.set_rollback(True)

print("\n" + "=" * 60)
print(f"ALL TESTS COMPLETED: {passed}/{total} PASSED")
print("=" * 60)
