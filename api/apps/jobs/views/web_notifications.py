from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from django.db.models import Q

from apps.accounts import permissions as perms_custom
from shared import pagination as paginations
from shared import renderers
from shared.configs import app_setting
from shared.configs import variable_response as var_res
from shared.configs.messages import ERROR_MESSAGES

from ..models import JobPostNotification
from ..serializers import JobPostNotificationSerializer


def _coerce_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes", "on"}:
            return True
        if normalized in {"false", "0", "no", "off", ""}:
            return False
    raise ValueError("isActive must be a boolean value.")


class JobPostNotificationViewSet(
    viewsets.ViewSet,
    generics.CreateAPIView,
    generics.ListAPIView,
    generics.UpdateAPIView,
    generics.DestroyAPIView,
):
    def get_queryset(self):
        return JobPostNotification.objects.filter(user=self.request.user)

    serializer_class = JobPostNotificationSerializer
    renderer_classes = [renderers.MyJSONRenderer]
    pagination_class = paginations.CustomPagination
    permission_classes = [perms_custom.IsJobSeekerUser]

    def list(self, request, *args, **kwargs):
        user = request.user
        queryset = self.get_queryset().filter(user=user).order_by('-is_active', '-update_at')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                fields=[
                    "id",
                    "jobName",
                    "salary",
                    "frequency",
                    "isActive",
                    "career",
                    "city",
                ],
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return var_res.response_data(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            fields=[
                "id",
                "jobName",
                "position",
                "experience",
                "salary",
                "frequency",
                "career",
                "city",
            ],
        )
        return var_res.response_data(data=serializer.data)

    def _apply_active_change(self, request, job_post_notification):
        user = request.user
        desired = request.data.get("isActive", request.data.get("is_active", None))
        if desired is None:
            desired = not job_post_notification.is_active
        else:
            try:
                desired = _coerce_bool(desired)
            except ValueError as ex:
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    errors={"errorMessage": [str(ex)]},
                )

        if desired and not job_post_notification.is_active:
            active_count = JobPostNotification.objects.filter(user=user, is_active=True).exclude(
                id=job_post_notification.id
            ).count()
            if active_count >= app_setting.MAX_ACTIVE_JOB_NOTIFICATIONS:
                return var_res.response_data(
                    status=status.HTTP_400_BAD_REQUEST,
                    data={"errorMessage": [ERROR_MESSAGES["MAX_ACTIVE_JOB_NOTIFICATIONS"]]},
                )

        job_post_notification.is_active = desired
        job_post_notification.save(update_fields=["is_active", "update_at"])
        return var_res.response_data(data={"isActive": job_post_notification.is_active})

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if "isActive" in request.data or "is_active" in request.data:
            return self._apply_active_change(request, instance)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not request.data or "isActive" in request.data or "is_active" in request.data:
            return self._apply_active_change(request, instance)
        return super().partial_update(request, *args, **kwargs)


class AdminJobPostNotificationViewSet(viewsets.ModelViewSet):
    queryset = JobPostNotification.objects.select_related('user', 'career', 'city').all().order_by('id')
    serializer_class = JobPostNotificationSerializer
    permission_classes = [perms_custom.IsAdminUser]
    pagination_class = paginations.CustomPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("kw") or self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(job_name__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(career__name__icontains=search)
                | Q(city__name__icontains=search)
            )

        ordering = self.request.query_params.get("ordering")
        ordering_map = {
            "id": "id",
            "jobName": "job_name",
            "frequency": "frequency",
            "salary": "salary",
            "isActive": "is_active",
            "createAt": "create_at",
            "updateAt": "update_at",
        }
        if ordering:
            is_desc = ordering.startswith("-")
            key = ordering[1:] if is_desc else ordering
            mapped = ordering_map.get(key)
            if mapped:
                queryset = queryset.order_by(f"-{mapped}" if is_desc else mapped)
        return queryset
