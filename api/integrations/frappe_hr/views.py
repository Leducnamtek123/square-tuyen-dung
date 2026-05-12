from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from apps.accounts import permissions as perms_custom
from apps.jobs.models import JobPostActivity
from shared.configs import variable_response as var_res
from shared.configs import variable_system as var_sys

from .client import FrappeHRAPIError, FrappeHRConfigurationError
from .serializers import FrappeEmployeeFromApplicationSerializer
from .services import FrappeHRSyncService, sync_application


def _activity_url(employee_name: str) -> str:
    if not employee_name:
        return ""
    base = (settings.FRAPPE_HR_PUBLIC_URL or settings.FRAPPE_HR_BASE_URL).rstrip("/")
    return f"{base}/app/employee/{employee_name}"


def _sync_payload(activity: JobPostActivity, result=None) -> dict:
    employee_name = activity.frappe_employee_id
    return {
        "id": activity.id,
        "applicationId": activity.id,
        "status": activity.status,
        "statusName": var_sys.ApplicationStatus(activity.status).label if activity.status else "",
        "hrmEmployeeId": employee_name,
        "hrmUserId": activity.frappe_user_id,
        "hrmSyncStatus": activity.frappe_sync_status,
        "hrmSyncError": activity.frappe_sync_error,
        "hrmSyncedAt": activity.frappe_synced_at,
        "hrmEmployeeUrl": result.public_url if result else _activity_url(employee_name),
        "recruiterUserId": (result.recruiter_user or {}).get("name", "") if result else "",
    }


class FrappeEmployeeBridgeViewSet(viewsets.ViewSet):
    permission_classes = [perms_custom.IsEmployerUser]

    def _get_company_activity(self, application_id: int, request) -> JobPostActivity:
        activity = (
            JobPostActivity.objects.select_related("user", "job_post", "job_post__company")
            .filter(pk=application_id, is_deleted=False)
            .first()
        )
        if not activity or activity.job_post.company != request.user.active_company:
            raise ValidationError({"applicationId": ["Application not found for this company."]})
        return activity

    @action(methods=["post"], detail=False, url_path="from-application", url_name="frappe-employee-from-application")
    def from_application(self, request):
        serializer = FrappeEmployeeFromApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application_id = serializer.validated_data["applicationId"]
        activity = self._get_company_activity(application_id, request)

        try:
            result = sync_application(activity, request.user, serializer.validated_data)
        except FrappeHRConfigurationError as exc:
            return var_res.response_data(
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
                errors={"code": "FRAPPE_HR_NOT_CONFIGURED", "message": str(exc)},
            )
        except FrappeHRAPIError as exc:
            return var_res.response_data(
                status=status.HTTP_502_BAD_GATEWAY,
                errors={"code": "FRAPPE_HR_SYNC_FAILED", "message": str(exc), "details": exc.details},
            )

        activity.refresh_from_db()
        return var_res.response_data(status=status.HTTP_200_OK, data=_sync_payload(activity, result))

    @action(methods=["post"], detail=False, url_path="provision-current-user", url_name="frappe-provision-current-user")
    def provision_current_user(self, request):
        company = getattr(request.user, "active_company", None)
        if not company:
            raise ValidationError({"company": ["No active company selected."]})
        try:
            service = FrappeHRSyncService()
            frappe_company = service.ensure_company(company)
            user = service.provision_recruiter_account(request.user, frappe_company.get("name") if frappe_company else None)
        except FrappeHRConfigurationError as exc:
            return var_res.response_data(
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
                errors={"code": "FRAPPE_HR_NOT_CONFIGURED", "message": str(exc)},
            )
        except FrappeHRAPIError as exc:
            return var_res.response_data(
                status=status.HTTP_502_BAD_GATEWAY,
                errors={"code": "FRAPPE_HR_SYNC_FAILED", "message": str(exc), "details": exc.details},
            )
        return var_res.response_data(data={"userId": (user or {}).get("name", ""), "companyId": (frappe_company or {}).get("name", "")})


class FrappeStatusViewSet(viewsets.ViewSet):
    permission_classes = [perms_custom.IsEmployerUser]

    def list(self, request):
        return var_res.response_data(
            data={
                "enabled": bool(settings.FRAPPE_HR_BASE_URL),
                "baseUrl": settings.FRAPPE_HR_PUBLIC_URL or settings.FRAPPE_HR_BASE_URL,
                "siteName": settings.FRAPPE_HR_SITE_NAME,
            }
        )
