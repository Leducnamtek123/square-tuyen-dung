"""
Views for Interview Enhancements: Question Bank, Mock Sessions, and Salary Benchmarks
"""

import logging
import random
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import Question, InterviewSession, SalaryBenchmark
from .serializers_enhancements import (
    QuestionBankItemSerializer,
    SalaryBenchmarkSerializer,
    CreateMockSessionInputSerializer,
    MockSessionResponseSerializer,
)
from .livekit_service import LiveKitService

logger = logging.getLogger(__name__)


class QuestionBankListView(generics.ListAPIView):
    """
    API tra cứu ngân hàng câu hỏi (hỗ trợ lọc theo ngành nghề, độ khó, danh mục, từ khóa tìm kiếm).
    Public access cho ứng viên tìm hiểu và tự luyện tập.
    """
    permission_classes = [AllowAny]
    serializer_class = QuestionBankItemSerializer

    def get_queryset(self):
        qs = Question.objects.all().order_by('sort_order', '-create_at')
        career_id = self.request.query_params.get('career_id')
        if career_id:
            qs = qs.filter(Q(career_id=career_id) | Q(career__isnull=True))

        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            try:
                qs = qs.filter(difficulty=int(difficulty))
            except ValueError:
                pass

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(text__icontains=search) |
                Q(interviewer_intent__icontains=search)
            )

        return qs


class QuestionHintsDetailView(APIView):
    """
    API lấy chi tiết cấu trúc trả lời, mẹo quan trọng và câu hỏi follow-up cho 1 câu hỏi cụ thể.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            q = Question.objects.get(pk=pk)
        except Question.DoesNotExist:
            return Response({"detail": "Không tìm thấy câu hỏi."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "id": q.id,
            "text": q.text,
            "category": q.category,
            "default_duration_seconds": q.default_duration_seconds,
            "answer_structure": q.answer_structure,
            "interviewer_intent": q.interviewer_intent,
            "important_tips": q.important_tips,
            "follow_up_questions": q.follow_up_questions,
        })


class CreateMockSessionView(APIView):
    """
    API tạo phiên Phỏng vấn thử (Mock Interview).
    Tạo session loại 'mock', gán bộ câu hỏi ngẫu nhiên và sinh LiveKit room token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateMockSessionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        career_id = serializer.validated_data.get('career_id')
        position_title = (
            serializer.validated_data.get('job_title') or
            serializer.validated_data.get('position_title') or
            'Phỏng vấn thử AI'
        )
        category = serializer.validated_data.get('category')
        question_count = serializer.validated_data.get('question_count', 6)

        # Xác định user ứng viên (hoặc fallback nếu user chưa đăng nhập)
        candidate = request.user if request.user and request.user.is_authenticated else None
        if not candidate:
            from apps.accounts.models import User
            # Tìm hoặc tạo mock user cho guest
            candidate, _ = User.objects.get_or_create(
                email="guest_candidate_mock@square.vn",
                defaults={"full_name": "Ứng viên luyện tập", "role_name": "job_seeker"}
            )

        # Chọn câu hỏi phù hợp theo ngành nghề
        candidate_questions = []
        if career_id:
            qs_career = list(Question.objects.filter(career_id=career_id))
            candidate_questions.extend(qs_career)
        elif category and category != 'Tất cả ngành nghề':
            qs_cat = list(Question.objects.filter(Q(category__icontains=category) | Q(career__name__icontains=category)))
            candidate_questions.extend(qs_cat)

        # Bổ sung câu hỏi chung nếu chưa đủ số lượng
        remaining = question_count - len(candidate_questions)
        if remaining > 0:
            general_qs = list(
                Question.objects.exclude(id__in=[q.id for q in candidate_questions])
                .order_by('sort_order', '?')[:remaining]
            )
            candidate_questions.extend(general_qs)

        selected_questions = candidate_questions[:question_count]

        # Khởi tạo session phỏng vấn thử
        session = InterviewSession.objects.create(
            candidate=candidate,
            session_type=InterviewSession.SESSION_TYPE_MOCK,
            status='scheduled',
            type='mixed',
            scheduled_at=timezone.now(),
            duration=len(selected_questions) * 120,
            time_limit_per_question=120,
            notes=f"Phiên phỏng vấn thử vị trí: {position_title}",
            session_metadata={
                "position_title": position_title,
                "career_id": career_id,
                "category": category,
                "total_questions": len(selected_questions),
            }
        )

        if selected_questions:
            session.questions.set(selected_questions)

        # Sinh token LiveKit cho ứng viên
        livekit_token = ""
        try:
            livekit_token = LiveKitService.create_token(
                room_name=session.room_name,
                participant_identity=f"candidate-mock-{session.candidate_id}-{session.id}",
                participant_name=candidate.full_name or "Ứng viên",
                is_agent=False
            )
        except Exception as exc:
            logger.warning("Failed to generate LiveKit token for mock session: %s", exc)

        resp_data = MockSessionResponseSerializer(session).data
        resp_data['livekit_token'] = livekit_token
        return Response(resp_data, status=status.HTTP_201_CREATED)


class SalaryBenchmarkListView(generics.ListAPIView):
    """
    API tra cứu mức lương thị trường theo vị trí, ngành nghề và cấp bậc kinh nghiệm năm 2026.
    Public access cho mọi ứng viên.
    """
    permission_classes = [AllowAny]
    serializer_class = SalaryBenchmarkSerializer

    def get_queryset(self):
        qs = SalaryBenchmark.objects.all().select_related('career')

        career_id = self.request.query_params.get('career_id')
        if career_id:
            qs = qs.filter(career_id=career_id)

        category = self.request.query_params.get('category')
        if category and category != 'Tất cả ngành nghề':
            qs = qs.filter(Q(career__name__icontains=category) | Q(position_title__icontains=category))

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(position_title__icontains=search) |
                Q(career__name__icontains=search)
            )

        experience = self.request.query_params.get('experience_level') or self.request.query_params.get('seniority')
        if experience:
            qs = qs.filter(experience_level=experience)

        is_hot = self.request.query_params.get('is_hot')
        if is_hot is not None:
            qs = qs.filter(is_hot=is_hot.lower() in ['true', '1'])

        year = self.request.query_params.get('year')
        if year:
            try:
                qs = qs.filter(year=int(year))
            except ValueError:
                pass

        return qs.order_by('-is_hot', 'position_title', 'salary_min')
