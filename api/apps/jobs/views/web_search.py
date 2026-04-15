import datetime

from rest_framework import permissions as perms_sys
from rest_framework.decorators import api_view, permission_classes

from shared.configs import variable_response as var_res
from shared.configs import variable_system as var_sys

from ..models import JobPost


@api_view(http_method_names=['get'])
@permission_classes([perms_sys.AllowAny])
def job_suggest_title_search(request):
    q = (request.GET.get('q', '') or '').strip()
    if not q:
        return var_res.response_data(data=[])

    data = list(
        JobPost.objects.filter(
            status=var_sys.JobPostStatus.APPROVED,
            deadline__gte=datetime.datetime.now().date(),
            job_name__icontains=q,
        )
        .order_by('job_name')
        .values_list('job_name', flat=True)
        .distinct()[:5]
    )

    return var_res.response_data(data=data)
