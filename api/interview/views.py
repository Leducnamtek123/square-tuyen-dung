"""
Interview Module — DRF Views
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from django.core.exceptions import ObjectDoesNotExist

from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewEvaluation
)
from .serializers import (
    QuestionSerializer, QuestionGroupSerializer,
    InterviewSessionListSerializer, InterviewSessionDetailSerializer,
    InterviewSessionCreateSerializer,
    InterviewTranscriptSerializer, InterviewEvaluationSerializer,
    AppendTranscriptSerializer, UpdateStatusSerializer
)
from .services import (
    build_interview_context,
    create_livekit_participant_token,
    append_transcript,
    update_interview_status,
)
from authentication import permissions as perms_custom

class InterviewStatisticViewSet(viewsets.ViewSet):
    permission_classes = [perms_custom.IsAdminUser]

    def general_statistics(self, request):
        status_counts = {
            item["status"]: item["count"]
            for item in InterviewSession.objects.values("status").annotate(count=Count("id"))
        }

        data = {
            "totalInterviews": InterviewSession.objects.count(),
            "totalInterviewDraft": status_counts.get("draft", 0),
            "totalInterviewScheduled": status_counts.get("scheduled", 0),
            "totalInterviewCalibration": status_counts.get("calibration", 0),
            "totalInterviewInProgress": status_counts.get("in_progress", 0),
            "totalInterviewProcessing": status_counts.get("processing", 0),
            "totalInterviewCompleted": status_counts.get("completed", 0),
            "totalInterviewCancelled": status_counts.get("cancelled", 0),
            "totalInterviewInterrupted": status_counts.get("interrupted", 0),
            "totalQuestions": Question.objects.count(),
            "totalQuestionGroups": QuestionGroup.objects.count(),
            "totalEvaluations": InterviewEvaluation.objects.count(),
        }

        return Response(data)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related('career', 'career__icon', 'company', 'author').all()
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['career', 'difficulty']
    search_fields = ['text']
    ordering_fields = ['sort_order', 'create_at']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        role = getattr(user, 'role_name', None)
        company = self._resolve_company(user)

        if role == 'EMPLOYER' and company:
            from django.db.models import Q
            return qs.filter(Q(company__isnull=True) | Q(company=company))
        return qs

    def _resolve_company(self, user):
        try:
            return getattr(user, 'company', None)
        except ObjectDoesNotExist:
            return None
        except Exception:
            return None

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role_name', None)
        company = self._resolve_company(user)
        if role == 'EMPLOYER' and company:
            serializer.save(author=user, company=company)
        else:
            serializer.save(author=user)

class QuestionGroupViewSet(viewsets.ModelViewSet):
    queryset = QuestionGroup.objects.prefetch_related('questions', 'questions__career', 'questions__career__icon').select_related('company', 'author').all()
    serializer_class = QuestionGroupSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['create_at', 'name']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        role = getattr(user, 'role_name', None)
        company = self._resolve_company(user)

        if role == 'EMPLOYER' and company:
            from django.db.models import Q
            return qs.filter(Q(company__isnull=True) | Q(company=company))
        return qs

    def _resolve_company(self, user):
        try:
            return getattr(user, 'company', None)
        except ObjectDoesNotExist:
            return None
        except Exception:
            return None

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role_name', None)
        company = self._resolve_company(user)
        if role == 'EMPLOYER' and company:
            serializer.save(author=user, company=company)
        else:
            serializer.save(author=user)

class InterviewSessionViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        base_qs = InterviewSession.objects.select_related(
            'candidate', 'job_post', 'created_by', 'question_group'
        ).prefetch_related('questions', 'transcripts', 'evaluations')

        if user.is_anonymous:
            return base_qs.none()

        role = getattr(user, 'role_name', None)

        if role == 'JOB_SEEKER':
            return base_qs.filter(candidate=user)
        elif role == 'EMPLOYER':
            from django.db.models import Q
            if hasattr(user, 'company') and user.company:
                 return base_qs.filter(Q(job_post__company=user.company) | Q(created_by=user)).distinct()
            return base_qs.filter(created_by=user)

        # Admin or other roles can see all
        return base_qs.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return InterviewSessionCreateSerializer
        if self.action in ['list']:
            return InterviewSessionListSerializer
        return InterviewSessionDetailSerializer

    def perform_create(self, serializer):
        session = serializer.save(created_by=self.request.user)
        # Send invitation email
        from .tasks import send_interview_invitation
        send_interview_invitation.delay(session.id)

    @action(detail=False, methods=['get'], url_path='invite/(?P<invite_token>[^/.]+)',
            permission_classes=[permissions.AllowAny])
    def retrieve_by_invite_token(self, request, invite_token=None):
        try:
            session = InterviewSession.objects.select_related(
                'candidate', 'job_post', 'created_by', 'question_group'
            ).prefetch_related('questions', 'transcripts', 'evaluations').get(invite_token=invite_token)
        except InterviewSession.DoesNotExist:
            return Response(
                {"detail": "Interview session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = InterviewSessionDetailSerializer(session)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='invite/(?P<invite_token>[^/.]+)/livekit-token',
            permission_classes=[permissions.AllowAny])
    def livekit_token_by_invite_token(self, request, invite_token=None):
        try:
            session = InterviewSession.objects.select_related('candidate').get(invite_token=invite_token)
        except InterviewSession.DoesNotExist:
            return Response(
                {"detail": "Interview session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(create_livekit_participant_token(session, request))

    # GET /sessions/{room_name}/context/ — cho AI Agent
    @action(detail=False, methods=['get'], url_path='(?P<room_name>[^/.]+)/context',
            permission_classes=[permissions.AllowAny])
    def context(self, request, room_name=None):
        """Trả context cho AI Agent khi join room."""
        try:
            session = InterviewSession.objects.select_related(
                'candidate', 'job_post'
            ).prefetch_related('questions').get(room_name=room_name)
        except InterviewSession.DoesNotExist:
            return Response(
                {"detail": "Interview session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(build_interview_context(session))

    # PATCH /sessions/{room_name}/status/ — cập nhật trạng thái
    @action(detail=False, methods=['patch'], url_path='(?P<room_name>[^/.]+)/status',
            permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, room_name=None):
        """Cập nhật trạng thái (cho Agent hoặc Frontend)."""
        try:
            session = InterviewSession.objects.get(room_name=room_name)
        except InterviewSession.DoesNotExist:
            return Response(
                {"detail": "Interview session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = update_interview_status(session, serializer.validated_data['status'])
        return Response({"status": new_status})

    # POST /sessions/{room_name}/append-transcription/
    @action(detail=False, methods=['post'], url_path='(?P<room_name>[^/.]+)/append-transcription',
            permission_classes=[permissions.IsAuthenticated])
    def append_transcription(self, request, room_name=None):
        """Agent gửi transcript hội thoại."""
        try:
            session = InterviewSession.objects.get(room_name=room_name)
        except InterviewSession.DoesNotExist:
            return Response(
                {"detail": "Interview session not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AppendTranscriptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transcript = append_transcript(session, serializer.validated_data)
        return Response(
            InterviewTranscriptSerializer(transcript).data,
            status=status.HTTP_201_CREATED
        )

class InterviewEvaluationViewSet(viewsets.ModelViewSet):
    queryset = InterviewEvaluation.objects.select_related('interview', 'evaluator').all()
    serializer_class = InterviewEvaluationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['interview', 'result']

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)
