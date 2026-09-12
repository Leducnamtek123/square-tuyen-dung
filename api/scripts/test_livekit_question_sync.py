import os
import sys
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.interviews.models import InterviewSession, Question
from apps.interviews.serializers import InterviewSessionDetailSerializer
from apps.interviews.services import get_session_questions, build_interview_context
from scripts.test_e2e_interview_qa import signed_api_call

def run():
    print("\n" + "="*80)
    print("XAC MINH DONG BO CAU HOI GIUA FRONTEND, BACKEND VA AI AGENT")
    print("="*80)

    session = InterviewSession.objects.filter(id=245).first()
    if not session:
        session = InterviewSession.objects.last()

    print(f"Session: #{session.id} | Room: {session.room_name}")

    serializer_data = InterviewSessionDetailSerializer(session).data
    frontend_questions = serializer_data.get("questions", [])

    context_data = build_interview_context(session)
    ai_questions = context_data.get("questions", [])

    print(f"So luong cau hoi Frontend: {len(frontend_questions)} | AI: {len(ai_questions)}")
    assert len(frontend_questions) == len(ai_questions), "So luong cau hoi khong khop!"

    for i in range(len(frontend_questions)):
        fq = frontend_questions[i]
        aq = ai_questions[i]
        print(f"\nCau {i+1}:")
        print(f"   Frontend: ID={fq['id']} | Text=\"{fq['text'][:60]}...\"")
        print(f"   AI Agent: Text=\"{aq['text'][:60]}...\"")
        assert fq["text"] == aq["text"], f"Cau {i+1} khong khop noi dung!"

    print("\n>>> XAC NHAN: 100% CAU HOI KHOP NHAU TU NGUON!")

    next_q_url = f"/api/v1/interview/compat/{session.room_name}/next-question"
    
    res0 = signed_api_call("POST", next_q_url, {"advance": True, "target_index": 0})
    assert res0.status_code == 200
    p0 = res0.json()
    assert p0["index"] == 0 and p0["question"]["text"] == frontend_questions[0]["text"]
    print(f"-> Nhay toi index 0 thanh cong: \"{p0['question']['text'][:50]}...\"")

    res1 = signed_api_call("POST", next_q_url, {"advance": True, "target_index": 1})
    assert res1.status_code == 200
    p1 = res1.json()
    assert p1["index"] == 1 and p1["question"]["text"] == frontend_questions[1]["text"]
    print(f"-> Nhay toi index 1 thanh cong: \"{p1['question']['text'][:50]}...\"")

    res_done = signed_api_call("POST", next_q_url, {"advance": True, "target_index": len(frontend_questions)})
    assert res_done.status_code == 200
    p_done = res_done.json()
    assert p_done.get("done") is True
    print("-> Nhay qua so cau hoi tra ve done: True dung tieu chuan")

    print("\n" + "="*80)
    print("TAT CA KIEM TRA DONG BO DA THANH CONG!")
    print("="*80 + "\n")

if __name__ == "__main__":
    run()
