from __future__ import annotations

import time
from unittest.mock import MagicMock, patch

import pytest
from django.test import SimpleTestCase, TestCase

from apps.agent_assistants.models import AgentThread
from apps.agent_assistants.planner import AgentPlannedAction, AgentPlanner, AgentPlannerUnavailable
from apps.common.decision_engine import (
    AgentRouterEngine,
    ComplianceVerdict,
    CvTriageEngine,
    JobComplianceEngine,
    RouteVerdict,
    TranscriptEvaluationEngine,
    TranscriptEvaluationVerdict,
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

    def test_list_applications_routing(self):
        v1 = AgentRouterEngine.route("danh sách đơn ứng tuyển")
        self.assertEqual(v1.tool_name, "list_applications")
        self.assertGreaterEqual(v1.confidence, 0.85)

        v2 = AgentRouterEngine.route("hồ sơ ứng tuyển tin 15")
        self.assertEqual(v2.tool_name, "list_applications")
        self.assertEqual(v2.arguments.get("jobPostId"), 15)

        v3 = AgentRouterEngine.route("ai đã nộp đơn vào tin tuyển dụng React")
        self.assertEqual(v3.tool_name, "list_applications")
        self.assertEqual(v3.arguments.get("query"), "React")

    def test_update_application_status_routing(self):
        v1 = AgentRouterEngine.route("chuyển trạng thái hồ sơ 45 sang trúng tuyển")
        self.assertEqual(v1.tool_name, "update_application_status")
        self.assertEqual(v1.arguments.get("applicationId"), 45)
        self.assertEqual(v1.arguments.get("status"), 5)

        v2 = AgentRouterEngine.route("đánh rớt ứng viên 78")
        self.assertEqual(v2.tool_name, "update_application_status")
        self.assertEqual(v2.arguments.get("applicationId"), 78)
        self.assertEqual(v2.arguments.get("status"), 6)

        v3 = AgentRouterEngine.route("đổi trạng thái ứng viên 23 sang đã phỏng vấn")
        self.assertEqual(v3.tool_name, "update_application_status")
        self.assertEqual(v3.arguments.get("applicationId"), 23)
        self.assertEqual(v3.arguments.get("status"), 4)

    def test_list_companies_routing(self):
        v1 = AgentRouterEngine.route("danh sách công ty")
        self.assertEqual(v1.tool_name, "list_companies")
        self.assertGreaterEqual(v1.confidence, 0.85)

        v2 = AgentRouterEngine.route("tìm công ty FPT")
        self.assertEqual(v2.tool_name, "list_companies")
        self.assertEqual(v2.arguments.get("query"), "FPT")

        v3 = AgentRouterEngine.route("danh sách công ty chờ duyệt")
        self.assertEqual(v3.tool_name, "list_companies")
        self.assertFalse(v3.arguments.get("verified"))

    def test_review_job_post_routing(self):
        v1 = AgentRouterEngine.route("duyệt tin tuyển dụng 101")
        self.assertEqual(v1.tool_name, "review_job_post")
        self.assertEqual(v1.arguments.get("action"), "approve")
        self.assertEqual(v1.arguments.get("jobPostId"), 101)

        v2 = AgentRouterEngine.route("từ chối tin tuyển dụng 202")
        self.assertEqual(v2.tool_name, "review_job_post")
        self.assertEqual(v2.arguments.get("action"), "reject")
        self.assertEqual(v2.arguments.get("jobPostId"), 202)

    def test_evaluate_cv_with_notebook_routing(self):
        v1 = AgentRouterEngine.route("đánh giá cv này với notebook")
        self.assertEqual(v1.tool_name, "evaluate_cv_with_notebook")
        self.assertGreaterEqual(v1.confidence, 0.85)


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


class TestJobComplianceEngine(SimpleTestCase):
    """Kiểm tra JobComplianceEngine phát hiện vi phạm và gian lận trong JD."""

    def test_compliant_job_post_auto_approved(self):
        job_data = {
            "job_name": "Senior Python Backend Engineer",
            "description": "Phát triển hệ thống microservices phân tán chịu tải cao, tối ưu hóa database MySQL và Redis.",
            "requirements": "Ít nhất 4 năm kinh nghiệm với Python, Django/FastAPI, thành thạo Docker và CI/CD.",
            "benefits": "Lương tháng 13, bảo hiểm sức khỏe toàn diện, thưởng hiệu suất hàng quý, môi trường năng động.",
            "salary_min": 25000000,
            "salary_max": 45000000,
        }
        verdict = JobComplianceEngine.check_compliance(job_data)
        self.assertTrue(verdict.is_compliant)
        self.assertEqual(verdict.recommendation, "AUTO_APPROVE")
        self.assertGreaterEqual(verdict.score, 85.0)
        self.assertEqual(len(verdict.flags), 0)

    def test_discriminatory_job_post_flagged(self):
        job_data = {
            "job_name": "Nhân viên Kế toán Tổng hợp",
            "description": "Thực hiện báo cáo thuế, quản lý chứng từ sổ sách. Chỉ tuyển nữ, yêu cầu độc thân chưa lập gia đình.",
            "requirements": "Tốt nghiệp đại học chuyên ngành tài chính kế toán, có 2 năm kinh nghiệm.",
            "benefits": "Đầy đủ chế độ theo luật.",
        }
        verdict = JobComplianceEngine.check_compliance(job_data)
        self.assertIn(verdict.recommendation, ("FLAG_FOR_REVIEW", "REJECT"))
        self.assertTrue(any("DISCRIMINATION" in f for f in verdict.flags))

    def test_scam_job_post_rejected(self):
        job_data = {
            "job_name": "Việc làm online tại nhà",
            "description": "Việc nhẹ lương cao 500k/ngày, like dạo và xem video kiếm tiền. Yêu cầu đặt cọc tiền đồng phục 200k. Inbox telegram kín @kiemtien.",
        }
        verdict = JobComplianceEngine.check_compliance(job_data)
        self.assertFalse(verdict.is_compliant)
        self.assertEqual(verdict.recommendation, "REJECT")
        self.assertTrue(any("SCAM_ALERT" in f for f in verdict.flags))

    def test_compliance_engine_latency_under_5ms(self):
        job_data = {
            "job_name": "Frontend Developer",
            "description": "Lập trình giao diện Next.js, TailwindCSS và React Query cho hệ thống tuyển dụng.",
            "requirements": "2 năm kinh nghiệm Frontend.",
        }
        start = time.perf_counter()
        for _ in range(50):
            JobComplianceEngine.check_compliance(job_data)
        avg_ms = ((time.perf_counter() - start) * 1000) / 50
        self.assertLess(avg_ms, 5.0, f"Avg latency {avg_ms:.2f}ms exceeds 5ms")


class TestTranscriptEvaluationEngine(SimpleTestCase):
    """Kiểm tra TranscriptEvaluationEngine đánh giá dự phòng hội thoại phỏng vấn."""

    def test_substantive_transcript_evaluation(self):
        transcripts = [
            {"speaker_role": "ai_agent", "content": "Bạn hãy giới thiệu về các dự án Python bạn từng triển khai?"},
            {
                "speaker_role": "candidate",
                "content": "Tôi từng phát triển hệ thống backend Python xử lý thanh toán với Django, PostgreSQL và Redis. Hệ thống chạy trên kiến trúc microservices với Docker và Kubernetes, chịu tải 1000 req/s.",
            },
            {"speaker_role": "ai_agent", "content": "Bạn xử lý xung đột trong nhóm làm việc thế nào?"},
            {
                "speaker_role": "candidate",
                "content": "Tôi luôn chủ động lắng nghe, trao đổi thẳng thắn và phối hợp với đồng nghiệp để tìm giải pháp tối ưu nhất cho sản phẩm.",
            },
        ]
        context = {
            "job_title": "Backend Python Developer",
            "skills": "Python, Django, PostgreSQL, Docker, Microservices",
        }
        verdict = TranscriptEvaluationEngine.evaluate(transcripts, context)
        self.assertGreaterEqual(verdict.overall_score, 7.0)
        self.assertGreaterEqual(verdict.technical_score, 7.0)
        self.assertGreaterEqual(verdict.communication_score, 7.0)
        self.assertTrue(len(verdict.strengths) > 0)
        self.assertTrue(any("python" in s.lower() for s in verdict.strengths))

    def test_shallow_transcript_evaluation(self):
        transcripts = [
            {"speaker_role": "ai_agent", "content": "Bạn có kinh nghiệm với React không?"},
            {"speaker_role": "candidate", "content": "Không rõ."},
            {"speaker_role": "ai_agent", "content": "Bạn đã làm việc với Docker chưa?"},
            {"speaker_role": "candidate", "content": "Bỏ qua câu này."},
        ]
        verdict = TranscriptEvaluationEngine.evaluate(transcripts)
        self.assertLessEqual(verdict.overall_score, 6.0)
        self.assertTrue(len(verdict.weaknesses) > 0)

    def test_transcript_evaluation_latency_under_5ms(self):
        transcripts = [
            {"speaker_role": "ai_agent", "content": "Chào bạn."},
            {"speaker_role": "candidate", "content": "Tôi có kinh nghiệm làm việc với Python và Django."},
        ]
        start = time.perf_counter()
        for _ in range(50):
            TranscriptEvaluationEngine.evaluate(transcripts)
        avg_ms = ((time.perf_counter() - start) * 1000) / 50
        self.assertLess(avg_ms, 5.0, f"Avg latency {avg_ms:.2f}ms exceeds 5ms")

