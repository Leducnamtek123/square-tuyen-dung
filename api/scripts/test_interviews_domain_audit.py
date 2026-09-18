import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import uuid
from decimal import Decimal
from django.test import RequestFactory
from rest_framework.request import Request
from apps.accounts.models import User
from apps.profiles.models import Company
from apps.interviews.models import (
    InterviewSession, InterviewTranscript, InterviewEvaluation,
    Question, QuestionGroup, VoiceProfile
)
from apps.interviews.services import (
    create_livekit_participant_token,
    create_hr_presence_livekit_token,
    create_observer_livekit_token,
    build_interview_context,
    get_session_questions,
)
from apps.interviews.serializers import (
    InterviewSessionCreateSerializer,
    InterviewSessionListSerializer,
    InterviewSessionDetailSerializer,
    InterviewEvaluationSerializer,
    QuestionGroupSerializer,
    VoiceProfileSerializer,
    InterviewContextSerializer,
)
from apps.interviews.serializers_enhancements import (
    MockSessionResponseSerializer,
)

def run_test():
    print("--- 1. Testing Unsaved Instances Serialization (pk is None) ---")
    unsaved_session = InterviewSession()
    list_ser = InterviewSessionListSerializer(unsaved_session)
    assert list_ser.data["questions_count"] == 0, f"Expected 0, got {list_ser.data['questions_count']}"
    assert list_ser.data["evaluations_count"] == 0, f"Expected 0, got {list_ser.data['evaluations_count']}"

    detail_ser = InterviewSessionDetailSerializer(unsaved_session)
    assert detail_ser.data["questions"] == [], f"Expected [], got {detail_ser.data['questions']}"
    assert detail_ser.data["transcripts"] == [], f"Expected [], got {detail_ser.data['transcripts']}"
    assert detail_ser.data["evaluations"] == [], f"Expected [], got {detail_ser.data['evaluations']}"
    assert detail_ser.data["questions_count"] == 0

    unsaved_group = QuestionGroup(name="Draft Group")
    group_ser = QuestionGroupSerializer(unsaved_group)
    assert group_ser.data["questions"] == []
    assert group_ser.data["questions_count"] == 0

    unsaved_voice = VoiceProfile(name="Draft Voice")
    voice_ser = VoiceProfileSerializer(unsaved_voice)
    assert voice_ser.data["samples"] == []
    assert voice_ser.data["sampleCount"] == 0
    assert voice_ser.data["grants"] == []
    assert voice_ser.data["grantCount"] == 0
    assert voice_ser.data["isReadyForTts"] is False

    mock_ser = MockSessionResponseSerializer(unsaved_session)
    assert mock_ser.data["questions"] == []

    assert list(get_session_questions(unsaved_session)) == []
    print("✓ Unsaved instances handled cleanly without M2M/Reverse relation crashes")

    print("--- 2. Testing User & InterviewSession Creation ---")
    suffix = uuid.uuid4().hex[:6]
    candidate = User.objects.create(
        email=f"candidate_{suffix}@test.com",
        role_name="JOB_SEEKER",
        full_name=""  # Candidate with empty full_name
    )
    employer = User.objects.create(
        email=f"employer_{suffix}@test.com",
        role_name="EMPLOYER",
        full_name="HR Manager Square"
    )
    company = Company.objects.first()
    if not company:
        company = Company.objects.create(company_name="Square Group", user=employer)
    employer._active_company_cache = company

    session = InterviewSession.objects.create(
        candidate=candidate,
        created_by=employer,
        status="scheduled",
        type="mixed",
        session_type="official",
    )
    print(f"✓ InterviewSession #{session.id} created: {session}")

    print("--- 3. Testing LiveKit Token Generation ---")
    rf = RequestFactory()

    req_candidate = Request(rf.get("/"))
    req_candidate.user = candidate
    cand_token_data = create_livekit_participant_token(session, req_candidate)
    assert "token" in cand_token_data and len(cand_token_data["token"]) > 20
    assert cand_token_data["participant_identity"] == f"candidate-{candidate.id}"
    print(f"✓ Candidate LiveKit token generated: {cand_token_data['participant_identity']}")

    req_hr = Request(rf.get("/"))
    req_hr.user = employer
    hr_token_data = create_hr_presence_livekit_token(session, req_hr)
    assert "token" in hr_token_data and len(hr_token_data["token"]) > 20
    assert hr_token_data["participant_identity"] == f"employer-{employer.id}"
    assert hr_token_data["company_name"] == company.company_name
    print(f"✓ HR presence LiveKit token generated: {hr_token_data['participant_identity']} (company: {hr_token_data['company_name']})")

    obs_token_data = create_observer_livekit_token(session, req_hr)
    assert "token" in obs_token_data and len(obs_token_data["token"]) > 20
    print(f"✓ Observer LiveKit token generated: {obs_token_data['participant_identity']}")

    context_data = build_interview_context(session)
    context_ser = InterviewContextSerializer(data=context_data)
    assert context_ser.is_valid(), f"Context serializer errors: {context_ser.errors}"
    print("✓ InterviewContextSerializer validated successfully")

    print("--- 4. Testing Evaluation Submission and Serialization ---")
    eval_payload = {
        "interview": session.id,
        "attitude_score": "8.50",
        "professional_score": "9.50",
        "result": "passed",
        "comments": "Ứng viên có kỹ năng tốt, thái độ tích cực.",
        "proposed_salary": 25000000,
    }
    eval_serializer = InterviewEvaluationSerializer(data=eval_payload)
    assert eval_serializer.is_valid(), f"Evaluation errors: {eval_serializer.errors}"
    evaluation = eval_serializer.save(evaluator=employer)
    assert evaluation.overall_score == Decimal("9.00")
    print(f"✓ Evaluation #{evaluation.id} saved with auto-calculated overall_score: {evaluation.overall_score}")

    session.refresh_from_db()
    session_detail_data = InterviewSessionDetailSerializer(session).data
    assert len(session_detail_data["evaluations"]) == 1
    assert session_detail_data["evaluations"][0]["evaluator_name"] == "HR Manager Square"
    assert session_detail_data["evaluations"][0]["overall_score"] == "9.00"
    print("✓ InterviewSessionDetailSerializer verified with nested evaluations and evaluator_name")

    employer_no_name = User.objects.create(
        email=f"hr_noname_{suffix}@test.com",
        role_name="EMPLOYER",
        full_name=""
    )
    eval2 = InterviewEvaluation.objects.create(
        interview=session,
        evaluator=employer_no_name,
        attitude_score=7,
        professional_score=7,
        overall_score=7,
        result="passed",
    )
    eval2_data = InterviewEvaluationSerializer(eval2).data
    assert eval2_data["evaluator_name"] == employer_no_name.email
    print(f"✓ Evaluator without full_name serialized fallback cleanly: {eval2_data['evaluator_name']}")

    print("--- 5. Verifying All Serializer Meta.fields against declared fields ---")
    all_serializers = [
        QuestionGroupSerializer,
        VoiceProfileSerializer,
        InterviewEvaluationSerializer,
        InterviewSessionListSerializer,
        InterviewSessionDetailSerializer,
        InterviewSessionCreateSerializer,
        MockSessionResponseSerializer,
    ]
    for ser_cls in all_serializers:
        meta_fields = getattr(ser_cls.Meta, "fields", None)
        if meta_fields != "__all__":
            declared = [name for name, field in ser_cls._declared_fields.items()]
            for d in declared:
                assert d in meta_fields, f"Field {d} declared in {ser_cls.__name__} but not in Meta.fields!"
    print("✓ All declared serializer fields are present in Meta.fields")
    print("\nALL AUDIT AND LIVE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
