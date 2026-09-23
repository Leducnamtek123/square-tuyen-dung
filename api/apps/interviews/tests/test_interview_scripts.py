# -*- coding: utf-8 -*-
"""
Unit & Integration Tests for InterviewScript (Kịch bản phỏng vấn AI)
"""

from decimal import Decimal
from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User
from apps.profiles.models import Company, CompanyMember, CompanyRole
from apps.interviews.models import InterviewScript, InterviewSession, Question, QuestionGroup
from apps.interviews.serializers import (
    InterviewScriptSerializer,
    InterviewSessionDetailSerializer,
    InterviewSessionListSerializer,
)
from apps.interviews.services import (
    build_interview_context,
    get_session_questions,
)
from shared.configs import variable_system as var_sys


class BaseInterviewScriptTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        try:
            from django_elasticsearch_dsl.registries import registry
            cls._orig_update = getattr(registry, 'update', None)
            cls._orig_delete = getattr(registry, 'delete', None)
            registry.update = lambda *a, **kw: None
            registry.delete = lambda *a, **kw: None
        except ImportError:
            pass

    @classmethod
    def tearDownClass(cls):
        try:
            from django_elasticsearch_dsl.registries import registry
            if hasattr(cls, '_orig_update') and cls._orig_update:
                registry.update = cls._orig_update
            if hasattr(cls, '_orig_delete') and cls._orig_delete:
                registry.delete = cls._orig_delete
        except ImportError:
            pass
        super().tearDownClass()


class InterviewScriptModelAndSerializerTests(BaseInterviewScriptTestCase):
    def setUp(self):
        self.user = User.objects.create_user_with_role_name(
            email="test-author@example.com",
            full_name="Script Author",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.company = Company.objects.create(
            company_name="Tech Corp",
            company_email="contact@techcorp.vn",
            company_phone="0988000111",
            tax_code="TC00111",
            user=self.user,
        )
        self.question = Question.objects.create(
            title="Giải thuật tối ưu cache",
            text="Trình bày giải thuật LRU cache?",
            category="technical",
            difficulty=2,
            company=self.company,
        )

    def test_model_defaults_and_slug_generation(self):
        script = InterviewScript.objects.create(
            name="Kịch bản Fresher Backend",
            description="Đánh giá tư duy fresher",
            company=self.company,
            author=self.user,
        )
        self.assertEqual(script.scenario_type, "technical")
        self.assertEqual(script.hr_persona, "professional")
        self.assertEqual(script.time_limit_per_question, 120)
        self.assertTrue(script.allow_ai_followup)
        self.assertEqual(script.max_followup_questions, 2)
        self.assertEqual(script.character_id, "ng_c_linh")
        self.assertEqual(script.voice_name, "Trúc Ly")
        self.assertEqual(script.voice_speed, Decimal("1.00"))
        self.assertFalse(script.is_system_preset)
        self.assertTrue(script.is_active)
        self.assertTrue(len(script.slug) > 0)
        self.assertIn("kich-ban-fresher-backend", script.slug)

    def test_serializer_computed_fields(self):
        script = InterviewScript.objects.create(
            name="Kịch bản Kỹ thuật Chuyên sâu",
            scenario_type="technical",
            hr_persona="challenger",
            company=self.company,
            author=self.user,
        )
        script.questions.add(self.question)

        serializer = InterviewScriptSerializer(script)
        data = serializer.data

        self.assertEqual(data["id"], script.id)
        self.assertEqual(data["name"], script.name)
        self.assertEqual(data["scenario_type_display"], "Kỹ thuật chuyên môn")
        self.assertEqual(data["hr_persona_display"], "Thử thách & Đào sâu kỹ thuật")
        self.assertEqual(data["questions_count"], 1)
        self.assertEqual(len(data["questions_detail"]), 1)
        self.assertEqual(data["questions_detail"][0]["id"], self.question.id)
        self.assertEqual(data["company_name"], "Tech Corp")
        self.assertEqual(data["author_name"], "Script Author")

    def test_session_detail_and_list_serializer_includes_script(self):
        candidate = User.objects.create_user_with_role_name(
            email="candidate@example.com",
            full_name="Nguyễn Văn Ứng Viên",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
        )
        script = InterviewScript.objects.create(
            name="Kịch bản Phỏng vấn AI v1",
            company=self.company,
            author=self.user,
        )
        session = InterviewSession.objects.create(
            candidate=candidate,
            interview_script=script,
            room_name="room-test-script-1",
        )

        detail_data = InterviewSessionDetailSerializer(session).data
        self.assertEqual(detail_data["interview_script"], script.id)
        self.assertEqual(detail_data["interview_script_name"], script.name)
        self.assertIsNotNone(detail_data["interview_script_detail"])
        self.assertEqual(detail_data["interview_script_detail"]["id"], script.id)

        list_data = InterviewSessionListSerializer(session).data
        self.assertEqual(list_data["interview_script"], script.id)
        self.assertEqual(list_data["interview_script_name"], script.name)

    def test_serializer_question_ids_write_capability(self):
        q2 = Question.objects.create(
            title="Câu hỏi thứ hai",
            text="Trình bày kiến trúc Microservices?",
            category="technical",
            difficulty=3,
            company=self.company,
        )
        group = QuestionGroup.objects.create(
            name="Bộ câu hỏi Backend",
            company=self.company,
        )

        create_data = {
            "name": "Kịch bản tạo mới qua question_ids",
            "scenario_type": "technical",
            "hr_persona": "professional",
            "question_group": group.id,
            "question_ids": [self.question.id, q2.id],
        }
        serializer = InterviewScriptSerializer(data=create_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        script = serializer.save(author=self.user, company=self.company)

        # Verify assigned questions
        assigned_ids = list(script.questions.values_list("id", flat=True))
        self.assertEqual(set(assigned_ids), {self.question.id, q2.id})

        # Verify serializer exposes required fields
        out_data = serializer.data
        self.assertEqual(out_data["question_group"], group.id)
        self.assertEqual(out_data["question_group_name"], "Bộ câu hỏi Backend")
        self.assertIn("questions", out_data)
        self.assertIn("questions_detail", out_data)
        self.assertIn("question_details", out_data)
        self.assertEqual(len(out_data["questions_detail"]), 2)
        self.assertEqual(len(out_data["question_details"]), 2)
        self.assertEqual(out_data["questions_count"], 2)

        # Verify update with question_ids
        update_data = {
            "question_ids": [q2.id],
        }
        update_serializer = InterviewScriptSerializer(script, data=update_data, partial=True)
        self.assertTrue(update_serializer.is_valid(), update_serializer.errors)
        updated_script = update_serializer.save()
        self.assertEqual(list(updated_script.questions.values_list("id", flat=True)), [q2.id])
        self.assertEqual(update_serializer.data["questions_count"], 1)


class InterviewScriptViewSetTests(BaseInterviewScriptTestCase):
    def setUp(self):
        self.client = APIClient()

        # Company A & Recruiter A
        self.owner_a = User.objects.create_user_with_role_name(
            email="recruiter-a@company-a.vn",
            full_name="Recruiter A",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.company_a = Company.objects.create(
            company_name="Công ty A",
            company_email="contact@comp-a.vn",
            company_phone="0911000111",
            tax_code="TAX0001",
            user=self.owner_a,
        )

        # Company B & Recruiter B
        self.owner_b = User.objects.create_user_with_role_name(
            email="recruiter-b@company-b.vn",
            full_name="Recruiter B",
            role_name=var_sys.EMPLOYER,
            password="password123",
            is_active=True,
            has_company=True,
        )
        self.company_b = Company.objects.create(
            company_name="Công ty B",
            company_email="contact@comp-b.vn",
            company_phone="0911000222",
            tax_code="TAX0002",
            user=self.owner_b,
        )

        # Admin
        self.admin_user = User.objects.create_user_with_role_name(
            email="admin@infohr.vn",
            full_name="Hệ thống Admin",
            role_name=var_sys.ADMIN,
            password="password123",
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )

        # 1 Preset Script
        self.preset_script = InterviewScript.objects.create(
            name="Mẫu chuẩn Kỹ thuật InfoHR",
            scenario_type="technical",
            hr_persona="challenger",
            is_system_preset=True,
            is_active=True,
            company=None,
            author=None,
        )

        # 1 Script of Company A
        self.script_a = InterviewScript.objects.create(
            name="Kịch bản nội bộ Công ty A",
            scenario_type="behavioral",
            hr_persona="professional",
            is_system_preset=False,
            is_active=True,
            company=self.company_a,
            author=self.owner_a,
        )

        # 1 Script of Company B
        self.script_b = InterviewScript.objects.create(
            name="Kịch bản nội bộ Công ty B",
            scenario_type="sales",
            hr_persona="friendly",
            is_system_preset=False,
            is_active=True,
            company=self.company_b,
            author=self.owner_b,
        )

    def test_recruiter_can_only_see_presets_and_own_company_scripts(self):
        self.client.force_authenticate(user=self.owner_a)
        response = self.client.get("/api/v1/interview/web/scripts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        ids = [item["id"] for item in results]

        self.assertIn(self.preset_script.id, ids)
        self.assertIn(self.script_a.id, ids)
        self.assertNotIn(self.script_b.id, ids)

    def test_admin_can_see_all_scripts(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/interview/web/scripts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        ids = [item["id"] for item in results]

        self.assertIn(self.preset_script.id, ids)
        self.assertIn(self.script_a.id, ids)
        self.assertIn(self.script_b.id, ids)

    def test_recruiter_creates_script_belongs_to_own_company(self):
        self.client.force_authenticate(user=self.owner_a)
        payload = {
            "name": "Kịch bản Tuyển dụng Mobile Dev",
            "scenario_type": "technical",
            "hr_persona": "professional",
            "description": "Dành cho Flutter & iOS",
            "time_limit_per_question": 100,
            "allow_ai_followup": True,
            "max_followup_questions": 2,
        }
        response = self.client.post("/api/v1/interview/web/scripts/", data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_id = response.data["id"]
        script = InterviewScript.objects.get(id=created_id)
        self.assertEqual(script.company, self.company_a)
        self.assertEqual(script.author, self.owner_a)
        self.assertFalse(script.is_system_preset)

    def test_recruiter_cannot_edit_or_delete_system_preset(self):
        self.client.force_authenticate(user=self.owner_a)

        # Attempt to edit system preset
        update_resp = self.client.patch(
            f"/api/v1/interview/web/scripts/{self.preset_script.id}/",
            data={"name": "Hacked Name"},
            format="json",
        )
        self.assertEqual(update_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to delete system preset
        delete_resp = self.client.delete(f"/api/v1/interview/web/scripts/{self.preset_script.id}/")
        self.assertEqual(delete_resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_recruiter_cannot_edit_other_company_script(self):
        self.client.force_authenticate(user=self.owner_a)
        resp = self.client.patch(
            f"/api/v1/interview/web/scripts/{self.script_b.id}/",
            data={"name": "Attacking script B"},
            format="json",
        )
        # Should be 404 (not in queryset) or 403
        self.assertIn(resp.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

    def test_clone_preset_script_to_company(self):
        self.client.force_authenticate(user=self.owner_a)

        q = Question.objects.create(text="Câu hỏi trong preset", category="technical")
        self.preset_script.questions.add(q)
        self.preset_script.evaluation_rubric = {"pass_score": 80}
        self.preset_script.save(update_fields=["evaluation_rubric"])

        url = f"/api/v1/interview/web/scripts/{self.preset_script.id}/clone/"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        resp_data = response.data.get("data", response.data)
        cloned_id = resp_data["id"]
        cloned = InterviewScript.objects.get(id=cloned_id)

        self.assertEqual(cloned.name, f"Bản sao - {self.preset_script.name}")
        self.assertEqual(cloned.company, self.company_a)
        self.assertEqual(cloned.author, self.owner_a)
        self.assertFalse(cloned.is_system_preset)
        self.assertEqual(cloned.evaluation_rubric, {"pass_score": 80})
        self.assertEqual(list(cloned.questions.values_list("id", flat=True)), [q.id])

    def test_filter_tab_and_choices_gracefully(self):
        self.client.force_authenticate(user=self.owner_a)
        # Verify query with all-filters returns 200 without validation errors
        resp = self.client.get("/api/v1/interview/web/scripts/?tab=all&scenario_type=all&hr_persona=all")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Verify filtering by tab=company returns only company scripts
        resp_co = self.client.get("/api/v1/interview/web/scripts/?tab=company")
        self.assertEqual(resp_co.status_code, status.HTTP_200_OK)
        results = resp_co.data.get("results", resp_co.data)
        ids = [item["id"] for item in results]
        self.assertIn(self.script_a.id, ids)
        self.assertNotIn(self.preset_script.id, ids)

        # Verify filtering by tab=system returns only presets
        resp_sys = self.client.get("/api/v1/interview/web/scripts/?tab=system")
        self.assertEqual(resp_sys.status_code, status.HTTP_200_OK)
        results_sys = resp_sys.data.get("results", resp_sys.data)
        ids_sys = [item["id"] for item in results_sys]
        self.assertIn(self.preset_script.id, ids_sys)
        self.assertNotIn(self.script_a.id, ids_sys)



class InterviewContextAndSeedCommandTests(BaseInterviewScriptTestCase):
    def setUp(self):
        self.candidate = User.objects.create_user_with_role_name(
            email="candidate-context@example.com",
            full_name="Trần Thị Ứng Viên",
            role_name=var_sys.JOB_SEEKER,
            password="password123",
        )
        self.script = InterviewScript.objects.create(
            name="Kịch bản Chuyên môn Test",
            scenario_type="technical",
            hr_persona="challenger",
            system_prompt="Chỉ dẫn chuyên sâu phỏng vấn kỹ thuật {job_title}",
            greeting_message="Chào mừng bạn đến với phiên phỏng vấn!",
            closing_message="Cảm ơn bạn đã tham gia phỏng vấn!",
            time_limit_per_question=140,
            allow_ai_followup=True,
            max_followup_questions=2,
            character_id="minh_tri",
            voice_name="Mạnh Dũng",
            voice_speed=Decimal("1.05"),
        )
        self.q1 = Question.objects.create(text="Câu hỏi 1", category="technical", difficulty=2)
        self.script.questions.add(self.q1)

    def test_build_interview_context_with_interview_script(self):
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            interview_script=self.script,
            room_name="room-context-script-test",
        )

        context = build_interview_context(session)

        # Check required fields in context
        self.assertEqual(context["script_id"], self.script.id)
        self.assertEqual(context["script_name"], self.script.name)
        self.assertEqual(context["scenario_type"], "technical")
        self.assertEqual(context["hr_persona"], "challenger")
        self.assertEqual(context["system_prompt"], self.script.system_prompt)
        self.assertEqual(context["greeting_message"], self.script.greeting_message)
        self.assertEqual(context["closing_message"], self.script.closing_message)
        self.assertEqual(context["time_limit_per_question"], 140)
        self.assertTrue(context["allow_ai_followup"])
        self.assertEqual(context["max_followup_questions"], 2)

        # Check questions derived from script
        questions = get_session_questions(session)
        self.assertEqual(list(questions), [self.q1])
        self.assertEqual(len(context["questions"]), 1)

    def test_build_interview_context_falls_back_to_company_ai_settings(self):
        employer = User.objects.create_user_with_role_name(
            email="employer-ai-test@example.com",
            full_name="AI Settings Employer",
            role_name=var_sys.EMPLOYER,
            password="password123",
            has_company=True,
        )
        company = Company.objects.create(
            company_name="AI Future Tech",
            company_email="ai@futuretech.vn",
            tax_code="TAXAI888",
            user=employer,
            ai_settings={
                "interviewer_name": "AI Trúc Linh",
                "tts_voice": "Thùy Dung",
                "tts_speed": 1.15,
                "custom_background_url": "https://cdn.infohr.vn/bg/future_studio.jpg",
                "selected_background_id": "future_studio",
            },
        )

        # 1. Session with script attached to company
        script_with_company = InterviewScript.objects.create(
            name="Kịch bản AI Future",
            company=company,
            author=employer,
        )
        session = InterviewSession.objects.create(
            candidate=self.candidate,
            interview_script=script_with_company,
            room_name="room-company-ai-settings-fallback",
        )

        context = build_interview_context(session)

        # Verify fallback to Company.ai_settings
        self.assertEqual(context["interviewerName"], "AI Trúc Linh")
        self.assertEqual(context["interviewer_name"], "AI Trúc Linh")
        self.assertEqual(context["ttsVoice"], "Thùy Dung")
        self.assertEqual(context["tts_voice"], "Thùy Dung")
        self.assertEqual(context["ttsSpeed"], 1.15)
        self.assertEqual(context["tts_speed"], 1.15)
        self.assertEqual(context["avatarBackgroundUrl"], "https://cdn.infohr.vn/bg/future_studio.jpg")
        self.assertEqual(context["avatar_background_url"], "https://cdn.infohr.vn/bg/future_studio.jpg")
        self.assertEqual(context["avatarBackdrop"], "future_studio")
        self.assertEqual(context["avatar_backdrop"], "future_studio")
        self.assertEqual(context["companyName"], "AI Future Tech")
        self.assertEqual(context["company_name"], "AI Future Tech")

        # Verify system prompt and follow-up flags in both camelCase and snake_case
        self.assertIn("system_prompt", context)
        self.assertIn("systemPrompt", context)
        self.assertIn("greeting_message", context)
        self.assertIn("greetingMessage", context)
        self.assertIn("closing_message", context)
        self.assertIn("closingMessage", context)
        self.assertIn("allow_ai_followup", context)
        self.assertIn("allowAiFollowup", context)
        self.assertIn("max_followup_questions", context)
        self.assertIn("maxFollowupQuestions", context)

        # 2. Verify explicit session_metadata overrides company fallback
        session_override = InterviewSession.objects.create(
            candidate=self.candidate,
            interview_script=script_with_company,
            room_name="room-company-ai-settings-override",
            session_metadata={
                "interviewer_name": "Override Interviewer",
                "tts_voice": "Quang Sơn",
                "ai_speed": 0.85,
                "avatar_backdrop": "modern_office",
                "avatar_background_url": "https://cdn.infohr.vn/bg/override.jpg",
            },
        )
        context_override = build_interview_context(session_override)
        self.assertEqual(context_override["interviewerName"], "Override Interviewer")
        self.assertEqual(context_override["ttsVoice"], "Quang Sơn")
        self.assertEqual(context_override["ttsSpeed"], 0.85)
        self.assertEqual(context_override["avatarBackdrop"], "modern_office")
        self.assertEqual(context_override["avatarBackgroundUrl"], "https://cdn.infohr.vn/bg/override.jpg")

        # 3. Session without script (session.company set directly)
        session_no_script = InterviewSession.objects.create(
            candidate=self.candidate,
            room_name="room-company-ai-settings-no-script",
        )
        session_no_script.company = company
        context_no_script = build_interview_context(session_no_script)
        self.assertEqual(context_no_script["interviewerName"], "AI Trúc Linh")
        self.assertEqual(context_no_script["ttsVoice"], "Thùy Dung")
        self.assertEqual(context_no_script["ttsSpeed"], 1.15)
        self.assertEqual(context_no_script["allow_ai_followup"], True)
        self.assertEqual(context_no_script["allowAiFollowup"], True)
        self.assertEqual(context_no_script["max_followup_questions"], 2)
        self.assertEqual(context_no_script["maxFollowupQuestions"], 2)

    def test_seed_system_interview_scripts_command(self):
        call_command("seed_system_interview_scripts")

        preset_names = [
            "Kỹ thuật Chuyên môn (Technical Deep-dive)",
            "Hành vi & Văn hóa (STAR Behavioral)",
            "Kinh doanh B2B & CSKH (Sales & Customer Engagement)",
            "Tuyển dụng Fresher / Thực tập sinh (Fresher / Intern Potential)",
            "Lãnh đạo & Quản lý cấp trung (Leadership & Team Management)",
        ]

        for name in preset_names:
            script = InterviewScript.objects.filter(name=name, is_system_preset=True).first()
            self.assertIsNotNone(script, f"Thiếu kịch bản mẫu hệ thống: {name}")
            self.assertTrue(script.is_active)
            self.assertIsNone(script.company)
            self.assertIsNotNone(script.evaluation_rubric)
            self.assertGreater(script.questions.count(), 0)
