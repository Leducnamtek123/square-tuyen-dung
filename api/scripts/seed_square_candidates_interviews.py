import os
import django
import sys
from datetime import datetime, timedelta
import uuid

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from shared.configs import variable_system as var_sys
from apps.accounts.models import User
from apps.profiles.models import Company, JobSeekerProfile, Resume
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import QuestionGroup, Question, InterviewSession

def run():
    print("=== SEEDING SQUARE COMPANY CANDIDATES & INTERVIEWS ===")
    
    # 1. Get Company Square
    square = Company.objects.filter(company_name__icontains='Square').first()
    if not square:
        square = Company.objects.first()
        print(f"Square company not found by exact name, using: {square.company_name}")
    else:
        print(f"Found Company: {square.company_name} (ID: {square.id}, Slug: {square.slug})")

    owner = square.user or User.objects.filter(role_name=var_sys.EMPLOYER).first()
    print(f"Company Owner / HR: {owner.email if owner else 'None'}")

    # 2. Get or create Question Groups
    qg_kt = QuestionGroup.objects.filter(name__icontains='kiến trúc').first()
    if not qg_kt:
        qg_kt = QuestionGroup.objects.create(
            name="Interview kiến trúc",
            description="Bộ câu hỏi phỏng vấn chuẩn cho ngành kiến trúc & nội thất",
            company=square,
            author=owner
        )
    print(f"Question Group 1: {qg_kt.name} (Questions: {qg_kt.questions.count()})")

    # Add questions if few
    if qg_kt.questions.count() < 4:
        q1, _ = Question.objects.get_or_create(
            text="Hãy giới thiệu về đồ án kiến trúc/nội thất mà bạn tâm đắc nhất và vai trò cụ thể của bạn trong dự án đó?",
            defaults={'category': 'technical', 'difficulty': 2, 'company': square, 'author': owner}
        )
        q2, _ = Question.objects.get_or_create(
            text="Khi có sự bất đồng ý kiến giữa thiết kế ý tưởng của bạn và yêu cầu thi công thực tế tại công trường, bạn giải quyết như thế nào?",
            defaults={'category': 'situational', 'difficulty': 2, 'company': square, 'author': owner}
        )
        q3, _ = Question.objects.get_or_create(
            text="Bạn thành thạo những công cụ phần mềm nào (AutoCAD, Revit, 3Ds Max, SketchUp, Lumion) và quy trình phối hợp BIM của bạn ra sao?",
            defaults={'category': 'technical', 'difficulty': 2, 'company': square, 'author': owner}
        )
        q4, _ = Question.objects.get_or_create(
            text="Bạn quản lý tiến độ và kiểm soát chất lượng hồ sơ thiết kế thi công (Shop Drawing) như thế nào để tránh sai sót?",
            defaults={'category': 'behavioral', 'difficulty': 2, 'company': square, 'author': owner}
        )
        qg_kt.questions.add(q1, q2, q3, q4)
        print(f"Updated {qg_kt.name} with 4 questions.")

    qg_cb = QuestionGroup.objects.filter(name__icontains='cơ bản').first()
    if not qg_cb:
        qg_cb = QuestionGroup.objects.create(
            name="Bộ câu hỏi phỏng vấn cơ bản",
            description="Bộ câu hỏi đánh giá kỹ năng mềm, văn hóa doanh nghiệp và định hướng nghề nghiệp",
            company=square,
            author=owner
        )
    print(f"Question Group 2: {qg_cb.name} (Questions: {qg_cb.questions.count()})")

    # 3. Get or create Hot Job Posts for Square
    deadline = (timezone.now() + timedelta(days=30)).date()
    jobs_data = [
        {
            "job_name": "Kiến Trúc Sư Thiết Kế Nội Thất & Không Gian",
            "is_hot": True,
            "is_urgent": True,
            "salary_min": 18000000,
            "salary_max": 30000000,
            "qg": qg_kt,
            "job_description": "Chủ trì thiết kế ý tưởng và triển khai hồ sơ bản vẽ nội thất biệt thự, căn hộ cao cấp.",
            "job_requirement": "Tốt nghiệp Đại học chuyên ngành Kiến trúc/Nội thất. Ít nhất 2 năm kinh nghiệm.",
        },
        {
            "job_name": "Quản Lý Dự Án Xây Dựng & Giám Sát Hiện Trường",
            "is_hot": True,
            "is_urgent": False,
            "salary_min": 25000000,
            "salary_max": 40000000,
            "qg": qg_kt,
            "job_description": "Quản lý tiến độ, chất lượng, an toàn lao động và vật tư cho các dự án xây dựng của Square.",
            "job_requirement": "Có chứng chỉ PMP hoặc Quản lý dự án, 3+ năm kinh nghiệm quản lý dự án nội thất/xây dựng.",
        },
        {
            "job_name": "Chuyên Viên Tư Vấn Khách Hàng & Phát Triển Dự Án",
            "is_hot": True,
            "is_urgent": False,
            "salary_min": 12000000,
            "salary_max": 25000000,
            "qg": qg_cb,
            "job_description": "Tư vấn giải pháp thiết kế thi công trọn gói cho khách hàng cao cấp.",
            "job_requirement": "Giao tiếp xuất sắc, có hiểu biết về ngành kiến trúc nội thất.",
        }
    ]

    active_jobs = []
    for jd in jobs_data:
        job, created = JobPost.objects.get_or_create(
            company=square,
            job_name=jd["job_name"],
            defaults={
                "user": owner,
                "deadline": deadline,
                "quantity": 3,
                "position": 2,
                "type_of_workplace": 1,
                "experience": 2,
                "academic_level": 2,
                "job_type": 1,
                "salary_min": jd["salary_min"],
                "salary_max": jd["salary_max"],
                "is_hot": jd["is_hot"],
                "is_urgent": jd["is_urgent"],
                "status": var_sys.JobPostStatus.APPROVED,
                "contact_person_name": "Phòng Nhân Sự Square",
                "contact_person_phone": "0901234567",
                "contact_person_email": "hr@square.vn",
                "job_description": jd["job_description"],
                "job_requirement": jd["job_requirement"],
                "benefits_enjoyed": "Lương tháng 13, thưởng dự án, bảo hiểm sức khỏe cao cấp.",
                "interview_template": jd["qg"]
            }
        )
        if not created and job.status != var_sys.JobPostStatus.APPROVED:
            job.status = var_sys.JobPostStatus.APPROVED
            job.is_hot = True
            job.interview_template = jd["qg"]
            job.save()
        active_jobs.append(job)
        print(f"Job: {job.job_name} (ID: {job.id}, Is Hot: {job.is_hot}, Template: {job.interview_template.name if job.interview_template else None})")

    # 4. Candidates Setup
    candidates_data = [
        {
            "email": "son.pham@square-candidate.vn",
            "full_name": "Sơn Phạm",
            "phone": "0912345678",
            "title": "Kiến Trúc Sư Trưởng",
            "job": active_jobs[0],
            "qg": qg_kt
        },
        {
            "email": "nguyen.van.an@square-candidate.vn",
            "full_name": "Nguyễn Văn An",
            "phone": "0987654321",
            "title": "Kỹ Sư Quản Lý Dự Án",
            "job": active_jobs[1] if len(active_jobs) > 1 else active_jobs[0],
            "qg": qg_kt
        },
        {
            "email": "le.thi.mai@square-candidate.vn",
            "full_name": "Lê Thị Mai",
            "phone": "0934567890",
            "title": "Chuyên Viên Tư Vấn Khách Hàng",
            "job": active_jobs[2] if len(active_jobs) > 2 else active_jobs[0],
            "qg": qg_cb
        },
        {
            "email": "tran.duc.thanh@square-candidate.vn",
            "full_name": "Trần Đức Thành",
            "phone": "0945678901",
            "title": "Kiến Trúc Sư 3D Visualization",
            "job": active_jobs[0],
            "qg": qg_kt
        }
    ]

    created_interviews = []
    now = timezone.now()

    for cd in candidates_data:
        # Create or update candidate user
        u, u_created = User.objects.get_or_create(
            email=cd["email"],
            defaults={
                "full_name": cd["full_name"],
                "role_name": var_sys.JOB_SEEKER,
                "is_active": True,
                "is_verify_email": True
            }
        )
        if u_created:
            u.set_password("Square@2026")
            u.save()

        # JobSeekerProfile & Resume
        jsp, _ = JobSeekerProfile.objects.get_or_create(
            user=u,
            defaults={"phone": cd["phone"], "is_seeking_job": True}
        )
        resume, _ = Resume.objects.get_or_create(
            user=u,
            job_seeker_profile=jsp,
            defaults={"title": f"CV - {cd['full_name']} - {cd['title']}"}
        )

        # Apply to Job (JobPostActivity)
        job_post = cd["job"]
        act, act_created = JobPostActivity.objects.get_or_create(
            job_post=job_post,
            user=u,
            defaults={
                "full_name": cd["full_name"],
                "email": cd["email"],
                "phone": cd["phone"],
                "resume": resume,
                "status": var_sys.ApplicationStatus.CONTACTED
            }
        )
        if not act_created and act.status != var_sys.ApplicationStatus.CONTACTED:
            act.status = var_sys.ApplicationStatus.CONTACTED
            act.save()
        print(f"Application: {cd['full_name']} -> {job_post.job_name} (Status: Đã liên hệ)")

        # Create Interview Session
        session = InterviewSession.objects.filter(candidate=u, job_post=job_post).first()
        if not session:
            invite_token = uuid.uuid4().hex
            room_name = f"interview-{uuid.uuid4().hex[:12]}"
            session = InterviewSession.objects.create(
                candidate=u,
                job_post=job_post,
                created_by=owner,
                question_group=cd["qg"],
                room_name=room_name,
                invite_token=invite_token,
                status='scheduled',
                type='mixed',
                scheduled_at=now + timedelta(hours=1)
            )
            # Add questions from group
            for q in cd["qg"].questions.all():
                session.questions.add(q)
            print(f"Created Interview Session: #{session.id} | Token: {session.invite_token} | Room: {session.room_name} | Candidate: {cd['full_name']}")
        else:
            session.question_group = cd["qg"]
            session.status = 'scheduled'
            session.scheduled_at = now + timedelta(hours=1)
            session.save()
            for q in cd["qg"].questions.all():
                session.questions.add(q)
            print(f"Updated Interview Session: #{session.id} | Token: {session.invite_token} | Candidate: {cd['full_name']}")

        created_interviews.append(session)

    print(f"\nSUCCESS! Seeded {len(created_interviews)} candidate interviews for Company Square.")
    print("\n--- LINK PHỎNG VẤN TRỰC TIẾP CHO ỨNG VIÊN ---")
    for iv in created_interviews:
        print(f"* Ứng viên {iv.candidate.full_name or iv.candidate.email} ({iv.job_post.job_name if iv.job_post else ''}):")
        print(f"  URL: http://localhost:8080/interview/{iv.invite_token}")

if __name__ == '__main__':
    run()
