"""
Interview Module — DRF Views
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError

from shared.configs import variable_system as var_sys
from shared.configs.variable_response import response_data
from shared.audit import AuditLogViewSetMixin, record_audit_log
from config.django_threading import run_django_sync_in_thread
from .agent_auth import SIGNATURE_HEADER, TIMESTAMP_HEADER, verify_interview_agent_request

from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewEvaluation,
    VoiceProfile, VoiceProfileSample, VoiceProfileGrant
)
from .serializers import (
    QuestionSerializer, QuestionGroupSerializer,
    InterviewSessionListSerializer, InterviewSessionDetailSerializer,
    InterviewSessionCreateSerializer,
    InterviewTranscriptSerializer, InterviewEvaluationSerializer,
    VoiceProfileSerializer, VoiceProfileSampleSerializer, VoiceProfileGrantSerializer,
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
    create_hr_presence_livekit_token,
    get_session_questions,
    SessionNotJoinableError,
)
from apps.accounts import permissions as perms_custom
from shared.helpers import helper


def _update_interview_status_by_room(room_name: str, new_status: str) -> str:
    session = InterviewSession.objects.get(room_name=room_name)
    return update_interview_status(session, new_status)


INVITE_TOKEN_STATUS_UPDATES = {"calibration", "in_progress", "completed", "interrupted"}


def _is_admin_user(user) -> bool:
    role = getattr(user, "role_name", None)
    return role == var_sys.ADMIN or getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)


def _resolve_active_company(user):
    try:
        return user.get_active_company()
    except Exception:
        return None


def _clear_default_voice_grants(grant: VoiceProfileGrant) -> None:
    if not grant.is_default:
        return

    qs = VoiceProfileGrant.objects.filter(is_active=True, is_default=True).exclude(id=grant.id)
    if grant.job_post_id:
        qs = qs.filter(job_post_id=grant.job_post_id)
    else:
        qs = qs.filter(company_id=grant.company_id, job_post__isnull=True)
    qs.update(is_default=False)


def _user_can_use_voice_profile(user, profile: VoiceProfile | None, job_post=None) -> bool:
    if not profile:
        return True
    if profile.status != VoiceProfile.STATUS_READY:
        return False
    if _is_admin_user(user):
        return True

    company = _resolve_active_company(user)
    company_id = getattr(company, "id", None)
    job_post_company_id = getattr(job_post, "company_id", None) if job_post else None
    if not company_id:
        return False
    if job_post_company_id and job_post_company_id != company_id:
        return False

    target_filter = Q(company_id=company_id, job_post__isnull=True)
    if job_post:
        target_filter |= Q(job_post_id=job_post.id)

    return VoiceProfileGrant.objects.filter(
        profile=profile,
        is_active=True,
    ).filter(target_filter).exists()


def _request_has_agent_auth_headers(request) -> bool:
    django_request = getattr(request, "_request", request)
    return bool(
        django_request.META.get(TIMESTAMP_HEADER)
        or django_request.META.get(SIGNATURE_HEADER)
    )


def _user_can_update_status(user, session: InterviewSession) -> bool:
    if not getattr(user, "is_authenticated", False):
        return False

    role = str(getattr(user, "role_name", "") or "").upper()
    if role == var_sys.ADMIN or getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
        return True
    if role == var_sys.JOB_SEEKER:
        return session.candidate_id == user.id
    if role == var_sys.EMPLOYER:
        if session.created_by_id == user.id:
            return True
        try:
            company = user.get_active_company()
        except Exception:
            company = None
        return bool(company and session.job_post_id and session.job_post.company_id == company.id)
    return False


def _invite_token_can_update_status(request, session: InterviewSession, new_status: str) -> bool:
    invite_token = request.data.get("invite_token") or request.data.get("inviteToken")
    return bool(
        invite_token
        and session.invite_token
        and invite_token == session.invite_token
        and new_status in INVITE_TOKEN_STATUS_UPDATES
    )


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


class VoiceProfileViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = (
        VoiceProfile.objects.select_related("created_by")
        .prefetch_related("samples", "samples__audio_file", "grants", "grants__company", "grants__job_post")
        .all()
    )
    serializer_class = VoiceProfileSerializer
    permission_classes = [perms_custom.IsEmployerOrAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "preset_voice_id"]
    ordering_fields = ["name", "create_at", "status"]

    def _ensure_admin(self, request):
        if not _is_admin_user(request.user):
            return response_data(status=status.HTTP_403_FORBIDDEN, errors={"detail": ["Admin permission required."]})
        return None

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if _is_admin_user(user):
            status_param = self.request.query_params.get("status")
            voice_type = self.request.query_params.get("voiceType") or self.request.query_params.get("voice_type")
            if status_param:
                qs = qs.filter(status=status_param)
            if voice_type:
                qs = qs.filter(voice_type=voice_type)
            return qs.distinct()

        company = _resolve_active_company(user)
        if not company:
            return qs.none()
        return (
            qs.filter(
                status=VoiceProfile.STATUS_READY,
                grants__is_active=True,
            )
            .filter(Q(grants__company=company) | Q(grants__job_post__company=company))
            .distinct()
        )

    def perform_create(self, serializer):
        profile = serializer.save(created_by=self.request.user)
        if profile.voice_type == VoiceProfile.TYPE_PRESET and profile.status == VoiceProfile.STATUS_DRAFT:
            profile.status = VoiceProfile.STATUS_READY
            profile.save(update_fields=["status", "update_at"])
        self._audit_instance("create", profile)

    def create(self, request, *args, **kwargs):
        admin_error = self._ensure_admin(request)
        if admin_error:
            return admin_error
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        admin_error = self._ensure_admin(request)
        if admin_error:
            return admin_error
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        admin_error = self._ensure_admin(request)
        if admin_error:
            return admin_error
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        admin_error = self._ensure_admin(request)
        if admin_error:
            return admin_error
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="samples")
    def add_sample(self, request, pk=None):
        admin_error = self._ensure_admin(request)
        if admin_error:
            return admin_error

        profile = self.get_object()
        audio_file = (
            request.FILES.get("audio")
            or request.FILES.get("audioFile")
            or request.FILES.get("file")
        )
        reference_text = (
            request.data.get("reference_text")
            or request.data.get("referenceText")
            or ""
        ).strip()

        if not audio_file:
            return response_data(status=status.HTTP_400_BAD_REQUEST, errors={"audio": ["Audio file is required."]})
        if not reference_text:
            return response_data(status=status.HTTP_400_BAD_REQUEST, errors={"referenceText": ["Reference transcript is required."]})

        from apps.files.models import File
        from shared.helpers.cloudinary_service import CloudinaryService

        upload_result = CloudinaryService.upload_file(audio_file, "voice-profiles")
        if not upload_result:
            return response_data(status=status.HTTP_502_BAD_GATEWAY, errors={"audio": ["Audio upload failed."]})

        file_record = File.update_or_create_file_with_cloudinary(None, upload_result, File.OTHER_TYPE)
        sample = VoiceProfileSample.objects.create(
            profile=profile,
            audio_file=file_record,
            reference_text=reference_text,
            original_filename=getattr(audio_file, "name", "") or "",
            sort_order=profile.samples.count(),
            created_by=request.user,
        )

        if profile.voice_type == VoiceProfile.TYPE_CLONED and profile.status in {VoiceProfile.STATUS_DRAFT, VoiceProfile.STATUS_PROCESSING, VoiceProfile.STATUS_FAILED}:
            profile.status = VoiceProfile.STATUS_READY
            profile.save(update_fields=["status", "update_at"])

        self._audit_instance("create", sample)
        return response_data(status=status.HTTP_201_CREATED, data=VoiceProfileSampleSerializer(sample, context={"request": request}).data)

    @action(detail=True, methods=["get", "post"], url_path="grants")
    def grants(self, request, pk=None):
        admin_error = self._ensure_admin(request)
        if admin_error:
            return admin_error

        profile = self.get_object()

        if request.method == "GET":
            serializer = VoiceProfileGrantSerializer(profile.grants.select_related("company", "job_post").all(), many=True)
            return response_data(data=serializer.data)

        payload = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        payload["profile"] = profile.id
        serializer = VoiceProfileGrantSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        grant = serializer.save(granted_by=request.user)
        _clear_default_voice_grants(grant)
        self._audit_instance("create", grant)
        return response_data(status=status.HTTP_201_CREATED, data=VoiceProfileGrantSerializer(grant).data)


class VoiceProfileGrantViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = VoiceProfileGrant.objects.select_related("profile", "company", "job_post", "granted_by").all()
    serializer_class = VoiceProfileGrantSerializer
    permission_classes = [perms_custom.IsAdminUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["profile__name", "company__company_name", "job_post__job_name"]
    ordering_fields = ["create_at", "is_default"]

    def perform_create(self, serializer):
        grant = serializer.save(granted_by=self.request.user)
        _clear_default_voice_grants(grant)
        self._audit_instance("create", grant)

    def perform_update(self, serializer):
        grant = serializer.save()
        _clear_default_voice_grants(grant)
        self._audit_instance("update", grant)


class QuestionViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = Question.objects.select_related('career', 'career__icon', 'company', 'author').all()
    serializer_class = QuestionSerializer
    permission_classes = [perms_custom.IsEmployerOrAdminUser]
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
            question = serializer.save(author=user, company=company)
        else:
            question = serializer.save(author=user)
        self._audit_instance("create", question)


class QuestionGroupViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    queryset = QuestionGroup.objects.prefetch_related('questions', 'questions__career', 'questions__career__icon').select_related('company', 'author').all()
    serializer_class = QuestionGroupSerializer
    permission_classes = [perms_custom.IsEmployerOrAdminUser]
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
            group = serializer.save(author=user, company=company)
        else:
            group = serializer.save(author=user)
        self._audit_instance("create", group)

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as ex:
            helper.print_log_error("QuestionGroupViewSet.list", ex)
            return response_data(data={"count": 0, "results": []})


class InterviewSessionViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
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
            'candidate', 'job_post', 'created_by', 'voice_profile'
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
        voice_profile = serializer.validated_data.get("voice_profile")
        job_post = serializer.validated_data.get("job_post")
        if not _user_can_use_voice_profile(self.request.user, voice_profile, job_post):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Voice profile is not available for this company or job post.")
        session = serializer.save(created_by=self.request.user)
        self._audit_instance("create", session)
        queue_invitation_email(session.id)

    def perform_update(self, serializer):
        voice_profile = serializer.validated_data.get("voice_profile", getattr(serializer.instance, "voice_profile", None))
        job_post = serializer.validated_data.get("job_post", getattr(serializer.instance, "job_post", None))
        if not _user_can_use_voice_profile(self.request.user, voice_profile, job_post):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Voice profile is not available for this company or job post.")
        session = serializer.save()
        self._audit_instance("update", session)

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
        auth_error = verify_interview_agent_request(request)
        if auth_error is not None:
            return auth_error
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
        auth_error = verify_interview_agent_request(request)
        if auth_error is not None and _request_has_agent_auth_headers(request):
            return auth_error
        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        requested_status = serializer.validated_data['status']

        try:
            session = InterviewSession.objects.select_related(
                "candidate",
                "job_post",
                "job_post__company",
                "created_by",
            ).get(room_name=room_name)
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        auth_mode = "agent"
        if auth_error is not None:
            invite_allowed = _invite_token_can_update_status(request, session, requested_status)
            user_allowed = _user_can_update_status(request.user, session)
            if not invite_allowed and not user_allowed:
                return auth_error
            auth_mode = "invite_token" if invite_allowed else "user"

        try:
            new_status = run_django_sync_in_thread(
                _update_interview_status_by_room,
                room_name,
                requested_status,
            )
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )
        except (DjangoValidationError, ValueError) as exc:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": [str(exc)]},
            )

        record_audit_log(
            request=request,
            action="status_change",
            resource_type="interviews.InterviewSession",
            resource_id=room_name,
            resource_repr=room_name or "",
            metadata={"status": new_status, "authMode": auth_mode, "agentEndpoint": auth_mode == "agent"},
        )
        return response_data(data={"status": new_status})

    # POST /sessions/{room_name}/append-transcription/
    @action(detail=False, methods=['post'], url_path='(?P<room_name>[^/.]+)/append-transcription',
            permission_classes=[permissions.AllowAny])
    def append_transcription(self, request, room_name=None):
        """Agent gửi transcript hội thoại."""
        auth_error = verify_interview_agent_request(request)
        if auth_error is not None:
            return auth_error
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

    # POST /sessions/{pk}/hr-token/
    @action(detail=True, methods=['post'], url_path='hr-token',
            permission_classes=[permissions.IsAuthenticated])
    def hr_token(self, request, pk=None):
        """
        Tạo token cho HR tham gia hiện diện.
        Ứng viên thấy HR trong phòng, HR có thể gửi chat message.
        HR không publish audio/video để không làm rối AI agent.
        """
        session = self.get_object()
        try:
            data = create_hr_presence_livekit_token(session, request)
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


class InterviewEvaluationViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
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
        evaluation = serializer.save(evaluator=self.request.user)
        self._audit_instance("create", evaluation)


class ScreeningResultAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _can_view(self, user, session: InterviewSession) -> bool:
        role = getattr(user, "role_name", None)
        if role == "JOB_SEEKER":
            return session.candidate_id == user.id
        if role == "EMPLOYER":
            if session.created_by_id == user.id:
                return True
            try:
                company = user.get_active_company()
            except Exception:
                company = None
            return bool(company and session.job_post and session.job_post.company_id == company.id)
        return role == "ADMIN" or getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)

    def get(self, request, session_id: int):
        try:
            session = InterviewSession.objects.select_related(
                "candidate", "job_post", "job_post__company", "created_by"
            ).get(id=session_id)
        except InterviewSession.DoesNotExist:
            return response_data(
                status=status.HTTP_404_NOT_FOUND,
                errors={"detail": ["Interview session not found."]},
            )

        if not self._can_view(request.user, session):
            return response_data(status=status.HTTP_403_FORBIDDEN)

        return response_data(data={
            "id": session.id,
            "status": session.status,
            "score": session.ai_overall_score,
            "technical_score": session.ai_technical_score,
            "communication_score": session.ai_communication_score,
            "summary": session.ai_summary,
            "strengths": session.ai_strengths or [],
            "weaknesses": session.ai_weaknesses or [],
            "detailed_feedback": session.ai_detailed_feedback or {},
            "candidate_name": session.candidate.full_name if session.candidate else None,
            "candidate_email": session.candidate.email if session.candidate else None,
            "job_name": session.job_post.job_name if session.job_post else None,
            "company_name": (
                session.job_post.company.company_name
                if session.job_post and session.job_post.company
                else None
            ),
            "create_at": session.create_at,
            "update_at": session.update_at,
        })


class AdminInterviewSessionReadOnlyViewSet(AuditLogViewSetMixin, viewsets.ModelViewSet):
    """Admin-only access to interview sessions for monitoring and status control."""
    queryset = InterviewSession.objects.select_related(
        'candidate', 'job_post', 'job_post__company', 'created_by', 'voice_profile'
    ).prefetch_related('questions', 'transcripts', 'evaluations').all()
    permission_classes = [perms_custom.IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'type']
    search_fields = ['room_name', 'candidate__full_name', 'candidate__email', 'job_post__job_name']
    ordering_fields = ['create_at', 'status', 'start_time', 'scheduled_at']
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        queryset = super().get_queryset()
        kw = self.request.query_params.get("kw")
        if kw:
            queryset = queryset.filter(
                Q(room_name__icontains=kw)
                | Q(candidate__full_name__icontains=kw)
                | Q(candidate__email__icontains=kw)
                | Q(job_post__job_name__icontains=kw)
                | Q(job_post__company__company_name__icontains=kw)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InterviewSessionDetailSerializer
        return InterviewSessionListSerializer

    def partial_update(self, request, *args, **kwargs):
        session = self.get_object()
        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            update_interview_status(session, serializer.validated_data['status'])
        except DjangoValidationError as exc:
            return response_data(
                status=status.HTTP_400_BAD_REQUEST,
                errors={"detail": [str(exc)]},
            )

        session.refresh_from_db()
        record_audit_log(
            request=request,
            action="status_change",
            instance=session,
            metadata={"status": serializer.validated_data["status"]},
        )
        return response_data(data=InterviewSessionDetailSerializer(session).data)

    def destroy(self, request, *args, **kwargs):
        session = self.get_object()
        session.delete()
        return response_data(status=status.HTTP_204_NO_CONTENT)
