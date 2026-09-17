import os
import sys
import django
import uuid
import random
from datetime import timedelta

app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
django.setup()

from django.utils import timezone
from apps.accounts.models import User
from apps.jobs.models import JobPost
from apps.interviews.models import InterviewSession, QuestionGroup
from apps.interviews.livekit_service import LiveKitService
from apps.interviews.tasks import prewarm_interview_tts_task

def run():
    print("=== SEEDING 10 REAL CANDIDATES FOR SQUARE RECRUITMENT ===")
    
    employer = User.objects.get(id=2)
    job = JobPost.objects.get(id=193)
    qg = QuestionGroup.objects.get(id=22)
    questions = list(qg.questions.all())

    print(f"Employer: {employer.email} ({employer.full_name})")
    print(f"Job: #{job.id} - {job.job_name}")
    print(f"Question Group: #{qg.id} - {qg.name} ({len(questions)} questions)")

    candidate_profiles = [
        {"name": "Nguyễn Hoàng Nam", "email": "nam.nguyen.ksxd@gmail.com", "phone": "0912345601", "exp": "3 năm kinh nghiệm - Giám sát Kết cấu bê tông cốt thép"},
        {"name": "Trần Minh Quân", "email": "quan.tran.site@gmail.com", "phone": "0912345602", "exp": "4 năm kinh nghiệm - Giám sát thi công hoàn thiện căn hộ cao cấp"},
        {"name": "Lê Thị Thảo", "email": "thao.le.mep@gmail.com", "phone": "0912345603", "exp": "2.5 năm kinh nghiệm - Kỹ sư Giám sát Cơ điện MEP tòa nhà"},
        {"name": "Phạm Đức Huy", "email": "huy.pham.civil@gmail.com", "phone": "0912345604", "exp": "5 năm kinh nghiệm - Kỹ sư Giám sát Khung thép & Móng cọc"},
        {"name": "Vũ Thu Hà", "email": "ha.vu.qaqc@gmail.com", "phone": "0912345605", "exp": "3 năm kinh nghiệm - Kỹ sư QA/QC Kiểm định vật liệu và nghiệm thu"},
        {"name": "Đỗ Văn Cường", "email": "cuong.do.struct@gmail.com", "phone": "0912345606", "exp": "4.5 năm kinh nghiệm - Giám sát Xây dựng Dân dụng & Công nghiệp"},
        {"name": "Bùi Anh Tuấn", "email": "tuan.bui.eng@gmail.com", "phone": "0912345607", "exp": "6 năm kinh nghiệm - Chỉ huy phó kiêm Giám sát an toàn công trường"},
        {"name": "Phan Thị Lan", "email": "lan.phan.pm@gmail.com", "phone": "0912345608", "exp": "3 năm kinh nghiệm - Kỹ sư Giám sát Nội thất và Kiến trúc chi tiết"},
        {"name": "Đặng Quốc Bảo", "email": "bao.dang.mep@gmail.com", "phone": "0912345609", "exp": "4 năm kinh nghiệm - Kỹ sư Giám sát Hệ thống HVAC và PCCC"},
        {"name": "Trịnh Hoàng Long", "email": "long.trinh.safety@gmail.com", "phone": "0912345610", "exp": "5 năm kinh nghiệm - Kỹ sư An toàn lao động HSE công trình Square"},
    ]

    created_sessions = []
    now = timezone.now()

    for idx, cp in enumerate(candidate_profiles, 1):
        user, _ = User.objects.get_or_create(
            email=cp["email"],
            defaults={
                "full_name": cp["name"],
                "phone_number": cp["phone"],
                "role_name": "JOB_SEEKER",
                "is_active": True,
                "is_verify_email": True,
            }
        )
        user.full_name = cp["name"]
        user.phone_number = cp["phone"]
        user.role_name = "JOB_SEEKER"
        user.is_active = True
        user.save()

        elapsed_mins = random.randint(2, 12)
        sched_mins = elapsed_mins + random.randint(3, 8)
        start_time = now - timedelta(minutes=elapsed_mins)
        scheduled_at = now - timedelta(minutes=sched_mins)

        session = InterviewSession(
            candidate=user,
            job_post=job,
            created_by=employer,
            question_group=qg,
            status="in_progress",
            type="mixed",
            session_type="official",
            interview_language="vi",
            scheduled_at=scheduled_at,
            start_time=start_time,
            question_cursor=random.randint(0, 2),
            session_metadata={
                "source": "square_recruitment_live",
                "candidate_experience": cp["exp"],
                "total_questions": len(questions),
            }
        )
        session.save()
        session.questions.set(questions)

        try:
            prewarm_interview_tts_task(session.id)
        except Exception as e:
            print(f"Prewarm error session {session.id}: {e}")

        try:
            LiveKitService.ensure_room_with_agent(session.room_name)
        except Exception as e:
            print(f"LiveKit room error session {session.id}: {e}")

        created_sessions.append(session)
        print(f"[{idx}/10] Created Session #{session.id}: {user.full_name} | Room: {session.room_name} | Token: {session.invite_token}")

    print("\n=== SUMMARY OF CREATED SESSIONS ===")
    print(f"Total sessions: {len(created_sessions)}")
    for s in created_sessions:
        print(f"Session #{s.id:3d} | {s.candidate.full_name:20s} | Token: {s.invite_token} | URL: https://infohr.vn/interview/session/{s.invite_token}")

if __name__ == "__main__":
    run()
