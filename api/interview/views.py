"""
Interview Module — DRF Views
"""

from datetime import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewTranscript, InterviewEvaluation
)
from .serializers import (
    QuestionSerializer, QuestionGroupSerializer,
    InterviewSessionListSerializer, InterviewSessionDetailSerializer,
    InterviewSessionCreateSerializer,
    InterviewTranscriptSerializer, InterviewEvaluationSerializer,
    InterviewContextSerializer, AppendTranscriptSerializer, UpdateStatusSerializer
)
from .livekit_service import LiveKitService


# ============================================================
# Question ViewSet
# ============================================================

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'career', 'difficulty']
    search_fields = ['text']
    ordering_fields = ['sort_order', 'create_at']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        role = getattr(user, 'role_name', None)
        
        if role == 'EMPLOYER' and hasattr(user, 'company') and user.company:
            from django.db.models import Q
            return qs.filter(Q(company__isnull=True) | Q(company=user.company))
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role_name', None)
        if role == 'EMPLOYER' and hasattr(user, 'company') and user.company:
            serializer.save(author=user, company=user.company)
        else:
            serializer.save(author=user)


# ============================================================
# QuestionGroup ViewSet
# ============================================================

class QuestionGroupViewSet(viewsets.ModelViewSet):
    queryset = QuestionGroup.objects.prefetch_related('questions').all()
    serializer_class = QuestionGroupSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['create_at', 'name']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        role = getattr(user, 'role_name', None)
        
        if role == 'EMPLOYER' and hasattr(user, 'company') and user.company:
            from django.db.models import Q
            return qs.filter(Q(company__isnull=True) | Q(company=user.company))
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role_name', None)
        if role == 'EMPLOYER' and hasattr(user, 'company') and user.company:
            serializer.save(author=user, company=user.company)
        else:
            serializer.save(author=user)


# ============================================================
# InterviewSession ViewSet
# ============================================================

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

        participant_identity = f"candidate-{session.candidate_id}"
        participant_name = session.candidate.full_name or session.candidate.email or participant_identity
        token = LiveKitService.create_token(
            room_name=session.room_name,
            participant_identity=participant_identity,
            participant_name=participant_name,
            is_agent=False
        )

        return Response({
            "token": token,
            "room_name": session.room_name,
            "participant_identity": participant_identity
        })

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

        context_data = {
            "candidateName": session.candidate.full_name,
            "candidateEmail": session.candidate.email,
            "jobTitle": session.job_post.job_name if session.job_post else None,
            "questions": [{"text": q.text, "category": q.category} for q in session.questions.all()],
            "interviewType": session.type,
        }
        return Response(context_data)

    # PATCH /sessions/{room_name}/status/ — cập nhật trạng thái
    @action(detail=False, methods=['patch'], url_path='(?P<room_name>[^/.]+)/status',
            permission_classes=[permissions.AllowAny])
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

        new_status = serializer.validated_data['status']
        session.status = new_status

        from django.utils import timezone as tz
        if new_status == 'in_progress' and not session.start_time:
            session.start_time = tz.now()
        elif new_status == 'completed' and not session.end_time:
            session.end_time = tz.now()
            if session.start_time:
                session.duration = int((session.end_time - session.start_time).total_seconds())

        session.save()

        # Trigger AI Evaluation if completed
        if new_status == 'completed':
            from .tasks import evaluate_interview_session
            evaluate_interview_session.delay(session.id)
            
        return Response({"status": new_status})

    # POST /sessions/{room_name}/append-transcription/
    @action(detail=False, methods=['post'], url_path='(?P<room_name>[^/.]+)/append-transcription',
            permission_classes=[permissions.AllowAny])
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

        transcript = InterviewTranscript.objects.create(
            interview=session,
            **serializer.validated_data
        )
        return Response(
            InterviewTranscriptSerializer(transcript).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# InterviewEvaluation ViewSet
# ============================================================

class InterviewEvaluationViewSet(viewsets.ModelViewSet):
    queryset = InterviewEvaluation.objects.select_related('interview', 'evaluator').all()
    serializer_class = InterviewEvaluationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['interview', 'result']

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)
