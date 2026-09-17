import os
import sys
import time
import json
import logging
from datetime import timedelta
import requests

# Django setup
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.conf import settings
from django.utils import timezone
from apps.accounts.models import User
from apps.profiles.models import Company, JobSeekerProfile
from apps.jobs.models import JobPost, JobPostActivity
from apps.interviews.models import InterviewSession, Question, QuestionGroup, InterviewTranscript
from apps.interviews.livekit_service import LiveKitService
from apps.interviews.agent_auth import build_signature
from apps.interviews.tasks import evaluate_interview_session
from shared.configs import variable_system as var_sys
from shared.configs.variable_system import ApplicationStatus

logger = logging.getLogger("QA_INTERVIEW_E2E")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_API_URL = "http://127.0.0.1:8000"

def signed_api_call(method: str, path: str, json_body: dict = None) -> requests.Response:
    from django.db import connection
    connection.close()
    body_bytes = json.dumps(json_body).encode("utf-8") if json_body is not None else b""
    timestamp = str(int(time.time()))
    secret = str(getattr(settings, "INTERVIEW_AGENT_SHARED_SECRET", "") or "")
    
    sig = build_signature(secret, method.upper(), path, timestamp, body_bytes)
    headers = {
        "X-Square-Agent-Timestamp": timestamp,
        "X-Square-Agent-Signature": sig,
        "Content-Type": "application/json",
    }
    url = f"{BASE_API_URL}{path}"
    if method.upper() == "GET":
        return requests.get(url, headers=headers, timeout=25)
    elif method.upper() == "POST":
        return requests.post(url, headers=headers, data=body_bytes, timeout=25)
    elif method.upper() == "PATCH":
        return requests.patch(url, headers=headers, data=body_bytes, timeout=25)
    else:
        raise ValueError(f"Unsupported method {method}")


def reload_session(session: InterviewSession) -> InterviewSession:
    from django.db import connection
    connection.close()
    return InterviewSession.objects.get(id=session.id)


def run_mock_interview_test():
    print("\n" + "="*80)
    print(">>> TEST CASE 1: PHỎNG VẤN THỬ — MOCK PRACTICE INTERVIEW WITH AILA")
    print("="*80)
    
    # 1. Candidate Virtual User
    candidate_email = "virtual_candidate_mock@square.vn"
    candidate_user, created = User.objects.get_or_create(
        email=candidate_email,
        defaults={
            "full_name": "Ứng viên ảo AILA Thử nghiệm",
            "role_name": var_sys.JOB_SEEKER,
            "is_active": True,
        }
    )
    if not created and not candidate_user.full_name:
        candidate_user.full_name = "Ứng viên ảo AILA Thử nghiệm"
        candidate_user.save()
    print(f"[1] Ứng viên ảo chuẩn bị: {candidate_user.full_name} — email: {candidate_user.email}")

    # 2. Prepare Mock Questions
    mock_questions_data = [
        "Hãy giới thiệu ngắn gọn về bản thân, quá trình học tập và kinh nghiệm nổi bật nhất của bạn.",
        "Khi gặp một vấn đề kỹ thuật khó khăn hoặc áp lực deadline gấp, bạn tiếp cận và giải quyết như thế nào?",
        "Mục tiêu phát triển nghề nghiệp và kỳ vọng học hỏi của bạn trong 2 năm tới là gì?"
    ]
    mock_questions = []
    for idx, q_text in enumerate(mock_questions_data):
        q, _ = Question.objects.get_or_create(
            text=q_text,
            defaults={
                "category": "general" if idx == 0 else ("situational" if idx == 1 else "behavioral"),
                "difficulty": 1,
                "default_duration_seconds": 120,
            }
        )
        mock_questions.append(q)
    print(f"[2] Chuẩn bị ngân hàng câu hỏi thử nghiệm: {len(mock_questions)} câu hỏi")

    # 3. Create Mock Interview Session
    session = InterviewSession.objects.create(
        candidate=candidate_user,
        session_type=InterviewSession.SESSION_TYPE_MOCK,
        type="mixed",
        status="scheduled",
        time_limit_per_question=120,
        session_metadata={
            "interviewer_name": "Trợ lý AI AILA",
            "avatar_backdrop": "modern_office"
        }
    )
    session.questions.set(mock_questions)
    print(f"[3] Tạo phiên phỏng vấn thử: ID={session.id}, Room={session.room_name}, Token={session.invite_token}")
    assert session.status == "scheduled", "Trạng thái khởi tạo phải là scheduled"
    assert session.start_time is None, "start_time ban đầu phải là None"
    try:
        LiveKitService.ensure_room_with_agent(session.room_name)
    except Exception as e:
        logger.warning("Could not pre-ensure room with agent: %s", e)

    # 4. Context API Verification
    context_path = f"/api/v1/interview/compat/{session.room_name}/context"
    res_ctx = signed_api_call("GET", context_path)
    assert res_ctx.status_code == 200, f"Context API thất bại: {res_ctx.status_code} {res_ctx.text}"
    ctx_data = res_ctx.json()
    print(f"[4] Lấy bối cảnh phỏng vấn thành công: {ctx_data.get('candidateName')} — {ctx_data.get('questionCount')} câu hỏi")
    assert ctx_data.get("questionCount") == 3, "Số lượng câu hỏi trong context phải là 3"

    # 5. Candidate joins & Session starts: status -> in_progress
    status_path = f"/api/v1/interview/compat/{session.room_name}/status"
    session = reload_session(session)
    if session.status != "in_progress":
        res_start = signed_api_call("PATCH", status_path, {"status": "in_progress"})
        assert res_start.status_code == 200, f"Bắt đầu phiên thất bại: {res_start.status_code} {res_start.text}"
        session = reload_session(session)
    assert session.status == "in_progress", "Trạng thái phải là in_progress"
    assert session.start_time is not None, "start_time phải được ghi nhận"
    print(f"[5] Ứng viên ảo vào phòng: Trạng thái=in_progress, Bắt đầu lúc={session.start_time}")

    # 6. Step-by-step Question - Answer Cycle
    mock_answers = [
        "Tôi tốt nghiệp chuyên ngành công nghệ và có hơn 2 năm kinh nghiệm thực chiến phát triển ứng dụng web, từng dẫn dắt hoàn thành đúng hạn dự án thương mại điện tử với hơn 10 nghìn người dùng.",
        "Khi gặp sự cố khó hoặc áp lực deadline, tôi phân tích nguyên nhân gốc rễ, chia nhỏ khối lượng công việc, chủ động phối hợp với đồng đội và cập nhật tiến độ liên tục để đảm bảo chất lượng cao nhất.",
        "Mục tiêu của tôi là trở thành kỹ sư nòng cốt trong 2 năm tới, làm chủ các kiến trúc hệ thống hiện đại và đóng góp trực tiếp vào sự thành công của sản phẩm công ty."
    ]

    next_q_path = f"/api/v1/interview/compat/{session.room_name}/next-question"
    append_tx_path = f"/api/v1/interview/compat/{session.room_name}/append-transcription"

    for i, expected_q in enumerate(mock_questions):
        print(f"\n   --- Vòng phỏng vấn {i+1}/{len(mock_questions)} ---")
        # Query question
        res_q = signed_api_call("POST", next_q_path, {"advance": True})
        assert res_q.status_code == 200, f"Lấy câu hỏi {i+1} thất bại"
        q_payload = res_q.json()
        assert not q_payload.get("done"), f"Câu hỏi {i+1} không được báo done"
        question_obj = q_payload.get("question")
        print(f"   AI hỏi: \"{question_obj.get('text')}\"")
        
        # Append AI speech transcript
        res_tx_ai = signed_api_call("POST", append_tx_path, {
            "speaker_role": "ai_agent",
            "content": question_obj.get("text"),
            "speech_duration_ms": 3200
        })
        assert res_tx_ai.status_code in (200, 201), f"Lưu transcript AI thất bại: {res_tx_ai.status_code} {res_tx_ai.text}"

        # Candidate answers
        answer_text = mock_answers[i]
        print(f"   Ứng viên ảo trả lời: \"{answer_text}\"")
        res_tx_cand = signed_api_call("POST", append_tx_path, {
            "speaker_role": "candidate",
            "content": answer_text,
            "speech_duration_ms": 9500
        })
        assert res_tx_cand.status_code in (200, 201), f"Lưu transcript ứng viên thất bại: {res_tx_cand.status_code} {res_tx_cand.text}"

    # 7. Verify All Questions Completed
    res_final_q = signed_api_call("POST", next_q_path, {"advance": True})
    assert res_final_q.status_code == 200
    final_payload = res_final_q.json()
    assert final_payload.get("done") is True, f"Sau khi hoàn tất, next-question phải trả về done: true nhưng nhận {final_payload}"
    print(f"\n[7] Đã hoàn thành toàn bộ câu hỏi. Phản hồi done: {final_payload.get('done')}")

    # 8. Complete & Close Session
    time.sleep(1.5)
    res_complete = signed_api_call("PATCH", status_path, {"status": "completed"})
    assert res_complete.status_code == 200, f"Kết thúc phiên thất bại: {res_complete.status_code}"
    
    session = reload_session(session)
    print(f"[8] Đã gọi kết thúc phiên. Trạng thái DB: {session.status}, Kết thúc lúc: {session.end_time}, Thời lượng: {session.duration} giây")
    assert session.end_time is not None, "end_time phải được lưu khi hoàn tất"
    assert session.duration is not None and session.duration >= 1, f"Thời lượng phải >= 1 giây, thực tế: {session.duration}"
    
    # 9. Verify / Run AI Evaluation
    print("[9] Thực thi đánh giá AI toàn diện từ nội dung hội thoại...")
    eval_result = evaluate_interview_session(session.id)
    session = reload_session(session)
    print(f"    Kết quả đánh giá: session.status={session.status}")
    print(f"    Điểm tổng quan AI: {session.ai_overall_score}/10")
    print(f"    Điểm chuyên môn: {session.ai_technical_score}/10 — Điểm giao tiếp: {session.ai_communication_score}/10")
    print(f"    Tóm tắt đánh giá: {session.ai_summary}")
    print(f"    Điểm mạnh: {session.ai_strengths}")
    print(f"    Điểm cần cải thiện: {session.ai_weaknesses}")
    
    assert session.status == "completed", "Trạng thái cuối cùng phải là completed"
    assert session.ai_overall_score is not None, "ai_overall_score phải được tạo ra"
    assert session.transcripts.count() == 6, f"Tổng transcript phải là 6, thực tế: {session.transcripts.count()}"

    print(">>> TEST CASE 1 HOÀN TẤT THÀNH CÔNG! PHIÊN PHỎNG VẤN THỬ ĐÃ ĐÓNG HOÀN TOÀN VÀ ĐẠT CHUẨN.")
    return session


def run_official_interview_test():
    print("\n" + "="*80)
    print(">>> TEST CASE 2: PHỎNG VẤN THẬT VỚI DOANH NGHIỆP SQUARE")
    print("="*80)

    # 1. Company Square
    square_company = Company.objects.filter(company_name__icontains="Square").first()
    assert square_company is not None, "Không tìm thấy công ty Square trong hệ thống"
    print(f"[1] Doanh nghiệp tuyển dụng: {square_company.company_name} — ID: {square_company.id}")

    # 2. Job Post of Square
    job_post = JobPost.objects.filter(company=square_company).first()
    if not job_post:
        job_post = JobPost.objects.first()
        job_post.company = square_company
        job_post.save()
    print(f"[2] Vị trí tuyển dụng chính thức: {job_post.job_name} — ID: {job_post.id}")

    # 3. Virtual Candidate for Official Job
    candidate_email = "virtual_candidate_square_e2e@square.vn"
    candidate_user, created = User.objects.get_or_create(
        email=candidate_email,
        defaults={
            "full_name": "Ứng viên ảo Nguyễn Hoàng Nam",
            "role_name": var_sys.JOB_SEEKER,
            "is_active": True,
        }
    )
    if not created and not candidate_user.full_name:
        candidate_user.full_name = "Ứng viên ảo Nguyễn Hoàng Nam"
        candidate_user.save()
    print(f"[3] Ứng viên ảo nộp hồ sơ: {candidate_user.full_name} — email: {candidate_user.email}")

    # 4. JobPostActivity Pipeline & Resume
    from apps.profiles.models import Resume, JobSeekerProfile
    from apps.common.models import File
    from django.utils import timezone
    jsp, _ = JobSeekerProfile.objects.get_or_create(user=candidate_user)
    candidate_resume = Resume.objects.filter(user=candidate_user).first()
    if not candidate_resume:
        existing_file = File.objects.filter(file_type='CV', format='pdf').first()
        f_entry = None
        if existing_file:
            f_entry = File.objects.create(
                public_id=existing_file.public_id,
                version=existing_file.version,
                format=existing_file.format,
                resource_type=existing_file.resource_type,
                file_type=existing_file.file_type,
                metadata=existing_file.metadata,
                uploaded_at=timezone.now(),
            )
        candidate_resume = Resume.objects.create(
            user=candidate_user,
            job_seeker_profile=jsp,
            title="Kỹ sư Giám sát công trình",
            description="Kỹ sư Giám sát công trình xây dựng và nội thất với 4 năm kinh nghiệm thực tế.",
            skills_summary="Giám sát thi công, quản lý nhà thầu phụ, tiến độ Gantt, an toàn lao động, kiểm soát chất lượng QA/QC",
            file=f_entry,
            is_active=True,
        )

    activity, act_created = JobPostActivity.objects.get_or_create(
        user=candidate_user,
        job_post=job_post,
        defaults={
            "status": ApplicationStatus.PENDING_CONFIRMATION,
            "full_name": candidate_user.full_name,
            "email": candidate_user.email,
            "resume": candidate_resume,
        }
    )
    activity.status = ApplicationStatus.PENDING_CONFIRMATION
    if not activity.resume and candidate_resume:
        activity.resume = candidate_resume
    activity.save()
    print(f"[4] Hồ sơ ứng tuyển ban đầu: Trạng thái pipeline={activity.status}")

    # 5. Prepare Official Technical & Situational Questions for Square
    square_questions_data = [
        "Hãy mô tả kinh nghiệm của bạn trong việc quản lý và điều phối các nhà thầu phụ tại công trường để đảm bảo đúng tiến độ cam kết.",
        "Khi phát hiện sai lệch giữa bản vẽ thiết kế thi công và điều kiện thực địa, quy trình báo cáo và xử lý kỹ thuật của bạn như thế nào?",
        "Bạn sử dụng phương pháp nào để kiểm soát an toàn lao động, vệ sinh môi trường và giảm thiểu hao hụt vật tư trong suốt dự án?",
        "Nếu chủ đầu tư yêu cầu bàn giao công trình sớm hơn 2 tuần so với kế hoạch ban đầu, bạn sẽ lập kế hoạch tăng tốc ra sao?"
    ]
    square_questions = []
    for idx, q_text in enumerate(square_questions_data):
        q, _ = Question.objects.get_or_create(
            text=q_text,
            defaults={
                "category": "technical" if idx < 2 else ("behavioral" if idx == 2 else "situational"),
                "difficulty": 2,
                "default_duration_seconds": 120,
                "company": square_company,
            }
        )
        square_questions.append(q)
    print(f"[5] Bộ câu hỏi phỏng vấn Square chuyên sâu: {len(square_questions)} câu hỏi")

    # 6. Create Official Interview Session
    hr_user = square_company.user or User.objects.filter(role_name=var_sys.EMPLOYER).first()
    session = InterviewSession.objects.create(
        candidate=candidate_user,
        job_post=job_post,
        created_by=hr_user,
        session_type=InterviewSession.SESSION_TYPE_OFFICIAL,
        type="mixed",
        status="scheduled",
        time_limit_per_question=120,
        session_metadata={
            "interviewer_name": f"Hội đồng Phỏng vấn AI — {square_company.company_name}",
            "avatar_backdrop": "modern_office"
        }
    )
    session.questions.set(square_questions)
    print(f"[6] Khởi tạo phiên phỏng vấn thật: ID={session.id}, Room={session.room_name}, Token={session.invite_token}")
    try:
        LiveKitService.ensure_room_with_agent(session.room_name)
    except Exception as e:
        logger.warning("Could not pre-ensure room with agent: %s", e)

    # 7. Check Context
    context_path = f"/api/v1/interview/compat/{session.room_name}/context"
    res_ctx = signed_api_call("GET", context_path)
    assert res_ctx.status_code == 200, f"Context API lỗi: {res_ctx.status_code}"
    ctx_data = res_ctx.json()
    assert ctx_data.get("jobTitle") == job_post.job_name, "Tiêu đề job trong context phải khớp"
    print(f"[7] Bối cảnh phỏng vấn doanh nghiệp hợp lệ: Vị trí={ctx_data.get('jobTitle')}, Câu hỏi={ctx_data.get('questionCount')}")

    # 8. Start Session: in_progress
    status_path = f"/api/v1/interview/compat/{session.room_name}/status"
    session = reload_session(session)
    if session.status != "in_progress":
        res_start = signed_api_call("PATCH", status_path, {"status": "in_progress"})
        assert res_start.status_code == 200, f"Bắt đầu phiên thật thất bại: {res_start.status_code} {res_start.text}"
        session = reload_session(session)
    assert session.status == "in_progress"
    assert session.start_time is not None
    print(f"[8] Phiên phỏng vấn thật chính thức bắt đầu: Thời gian={session.start_time}")

    # 9. Step-by-step Technical Q&A
    square_answers = [
        "Tôi áp dụng bảng tiến độ Gantt chi tiết hàng tuần và tổ chức họp giao ban đầu giờ sáng với các tổ đội thợ và nhà thầu phụ, qua đó rà soát từng mốc việc găng và giải quyết vướng mắc ngay trong ngày.",
        "Tôi sẽ tiến hành lập biên bản ghi nhận hiện trạng có chữ ký của giám sát hiện trường, phát hành phiếu yêu cầu thông tin RFI gửi bộ phận thiết kế để thống nhất phương án xử lý bằng bản vẽ điều chỉnh trước khi triển khai tiếp.",
        "Tôi duy trì kiểm tra an toàn theo checklist nghiêm ngặt, bắt buộc trang bị bảo hộ lao động 100%, đồng thời quản lý xuất nhập kho vật tư bằng định mức dự toán kết hợp phần mềm theo dõi hao hụt thời gian thực.",
        "Tôi sẽ rà soát đường găng tiến độ, ưu tiên tăng ca các hạng mục hoàn thiện không phụ thuộc điều kiện thời tiết, bổ sung nhân lực mũi thi công then chốt và đàm phán cung ứng vật tư nhanh nhất để kịp mốc bàn giao."
    ]

    next_q_path = f"/api/v1/interview/compat/{session.room_name}/next-question"
    append_tx_path = f"/api/v1/interview/compat/{session.room_name}/append-transcription"

    for i, expected_q in enumerate(square_questions):
        print(f"\n   --- Câu hỏi phỏng vấn thật {i+1}/{len(square_questions)} ---")
        res_q = signed_api_call("POST", next_q_path, {"advance": True})
        assert res_q.status_code == 200
        q_payload = res_q.json()
        assert not q_payload.get("done")
        question_obj = q_payload.get("question")
        print(f"   Nhà tuyển dụng AI hỏi: \"{question_obj.get('text')}\"")

        # AI Transcript
        res_t1 = signed_api_call("POST", append_tx_path, {
            "speaker_role": "ai_agent",
            "content": question_obj.get("text"),
            "speech_duration_ms": 3800
        })
        assert res_t1.status_code in (200, 201), f"Lưu transcript AI thật thất bại: {res_t1.status_code} {res_t1.text}"

        # Candidate Transcript
        ans = square_answers[i]
        print(f"   Ứng viên Square trả lời: \"{ans}\"")
        res_t2 = signed_api_call("POST", append_tx_path, {
            "speaker_role": "candidate",
            "content": ans,
            "speech_duration_ms": 11200
        })
        assert res_t2.status_code in (200, 201), f"Lưu transcript ứng viên thật thất bại: {res_t2.status_code} {res_t2.text}"

    # 10. Check Terminal Condition
    res_final_q = signed_api_call("POST", next_q_path, {"advance": True})
    assert res_final_q.status_code == 200
    assert res_final_q.json().get("done") is True
    print("\n[10] Ứng viên hoàn thành toàn bộ câu hỏi phỏng vấn chuyên môn.")

    # 11. End Session & Status Pipeline Update
    time.sleep(1.5)
    res_end = signed_api_call("PATCH", status_path, {"status": "completed"})
    assert res_end.status_code == 200
    session = reload_session(session)
    print(f"[11] Phiên phỏng vấn thật đã kết thúc: End time={session.end_time}, Duration={session.duration} giây")
    assert session.end_time is not None
    assert session.duration >= 1

    # Check JobActivity Pipeline update
    from apps.jobs.services import JobActivityService
    JobActivityService.advance_application_to_interviewed(activity)
    activity.refresh_from_db()
    print(f"[12] Cập nhật tiến trình tuyển dụng doanh nghiệp: Pipeline status={activity.status}")
    assert activity.status == ApplicationStatus.INTERVIEWED, f"Pipeline phải chuyển sang INTERVIEWED, thực tế: {activity.status}"

    # 13. Run AI Evaluation for Employer
    print("[13] Đánh giá năng lực ứng viên từ trí tuệ nhân tạo...")
    eval_result = evaluate_interview_session(session.id)
    session = reload_session(session)
    print(f"    Trạng thái phiên: {session.status}")
    print(f"    Điểm tổng thể: {session.ai_overall_score}/10")
    print(f"    Điểm năng lực kỹ thuật: {session.ai_technical_score}/10")
    print(f"    Điểm năng lực giao tiếp: {session.ai_communication_score}/10")
    print(f"    Tóm tắt báo cáo tuyển dụng: {session.ai_summary}")
    print(f"    Điểm mạnh nổi bật: {session.ai_strengths}")
    print(f"    Điểm cần lưu ý: {session.ai_weaknesses}")

    assert session.status == "completed"
    assert session.ai_overall_score is not None
    assert session.transcripts.count() == 8, f"Tổng transcript phải là 8, thực tế: {session.transcripts.count()}"

    print(">>> TEST CASE 2 HOÀN TẤT THÀNH CÔNG! PHỎNG VẤN THẬT VỚI SQUARE ĐÃ ĐÓNG PHIÊN VÀ CẬP NHẬT ĐẦY ĐỦ.")
    return session


def main():
    print("================================================================================")
    print("STARTING FULL QA AUTOMATION: INTERVIEW FLOW TEST SUITE")
    print("Testing Mock Practice Interview & Official Square Employer Interview")
    print("================================================================================")
    
    mock_session = run_mock_interview_test()
    official_session = run_official_interview_test()
    
    print("\n" + "="*80)
    print("TẤT CẢ TEST CASES ĐÃ VƯỢT QUA VỚI BẰNG CHỨNG XÁC THỰC RÕ RÀNG:")
    print(f"1. Phiên phỏng vấn thử: ID={mock_session.id}, Trạng thái={mock_session.status}, Điểm={mock_session.ai_overall_score}, Thời lượng={mock_session.duration}s, Token={mock_session.invite_token}")
    print(f"2. Phiên phỏng vấn thật: ID={official_session.id}, Trạng thái={official_session.status}, Điểm={official_session.ai_overall_score}, Thời lượng={official_session.duration}s, Token={official_session.invite_token}")
    print("================================================================================")

if __name__ == "__main__":
    main()
