"""
Interview Module — DRF Views
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from django.core.exceptions import ObjectDoesNotExist

from shared.configs.variable_response import response_data

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
    queue_invitation_email,
    queue_ai_evaluation,
    create_observer_livekit_token,
    get_session_questions,
    SessionNotJoinableError,
)
from apps.accounts import permissions as perms_custom
from shared.helpers import helper

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

        return response_data(data=data)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related('career', 'career__icon', 'company', 'author').all()
    serializer_class = QuestionSerializer
    permission_classes = [perms_custom.IsEmployerUser]
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
            return user.get_active_company()
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
    permission_classes = [perms_custom.IsEmployerUser]
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
            return user.get_active_company()
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
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Agent-facing endpoints are AllowAny (secured by room_name/invite_token)
        if self.action in [
            'retrieve_by_invite_token', 'livekit_token_by_invite_token',
            'context', 'update_status', 'append_transcription',
        ]:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        base_qs = InterviewSession.objects.select_related(
            'candidate', 'job_post', 'created_by'
        ).prefetch_related('questions', 'transcripts', 'evaluations')

        if user.is_anonymous:
            return base_qs.none()

        role = getattr(user, 'role_name', None)

        if role == 'JOB_SEEKER':
            return base_qs.filter(candidate=user)
        elif role == 'EMPLOYER':
            from django.db.models import Q
            company = self._resolve_company(user)
            if company:
                 return base_qs.filter(Q(job_post__company=company) | Q(created_by=user)).distinct()
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
        queue_invitation_email(session.id)

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as ex:
            helper.print_log_error("InterviewSessionViewSet.list", ex)
            # Fallback to avoid breaking candidate/employer tabs on transient data issues
            return response_data(data={"count": 0, "results": []})

    def _resolve_company(self, user):
        try:
            return user.get_active_company()
        except Exception:
            return None

    @action(detail=False, methods=['get'], url_path='invite/(?P<invite_token>[^/.]+)',
            permission_classes=[permissions.AllowAny])
    def retrieve_by_invite_token(self, request, invite_token=None):
        try:
            session = InterviewSession.objects.select_related(
                'candidate', 'job_post', 'created_by'
            ).prefetch_related('questions', 'transcripts', 'evaluations').get(invite_token=invite_token)
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        serializer = InterviewSessionDetailSerializer(session)
        return response_data(data=serializer.data)

    @action(detail=False, methods=['get'], url_path='invite/(?P<invite_token>[^/.]+)/livekit-token',
            permission_classes=[permissions.AllowAny])
    def livekit_token_by_invite_token(self, request, invite_token=None):
        try:
            session = InterviewSession.objects.select_related('candidate').get(invite_token=invite_token)
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        try:
            return response_data(data=create_livekit_participant_token(session, request))
        except SessionNotJoinableError as exc:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": [str(exc)], "code": "SESSION_NOT_JOINABLE"}
            )
        except ValueError as exc:
            return response_data(status=status.HTTP_400_BAD_REQUEST, errors={"detail": [str(exc)]})

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
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        return response_data(data=build_interview_context(session))

    # PATCH /sessions/{room_name}/status/ — cập nhật trạng thái
    @action(detail=False, methods=['patch'], url_path='(?P<room_name>[^/.]+)/status',
            permission_classes=[permissions.AllowAny])
    def update_status(self, request, room_name=None):
        """Cập nhật trạng thái (cho Agent hoặc Frontend)."""
        try:
            session = InterviewSession.objects.get(room_name=room_name)
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = update_interview_status(session, serializer.validated_data['status'])
        return response_data(data={"status": new_status})

    # POST /sessions/{room_name}/append-transcription/
    @action(detail=False, methods=['post'], url_path='(?P<room_name>[^/.]+)/append-transcription',
            permission_classes=[permissions.AllowAny])
    def append_transcription(self, request, room_name=None):
        """Agent gửi transcript hội thoại."""
        try:
            session = InterviewSession.objects.get(room_name=room_name)
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        serializer = AppendTranscriptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transcript = append_transcript(session, serializer.validated_data)
        return response_data(
            status=status.HTTP_201_CREATED,
            data=InterviewTranscriptSerializer(transcript).data,
        )

    # POST /sessions/{pk}/evaluate-ai/
    @action(detail=True, methods=['post'], url_path='evaluate-ai',
            permission_classes=[permissions.IsAuthenticated])
    def evaluate_ai(self, request, pk=None):
        """Manually trigger AI evaluation for this session."""
        session = self.get_object()
        queue_ai_evaluation(session)
        return response_data(data={"detail": "AI evaluation task has been queued."})

    # POST /sessions/{pk}/observer-token/
    @action(detail=True, methods=['post'], url_path='observer-token',
            permission_classes=[permissions.IsAuthenticated])
    def observer_token(self, request, pk=None):
        """Create a hidden LiveKit token for employer to observe interview silently."""
        session = self.get_object()
        try:
            data = create_observer_livekit_token(session, request)
            return response_data(data=data)
        except SessionNotJoinableError as exc:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": [str(exc)], "code": "SESSION_NOT_JOINABLE"}
            )
        except ValueError as exc:
            return response_data(status=status.HTTP_400_BAD_REQUEST, errors={"detail": [str(exc)]})

    # GET /sessions/{pk}/live-metrics/
    @action(detail=True, methods=['get'], url_path='live-metrics',
            permission_classes=[permissions.IsAuthenticated])
    def live_metrics(self, request, pk=None):
        """Return realtime metrics for an interview session."""
        session = self.get_object()
        questions = get_session_questions(session)
        total_questions = questions.count()
        transcript_count = session.transcripts.count()

        elapsed = None
        if session.start_time:
            from django.utils import timezone
            now = session.end_time or timezone.now()
            elapsed = int((now - session.start_time).total_seconds())

        return response_data(data={
            "sessionId": session.id,
            "status": session.status,
            "startTime": session.start_time.isoformat() if session.start_time else None,
            "endTime": session.end_time.isoformat() if session.end_time else None,
            "elapsedSeconds": elapsed,
            "duration": session.duration,
            "questionCursor": session.question_cursor,
            "totalQuestions": total_questions,
            "transcriptCount": transcript_count,
            "candidateName": session.candidate.full_name if session.candidate else None,
            "jobName": session.job_post.job_name if session.job_post else None,
        })

class InterviewEvaluationViewSet(viewsets.ModelViewSet):
    queryset = InterviewEvaluation.objects.select_related('interview', 'evaluator').all()
    serializer_class = InterviewEvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['interview', 'result']

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return self.queryset.none()
        role = getattr(user, 'role_name', None)
        if role == 'EMPLOYER':
            company = user.get_active_company() if hasattr(user, 'get_active_company') else None
            if company:
                return self.queryset.filter(interview__job_post__company=company)
            return self.queryset.filter(evaluator=user)
        elif role == 'ADMIN':
            return self.queryset.all()
        # Job seeker: only evaluations on their own interviews
        return self.queryset.filter(interview__candidate=user)

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)

class AdminInterviewSessionReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin-only read access to interview sessions for monitoring."""
    queryset = InterviewSession.objects.select_related(
        'candidate', 'job_post', 'created_by'
    ).prefetch_related('questions', 'transcripts', 'evaluations').all()
    permission_classes = [perms_custom.IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'type']
    search_fields = ['room_name', 'candidate__full_name', 'candidate__email', 'job_post__job_name']
    ordering_fields = ['create_at', 'status', 'start_time']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InterviewSessionDetailSerializer
        return InterviewSessionListSerializer
