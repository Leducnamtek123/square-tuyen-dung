import logging
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.response import Response

from .models import AsyncOperation, OperationStatus
from .serializers import AsyncOperationSerializer

logger = logging.getLogger(__name__)


def _get_active_company(request):
    user = request.user
    if not user or not user.is_authenticated:
        return None
    if hasattr(user, "get_active_company"):
        return user.get_active_company()
    return getattr(user, "active_company", None)


def _can_access_operation(user, op: AsyncOperation) -> bool:
    # If op has no user and no company, it's public/system -> allow read
    if op.user_id is None and op.company_id is None:
        return True

    if not user or not user.is_authenticated:
        return False

    # Admin access
    if user.is_staff or user.is_superuser or getattr(user, "role_name", None) == "admin":
        return True

    # User match
    if op.user_id and op.user_id == user.id:
        return True

    # Company match
    if op.company_id:
        active_company = user.get_active_company() if hasattr(user, "get_active_company") else getattr(user, "active_company", None)
        if active_company and active_company.id == op.company_id:
            return True
        if getattr(user, "company_id", None) == op.company_id:
            return True
        try:
            from apps.profiles.models import CompanyMember
            if CompanyMember.objects.filter(company_id=op.company_id, user=user, is_active=True).exists():
                return True
        except Exception:
            pass

    return False


class OperationDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id: str):
        op = AsyncOperation.objects.filter(id=id).first()
        if not op:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _can_access_operation(request.user, op):
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication credentials were not provided."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AsyncOperationSerializer(op)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActiveOperationsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = AsyncOperation.objects.filter(status__in=[OperationStatus.QUEUED, OperationStatus.RUNNING])

        op_type = request.query_params.get("type")
        if op_type:
            queryset = queryset.filter(type=op_type)

        if request.user.is_authenticated:
            is_admin = (
                request.user.is_staff
                or request.user.is_superuser
                or getattr(request.user, "role_name", None) == "admin"
            )
            if not is_admin:
                company = _get_active_company(request)
                q_filter = Q(user=request.user)
                if company:
                    q_filter |= Q(company=company)
                queryset = queryset.filter(q_filter)
        else:
            queryset = queryset.filter(user__isnull=True, company__isnull=True)

        serializer = AsyncOperationSerializer(queryset, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)


class CancelOperationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, id: str):
        op = AsyncOperation.objects.filter(id=id).first()
        if not op:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _can_access_operation(request.user, op):
            if not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication credentials were not provided."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if op.status not in [OperationStatus.QUEUED, OperationStatus.RUNNING]:
            return Response(
                {
                    "success": False,
                    "detail": f"Operation cannot be cancelled in status '{op.status}'.",
                    "operation": AsyncOperationSerializer(op).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        op.status = OperationStatus.CANCELLED
        op.finished_at = timezone.now()
        op.save()

        # Optional Celery revocation if task ID exists
        if isinstance(op.metadata, dict):
            celery_task_id = op.metadata.get("celeryTaskId") or op.metadata.get("celery_task_id")
            if celery_task_id:
                try:
                    from celery import current_app
                    current_app.control.revoke(celery_task_id, terminate=True)
                except Exception as e:
                    logger.warning(f"Could not revoke Celery task {celery_task_id}: {e}")

        serializer = AsyncOperationSerializer(op)
        return Response({"success": True, "operation": serializer.data}, status=status.HTTP_200_OK)
