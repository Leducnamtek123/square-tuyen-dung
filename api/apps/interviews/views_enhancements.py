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

from .models import Question, InterviewSession, SalaryBenchmark, QuestionGroup, VoiceProfile
from apps.jobs.models import JobPost
from .serializers_enhancements import (
    QuestionBankItemSerializer,
    SalaryBenchmarkSerializer,
    CreateMockSessionInputSerializer,
    MockSessionResponseSerializer,
)
from .livekit_service import LiveKitService
from .services import sync_salary_benchmarks_from_jobs

logger = logging.getLogger(__name__)


class QuestionBankListView(generics.ListAPIView):
    """
    API tra cứu ngân hàng câu hỏi (hỗ trợ lọc theo ngành nghề, độ khó, danh mục, từ khóa tìm kiếm).
    Public access cho ứng viên tìm hiểu và tự luyện tập.
    """
    permission_classes = [AllowAny]
    serializer_class = QuestionBankItemSerializer

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        active_company = None
        is_admin = False
        if user and user.is_authenticated:
            is_admin = getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or (getattr(user, 'role', None) and getattr(user.role, 'name', '') == 'ADMIN')
            if hasattr(user, 'get_active_company'):
                try:
                    active_company = user.get_active_company()
                except Exception:
                    pass

        qs = Question.objects.select_related('career').order_by('sort_order', '-create_at')
        if not is_admin:
            if active_company:
                qs = qs.filter(Q(company__isnull=True) | Q(company=active_company))
            else:
                qs = qs.filter(company__isnull=True)

        career_param = self.request.query_params.get('career_id') or self.request.query_params.get('career')
        if career_param:
            if str(career_param).isdigit():
                c_id = int(career_param)
                # When filtering by specific career:
                # Include questions for this exact career, plus general behavioral questions without career
                qs = qs.filter(Q(career_id=c_id) | (Q(career__isnull=True) & Q(category__in=['general', 'behavioral'])))
            else:
                qs = qs.filter(
                    Q(career__name__icontains=career_param) |
                    (Q(career__isnull=True) & Q(category__in=['general', 'behavioral']))
                )

        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            try:
                qs = qs.filter(difficulty=int(difficulty))
            except ValueError:
                pass

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(
                Q(category__iexact=category) |
                Q(career__name__icontains=category)
            )

        seniority = self.request.query_params.get('seniority')
        if seniority:
            qs = qs.filter(Q(seniority=seniority) | Q(seniority__isnull=True))

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(text__icontains=search) |
                Q(interviewer_intent__icontains=search) |
                Q(career__name__icontains=search)
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

        if q.company_id is not None:
            user = getattr(request, 'user', None)
            if not user or not user.is_authenticated:
                return Response(
                    {"detail": "Không có quyền truy cập câu hỏi riêng tư của doanh nghiệp."},
                    status=status.HTTP_403_FORBIDDEN
                )
            is_admin = getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or (getattr(user, 'role', None) and getattr(user.role, 'name', '') == 'ADMIN')
            if not is_admin:
                active_company = None
                if hasattr(user, 'get_active_company'):
                    try:
                        active_company = user.get_active_company()
                    except Exception:
                        pass
                if not (active_company and active_company.id == q.company_id):
                    return Response(
                        {"detail": "Không có quyền truy cập câu hỏi riêng tư của doanh nghiệp khác."},
                        status=status.HTTP_403_FORBIDDEN
                    )

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
    Tạo session loại 'mock', gán bộ câu hỏi ngẫu nhiên hoặc theo chỉ định và sinh LiveKit room token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateMockSessionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        career_id = serializer.validated_data.get('career_id')
        job_title = serializer.validated_data.get('job_title')
        position_title = (
            job_title or
            serializer.validated_data.get('position_title') or
            'Phỏng vấn thử AI'
        )
        category = serializer.validated_data.get('category')
        question_count = serializer.validated_data.get('question_count', 6)
        question_group_id = serializer.validated_data.get('question_group_id')
        question_ids = serializer.validated_data.get('question_ids') or []
        voice_profile_id = serializer.validated_data.get('voice_profile_id')
        job_post_id = serializer.validated_data.get('job_post_id')

        # Link JobPost if provided
        job_post_obj = None
        if job_post_id:
            job_post_obj = JobPost.objects.filter(id=job_post_id).first()
            if job_post_obj and not job_title:
                position_title = job_post_obj.title or position_title

        # Link QuestionGroup if provided
        question_group_obj = None
        if question_group_id:
            question_group_obj = QuestionGroup.objects.filter(id=question_group_id).first()

        # Link VoiceProfile if provided
        voice_profile_obj = None
        if voice_profile_id:
            voice_profile_obj = VoiceProfile.objects.filter(id=voice_profile_id).first()

        # Resolve Career instance
        from apps.common.models import Career
        career_obj = None
        if career_id:
            career_obj = Career.objects.filter(id=career_id).first()
        elif category and category != 'Tất cả ngành nghề':
            career_obj = Career.objects.filter(name__icontains=category).first()

        # Xác định user ứng viên hoặc fallback nếu user chưa đăng nhập
        candidate = request.user if request.user and request.user.is_authenticated else None
        if not candidate:
            from apps.accounts.models import User
            # Tìm hoặc tạo mock user cho guest
            candidate, _ = User.objects.get_or_create(
                email="guest_candidate_mock@square.vn",
                defaults={"full_name": "Ứng viên luyện tập", "role_name": "job_seeker"}
            )

        # Chọn câu hỏi:
        candidate_questions = []
        if question_ids:
            # Ưu tiên các câu hỏi cụ thể được chỉ định
            candidate_questions = list(Question.objects.filter(id__in=question_ids))
        elif question_group_obj:
            # Ưu tiên câu hỏi từ nhóm câu hỏi được chỉ định
            candidate_questions = list(question_group_obj.questions.all())
        elif career_obj:
            qs_career = list(Question.objects.filter(career=career_obj).order_by('?'))
            candidate_questions.extend(qs_career)
        elif category and category != 'Tất cả ngành nghề':
            qs_cat = list(Question.objects.filter(
                Q(category__iexact=category) |
                Q(career__name__icontains=category)
            ).order_by('?'))
            candidate_questions.extend(qs_cat)

        # Bổ sung câu hỏi chung nếu chưa đủ question_count:
        # CHỈ bổ sung từ câu hỏi chung career__isnull=True, TUYỆT ĐỐI không lấy câu hỏi chuyên ngành của nghề khác!
        if not candidate_questions:
            general_qs = list(
                Question.objects.filter(
                    Q(career__isnull=True) | Q(category__in=['general', 'behavioral'])
                ).order_by('sort_order', '?')[:question_count]
            )
            candidate_questions.extend(general_qs)
        elif not question_ids and not question_group_obj and len(candidate_questions) < question_count:
            remaining = question_count - len(candidate_questions)
            general_fallback = list(
                Question.objects.filter(
                    career__isnull=True,
                    category__in=['general', 'behavioral', 'situational']
                ).exclude(id__in=[q.id for q in candidate_questions]).order_by('?')[:remaining]
            )
            candidate_questions.extend(general_fallback)
        selected_questions = candidate_questions if (question_ids or question_group_obj) else candidate_questions[:question_count]
        if not question_ids and not question_group_obj:
            stage_priority = {
                'culture_fit': 1,
                'general': 2,
                'soft_skills': 3,
                'technical': 4,
                'behavioral': 5,
                'situational': 6,
                'problem_solving': 7,
            }
            selected_questions.sort(
                key=lambda q: (
                    stage_priority.get((getattr(q, 'category', '') or '').lower(), 99),
                    getattr(q, 'sort_order', 0) or 0,
                    getattr(q, 'id', 0) or 0,
                )
            )

        # Đánh dấu preview nếu người gọi là recruiter / employer
        is_employer = False
        if request.user and request.user.is_authenticated:
            user_role = getattr(request.user, 'role_name', '')
            is_employer = user_role in ['recruiter', 'employer', 'admin']

        # Khởi tạo session phỏng vấn thử
        session = InterviewSession.objects.create(
            candidate=candidate,
            created_by=request.user if request.user and request.user.is_authenticated else None,
            job_post=job_post_obj,
            question_group=question_group_obj,
            voice_profile=voice_profile_obj,
            session_type=InterviewSession.SESSION_TYPE_MOCK,
            interview_language=serializer.validated_data.get('interview_language', 'vi'),
            status='scheduled',
            type='mixed',
            scheduled_at=timezone.now(),
            duration=len(selected_questions) * 120,
            time_limit_per_question=120,
            notes=f"Phiên phỏng vấn thử vị trí: {position_title}",
            session_metadata={
                "position_title": position_title,
                "career_id": career_obj.id if career_obj else career_id,
                "career_name": career_obj.name if career_obj else (category or ""),
                "category": category,
                "total_questions": len(selected_questions),
                "is_employer_preview": is_employer,
                "question_group_id": question_group_obj.id if question_group_obj else None,
                "voice_profile_id": voice_profile_obj.id if voice_profile_obj else None,
                **(serializer.validated_data.get('session_metadata') or {}),
            }
        )

        if selected_questions:
            session.questions.set(selected_questions)

        # Sinh token LiveKit cho người tham gia
        livekit_token = ""
        try:
            livekit_token = LiveKitService.create_token(
                room_name=session.room_name,
                participant_identity=f"participant-mock-{session.candidate_id}-{session.id}",
                participant_name=candidate.full_name or "Người thử nghiệm",
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
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = SalaryBenchmarkSerializer

    def get_queryset(self):
        try:
            sync_salary_benchmarks_from_jobs()
        except Exception as e:
            logger.error("Failed to sync salary benchmarks from jobs: %s", e)

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


CATEGORY_VIETNAMESE_MAP = {
    'technical': 'Chuyên môn và kỹ thuật',
    'behavioral': 'Hành vi và ứng xử',
    'situational': 'Xử lý tình huống',
    'general': 'Tổng quan và giới thiệu',
    'culture_fit': 'Phù hợp văn hóa',
    'soft_skills': 'Kỹ năng mềm',
    'problem_solving': 'Giải quyết vấn đề',
}


class PublicQuestionGroupListView(APIView):
    """
    API tra cứu danh sách Bộ câu hỏi phỏng vấn tuyển dụng của doanh nghiệp.
    Dành cho ứng viên tự do luyện tập phỏng vấn AI theo chuẩn doanh nghiệp.
    Hỗ trợ tìm kiếm, lọc theo career_id, seniority.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        groups_qs = QuestionGroup.objects.filter(is_public=True).prefetch_related(
            'questions', 'questions__career'
        ).select_related('company', 'company__logo').all()

        search = request.query_params.get('search', '').strip()
        career_id = request.query_params.get('career_id')

        results = []
        for g in groups_qs:
            questions = list(g.questions.all().order_by('sort_order', 'id'))
            if not questions:
                continue

            if search:
                search_lower = search.lower()
                matches_name = search_lower in g.name.lower()
                matches_desc = bool(g.description and search_lower in g.description.lower())
                matches_company = bool(g.company and search_lower in g.company.company_name.lower())
                matches_q = any(search_lower in q.text.lower() for q in questions)
                if not (matches_name or matches_desc or matches_company or matches_q):
                    continue

            group_careers = {q.career_id for q in questions if q.career_id}
            if career_id:
                try:
                    c_id = int(career_id)
                    if c_id not in group_careers:
                        continue
                except ValueError:
                    pass

            primary_career = None
            for q in questions:
                if q.career:
                    primary_career = q.career
                    break

            co = g.company
            co_name = co.company_name if co else "Square AI Tuyển Dụng"
            co_logo = None
            if co and co.logo:
                try:
                    co_logo = co.logo.get_full_url()
                except Exception:
                    co_logo = None

            total_seconds = sum(q.default_duration_seconds or 120 for q in questions)
            total_minutes = max(round(total_seconds / 60), 3)

            cats_set = []
            for q in questions:
                c = (q.category or '').lower()
                tag_name = CATEGORY_VIETNAMESE_MAP.get(c, 'Chuyên môn và kỹ thuật')
                if tag_name not in cats_set:
                    cats_set.append(tag_name)

            preview_questions = []
            for q in questions:
                cat_vi = CATEGORY_VIETNAMESE_MAP.get((q.category or '').lower(), q.category or 'Tổng quan')
                preview_questions.append({
                    "id": q.id,
                    "text": q.text,
                    "title": getattr(q, 'title', None) or q.text[:60],
                    "category": q.category,
                    "category_display": cat_vi,
                    "default_duration_seconds": q.default_duration_seconds or 120,
                    "interviewer_intent": q.interviewer_intent or "",
                    "answer_structure": q.answer_structure,
                    "important_tips": q.important_tips,
                    "follow_up_questions": q.follow_up_questions,
                })

            results.append({
                "id": g.id,
                "name": g.name,
                "description": g.description or "",
                "company_id": co.id if co else None,
                "company_name": co_name,
                "company_logo": co_logo,
                "career_id": primary_career.id if primary_career else None,
                "career_name": primary_career.name if primary_career else "Đa ngành nghề",
                "seniority": "Cấp độ Middle và Senior",
                "questions_count": len(questions),
                "total_duration_minutes": total_minutes,
                "category_tags": cats_set,
                "questions": preview_questions,
            })

        return Response(results)

