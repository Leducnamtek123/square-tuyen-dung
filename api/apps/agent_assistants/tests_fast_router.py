from __future__ import annotations

import time
from unittest.mock import MagicMock, patch

import pytest
from django.test import SimpleTestCase, TestCase

from apps.agent_assistants.models import AgentThread
from apps.agent_assistants.planner import AgentPlannedAction, AgentPlanner, AgentPlannerUnavailable
from apps.common.decision_engine import (
    AgentRouterEngine,
    CvTriageEngine,
    RouteVerdict,
    TriageVerdict,
)
from apps.interviews.triage_service import triage_candidate_application
from integrations.ai.client import AIEndpointCandidate, AIServiceUnavailable


class TestAgentRouterEngine(SimpleTestCase):
    """Kiểm tra AgentRouterEngine với các câu lệnh tuyển dụng mẫu tiếng Việt."""

    def test_search_candidates_routing(self):
        queries = [
            ("tìm ứng viên python", "python", None),
            ("lọc ứng viên có kinh nghiệm react", "react", None),
            ("danh sách ứng viên mới nộp", "mới nộp", None),
            ("tìm kiếm 10 ứng viên java spring", "java spring", 10),
            ("danh sách ứng viên", "", None),
        ]
        for text, expected_query, expected_limit in queries:
            with self.subTest(text=text):
                verdict: RouteVerdict = AgentRouterEngine.route(text)
                self.assertEqual(verdict.tool_name, "search_candidates")
                self.assertGreaterEqual(verdict.confidence, 0.85)
                if expected_query:
                    self.assertIn(expected_query.lower(), verdict.arguments.get("query", "").lower())
                if expected_limit:
                    self.assertEqual(verdict.arguments.get("limit"), expected_limit)
                self.assertTrue(len(verdict.assistant_text) > 0)

    def test_list_job_posts_routing(self):
        queries = [
            ("danh sách tin tuyển dụng", None, None),
            ("xem các việc làm đang đăng", "active", None),
            ("job post nào đang active", "active", None),
            ("xem 5 tin tuyển dụng vị trí backend", None, 5),
        ]
        for text, expected_status, expected_limit in queries:
            with self.subTest(text=text):
                verdict: RouteVerdict = AgentRouterEngine.route(text)
                self.assertEqual(verdict.tool_name, "list_job_posts")
                self.assertGreaterEqual(verdict.confidence, 0.85)
                if expected_status:
                    self.assertEqual(verdict.arguments.get("status"), expected_status)
                if expected_limit:
                    self.assertEqual(verdict.arguments.get("limit"), expected_limit)

    def test_question_bank_routing(self):
        # 1. Tạo câu hỏi phỏng vấn
        v1 = AgentRouterEngine.route("tạo câu hỏi phỏng vấn: Bạn xử lý Deadlock trong MySQL thế nào?")
        self.assertEqual(v1.tool_name, "create_question")
        self.assertGreaterEqual(v1.confidence, 0.85)
        self.assertIn("Deadlock", v1.arguments.get("text", ""))

        # 2. Tạo câu hỏi kỹ thuật với nội dung cụ thể
        v2 = AgentRouterEngine.route("thêm câu hỏi kỹ thuật: Giải thích cơ chế Index trong PostgreSQL?")
        self.assertEqual(v2.tool_name, "create_question")
        self.assertEqual(v2.arguments.get("category"), "technical")
        self.assertGreaterEqual(v2.confidence, 0.85)

        # 3. Xem bộ câu hỏi
        v3 = AgentRouterEngine.route("xem bộ câu hỏi tuyển dụng")
        self.assertEqual(v3.tool_name, "list_question_groups")
        self.assertGreaterEqual(v3.confidence, 0.85)

        # 4. Danh sách các nhóm câu hỏi
        v4 = AgentRouterEngine.route("danh sách nhóm câu hỏi")
        self.assertEqual(v4.tool_name, "list_question_groups")
        self.assertGreaterEqual(v4.confidence, 0.85)

    def test_list_interviews_routing(self):
        # 1. Phỏng vấn hôm nay
        v1 = AgentRouterEngine.route("danh sách phỏng vấn hôm nay")
        self.assertEqual(v1.tool_name, "list_interviews")
        self.assertGreaterEqual(v1.confidence, 0.85)
        self.assertEqual(v1.arguments.get("query"), "hôm nay")

        # 2. Lịch phỏng vấn live
        v2 = AgentRouterEngine.route("lịch phỏng vấn live")
        self.assertEqual(v2.tool_name, "list_interviews")
        self.assertGreaterEqual(v2.confidence, 0.85)
        self.assertTrue(v2.arguments.get("liveOnly"))

        # 3. Xem phỏng vấn trực tiếp
        v3 = AgentRouterEngine.route("xem lịch phỏng vấn trực tiếp")
        self.assertEqual(v3.tool_name, "list_interviews")
        self.assertGreaterEqual(v3.confidence, 0.85)
        self.assertTrue(v3.arguments.get("liveOnly"))

    def test_notebook_knowledge_routing(self):
        queries = [
            "tiêu chuẩn tuyển dụng kỹ sư backend",
            "JD lập trình viên python",
            "quy định công ty về thưởng dự án",
            "hỏi notebooklm về bộ chuẩn công ty",
            "mô tả công việc vị trí nhân viên kinh doanh",
        ]
        for q in queries:
            with self.subTest(query=q):
                verdict = AgentRouterEngine.route(q)
                self.assertEqual(verdict.tool_name, "query_notebook_knowledge")
                self.assertGreaterEqual(verdict.confidence, 0.85)
                self.assertEqual(verdict.arguments.get("query"), q)

    def test_respond_greetings_routing(self):
        greetings = [
            "xin chào",
            "hello",
            "chào bạn",
            "bạn là ai",
            "cảm ơn bạn nhiều",
            "tạm biệt nhé",
        ]
        for g in greetings:
            with self.subTest(greeting=g):
                verdict = AgentRouterEngine.route(g)
                self.assertEqual(verdict.tool_name, "respond")
                self.assertGreaterEqual(verdict.confidence, 0.85)
                self.assertTrue(len(verdict.assistant_text) > 0)

    def test_ambiguous_queries_confidence_below_threshold(self):
        """Câu lệnh mơ hồ, yêu cầu phân tích sâu hoặc không rõ ràng phải có confidence < 0.85 để fallback."""
        ambiguous_queries = [
            "tại sao tỷ lệ tuyển dụng tháng này giảm mạnh?",
            "phân tích xu hướng thị trường IT hiện nay",
            "nên làm gì trong trường hợp ứng viên từ chối offer?",
            "hôm nay có những việc gì cần xử lý?",
            "làm gì tiếp theo?",
            "giải thích nguyên nhân tỷ lệ pass phỏng vấn thấp",
            "so sánh hai ứng viên này giúp tôi",
        ]
        for query in ambiguous_queries:
            with self.subTest(query=query):
                verdict = AgentRouterEngine.route(query)
                self.assertLess(
                    verdict.confidence,
                    0.85,
                    f"Query '{query}' had confidence {verdict.confidence}, expected < 0.85 for fallback.",
                )

    def test_execution_latency_under_30ms(self):
        """Kiểm tra thời gian phản hồi của Fast Router: phải < 30ms (thực tế < 5ms)."""
        test_sentences = [
            "tìm ứng viên python kinh nghiệm 3 năm",
            "danh sách tin tuyển dụng đang active",
            "xem bộ câu hỏi tuyển dụng",
            "lịch phỏng vấn live hôm nay",
            "tiêu chuẩn tuyển dụng theo quy định công ty",
            "xin chào bạn",
            "tại sao tỷ lệ tuyển dụng giảm",
        ]
        # Chạy warm-up
        for s in test_sentences:
            AgentRouterEngine.route(s)

        # Đo đạc 100 lượt gọi
        start_time = time.perf_counter()
        iterations = 100
        for i in range(iterations):
            s = test_sentences[i % len(test_sentences)]
            AgentRouterEngine.route(s)
        total_time_ms = (time.perf_counter() - start_time) * 1000
        avg_latency_ms = total_time_ms / iterations

        self.assertLess(avg_latency_ms, 10.0, f"Average latency was {avg_latency_ms:.2f}ms, expected < 10ms")
        self.assertLess(total_time_ms, 300.0)


class TestCvTriageEngine(SimpleTestCase):
    """Kiểm tra CvTriageEngine phân tích đối sánh nhanh CV tóm tắt với JD."""

    def test_candidate_fit(self):
        candidate_summary = {
            "title": "Senior Python Developer",
            "skills": ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
            "experience_years": 4.5,
            "education": "Đại học Bách Khoa",
            "summary": "4 năm kinh nghiệm làm backend với Django và microservices.",
        }
        job_requirements = {
            "job_title": "Python Backend Engineer",
            "required_skills": ["Python", "Django", "PostgreSQL"],
            "optional_skills": ["Docker", "Kubernetes"],
            "min_experience_years": 3.0,
            "education_level": "Đại học",
        }
        verdict: TriageVerdict = CvTriageEngine.triage(candidate_summary, job_requirements)
        self.assertEqual(verdict.decision, "FIT")
        self.assertGreaterEqual(verdict.score, 75.0)
        self.assertGreaterEqual(verdict.confidence, 0.85)
        self.assertTrue(any("Python" in c for c in verdict.matched_criteria))
        self.assertEqual(len(verdict.missing_criteria), 0)
        self.assertIn("PHÙ HỢP", verdict.summary)

    def test_candidate_borderline(self):
        candidate_summary = {
            "title": "Junior Python Developer",
            "skills": ["Python", "Flask", "PostgreSQL"],
            "experience_years": 2.0,
            "education": "Cao đẳng",
            "summary": "2 năm lập trình web với Python và PostgreSQL.",
        }
        job_requirements = {
            "job_title": "Python Backend Engineer",
            "required_skills": ["Python", "Django", "PostgreSQL"],
            "optional_skills": ["Docker"],
            "min_experience_years": 3.0,
            "education_level": "Đại học",
        }
        verdict: TriageVerdict = CvTriageEngine.triage(candidate_summary, job_requirements)
        self.assertEqual(verdict.decision, "BORDERLINE")
        self.assertGreaterEqual(verdict.score, 50.0)
        self.assertLess(verdict.score, 75.0)
        self.assertTrue(len(verdict.missing_criteria) > 0)
        self.assertIn("TIỀM NĂNG", verdict.summary)

    def test_candidate_unfit(self):
        candidate_summary = {
            "title": "Graphic Designer",
            "skills": ["Photoshop", "Illustrator", "Figma"],
            "experience_years": 1.0,
            "education": "Trung cấp",
            "summary": "Thiết kế đồ họa và UI.",
        }
        job_requirements = {
            "job_title": "Senior Go Developer",
            "required_skills": ["Golang", "gRPC", "Kubernetes", "PostgreSQL"],
            "optional_skills": ["Kafka"],
            "min_experience_years": 4.0,
            "education_level": "Đại học",
        }
        verdict: TriageVerdict = CvTriageEngine.triage(candidate_summary, job_requirements)
        self.assertEqual(verdict.decision, "UNFIT")
        self.assertLess(verdict.score, 50.0)
        self.assertTrue(len(verdict.missing_criteria) > 0)
        self.assertIn("KHÔNG PHÙ HỢP", verdict.summary)

    def test_triage_latency_under_10ms(self):
        cand = {"skills": ["Python"], "experience_years": 2}
        job = {"required_skills": ["Python"], "min_experience_years": 1}
        start = time.perf_counter()
        for _ in range(50):
            CvTriageEngine.triage(cand, job)
        elapsed_avg = ((time.perf_counter() - start) * 1000) / 50
        self.assertLess(elapsed_avg, 5.0)


class TestTriageCandidateApplicationService(SimpleTestCase):
    """Kiểm tra service triage_candidate_application trong apps/interviews."""

    def test_triage_candidate_application_returns_standard_dict(self):
        candidate_summary = {
            "skills": ["React", "TypeScript"],
            "experience_years": 3,
        }
        job_requirements = {
            "required_skills": ["React"],
            "min_experience_years": 2,
        }
        result = triage_candidate_application(candidate_summary, job_requirements)
        self.assertIsInstance(result, dict)
        self.assertIn("decision", result)
        self.assertIn("score", result)
        self.assertIn("confidence", result)
        self.assertIn("matched_criteria", result)
        self.assertIn("missing_criteria", result)
        self.assertIn("summary", result)
        self.assertEqual(result["decision"], "FIT")


class TestAgentPlannerIntegration(SimpleTestCase):
    """Kiểm tra tích hợp Fast Router trong AgentPlanner.plan."""

    def setUp(self):
        self.dummy_thread = MagicMock(spec=AgentThread)
        self.dummy_thread.id = 999
        self.dummy_thread.portal = "employer"
        self.dummy_thread.company_id = 123
        self.dummy_thread.messages = MagicMock()
        self.dummy_thread.messages.filter.return_value.order_by.return_value = []
        self.dummy_thread.messages.order_by.return_value = []

    def test_planner_uses_fast_router_for_clear_recruitment_query(self):
        """Câu hỏi rõ ràng lập tức trả về AgentPlannedAction từ Fast Router mà không cần gọi LLM."""
        planned = AgentPlanner.plan(
            request=None,
            thread=self.dummy_thread,
            user_content="tìm ứng viên python",
        )
        self.assertIsInstance(planned, AgentPlannedAction)
        self.assertEqual(planned.tool_name, "search_candidates")
        self.assertEqual(planned.raw_response.get("source"), "openjev_decision_engine")
        self.assertGreaterEqual(planned.raw_response.get("confidence"), 0.85)
        self.assertFalse(planned.requires_confirmation)
        self.assertIn("python", planned.arguments.get("query", "").lower())

    def test_planner_uses_fast_router_for_job_posts(self):
        planned = AgentPlanner.plan(
            request=None,
            thread=self.dummy_thread,
            user_content="danh sách tin tuyển dụng đang active",
        )
        self.assertIsInstance(planned, AgentPlannedAction)
        self.assertEqual(planned.tool_name, "list_job_posts")
        self.assertEqual(planned.raw_response.get("source"), "openjev_decision_engine")
        self.assertEqual(planned.arguments.get("status"), "active")

    def test_planner_falls_back_to_llm_for_ambiguous_query(self):
        """Câu lệnh mơ hồ (confidence < 0.85) phải tiếp tục gọi sang LLM (System 2)."""
        mock_llm_response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": '{"toolName":"respond","arguments":{},"assistantText":"Cần xem xét thêm."}',
                    }
                }
            ]
        }
        with patch(
            "integrations.ai.client.post_chat_completion_requests",
            return_value=(
                mock_llm_response,
                AIEndpointCandidate(name="mock_llm", base_url="http://mock", model="test"),
            ),
        ) as mock_post:
            planned = AgentPlanner.plan(
                request=None,
                thread=self.dummy_thread,
                user_content="tại sao tỷ lệ tuyển dụng tháng này giảm mạnh?",
            )
            mock_post.assert_called_once()
            self.assertIsInstance(planned, AgentPlannedAction)
            self.assertEqual(planned.tool_name, "respond")
            self.assertEqual(planned.raw_response.get("candidate"), "mock_llm")

    def test_planner_with_image_part_bypasses_fast_router(self):
        """Tin nhắn có đính kèm ảnh sẽ bỏ qua Fast Router và đi vào luồng LLM Vision."""
        mock_llm_response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": '{"toolName":"respond","arguments":{},"assistantText":"Ảnh rõ nét."}',
                    }
                }
            ]
        }
        with patch(
            "integrations.ai.client.post_chat_completion_requests",
            return_value=(
                mock_llm_response,
                AIEndpointCandidate(name="vision_llm", base_url="http://mock", model="test"),
            ),
        ) as mock_post:
            planned = AgentPlanner.plan(
                request=None,
                thread=self.dummy_thread,
                user_content="tìm ứng viên python",
                message_parts=[{"type": "image", "dataUrl": "data:image/png;base64,123"}],
            )
            # Vì có ảnh đính kèm nên phải gọi LLM vision thay vì fast router
            mock_post.assert_called_once()
            self.assertEqual(planned.raw_response.get("candidate"), "vision_llm")
