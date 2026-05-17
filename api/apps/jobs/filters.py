
from django.core.exceptions import ValidationError

from requests.compat import basestring

from shared.configs import variable_system as var_sys

from shared.helpers import utils

from django.db.models import Q

import django_filters

from rest_framework.filters import OrderingFilter

from .models import (

    JobPost,

    JobPostActivity

)

class JobPostFilter(django_filters.FilterSet):

    class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
        pass

    class ChoiceInFilter(django_filters.BaseInFilter, django_filters.ChoiceFilter):
        pass

    kw = django_filters.CharFilter(method="job_name_or_career_name")

    careerId = django_filters.NumberFilter(field_name='career')
    careerIds = NumberInFilter(field_name='career', lookup_expr='in')

    cityId = django_filters.NumberFilter(field_name='location__city')
    cityIds = NumberInFilter(field_name='location__city', lookup_expr='in')

    districtId = django_filters.NumberFilter(field_name='location__district')
    districtIds = NumberInFilter(field_name='location__district', lookup_expr='in')

    wardId = django_filters.NumberFilter(field_name='location__ward')
    wardIds = NumberInFilter(field_name='location__ward', lookup_expr='in')

    positionId = django_filters.ChoiceFilter(choices=var_sys.POSITION_CHOICES, field_name='position')
    positionIds = ChoiceInFilter(choices=var_sys.POSITION_CHOICES, field_name='position', lookup_expr='in')

    experienceId = django_filters.ChoiceFilter(choices=var_sys.EXPERIENCE_CHOICES, field_name='experience')
    experienceIds = ChoiceInFilter(choices=var_sys.EXPERIENCE_CHOICES, field_name='experience', lookup_expr='in')

    typeOfWorkplaceId = django_filters.ChoiceFilter(choices=var_sys.TYPE_OF_WORKPLACE_CHOICES,

                                                    field_name='type_of_workplace')
    typeOfWorkplaceIds = ChoiceInFilter(
        choices=var_sys.TYPE_OF_WORKPLACE_CHOICES,
        field_name='type_of_workplace',
        lookup_expr='in'
    )

    jobTypeId = django_filters.ChoiceFilter(choices=var_sys.JOB_TYPE_CHOICES, field_name='job_type')
    jobTypeIds = ChoiceInFilter(choices=var_sys.JOB_TYPE_CHOICES, field_name='job_type', lookup_expr='in')

    genderId = django_filters.ChoiceFilter(choices=var_sys.GENDER_CHOICES, field_name='gender_required')
    genderIds = ChoiceInFilter(choices=var_sys.GENDER_CHOICES, field_name='gender_required', lookup_expr='in')

    isUrgent = django_filters.BooleanFilter(field_name='is_urgent')

    statusId = django_filters.ChoiceFilter(choices=var_sys.JOB_POST_STATUS, field_name="status")
    statusIds = ChoiceInFilter(choices=var_sys.JOB_POST_STATUS, field_name="status", lookup_expr='in')

    excludeSlug = django_filters.CharFilter(method="exclude_slug")

    companyId = django_filters.NumberFilter(field_name="company")

    class Meta:

        model = JobPost

        fields = ['kw', 'careerId', 'cityId', 'districtId', 'wardId', 'positionId',

                  'experienceId', 'typeOfWorkplaceId', 'jobTypeId',

                  'genderId', 'isUrgent', 'statusId', 'excludeSlug', 'companyId',
                  'careerIds', 'cityIds', 'districtIds', 'wardIds', 'positionIds',
                  'experienceIds', 'typeOfWorkplaceIds', 'jobTypeIds', 'genderIds',
                  'statusIds']

    def job_name_or_career_name(self, queryset, name, value):
        if value is None or (isinstance(value, str) and not value.strip()):
            return queryset
        try:
            from .documents import JobPostDocument
            s = JobPostDocument.search().query(
                "multi_match", 
                query=value, 
                fields=['job_name^3', 'career.name^2', 'company.company_name'],
                fuzziness="AUTO"
            )
            # Fetch IDs and cast to int to match Django's pk
            ids = [int(hit.id) for hit in s[:200]]
            
            if ids:
                from django.db.models import Case, When
                preserved = Case(*[When(id=pk, then=pos) for pos, pk in enumerate(ids)])
                return queryset.filter(id__in=ids).order_by(preserved)
            
            return queryset.none()
        except Exception:
            # Fallback to DB search
            return queryset.filter(Q(job_name__icontains=value) | Q(career__name__icontains=value))

    def exclude_slug(self, queryset, name, value):

        return queryset.exclude(slug=value)

class AliasedOrderingFilter(OrderingFilter):

    """ this allows us to "alias" fields on our model to ensure consistency at the API level

        We do so by allowing the ordering_fields attribute to accept a list of tuples.

        You can mix and match, i.e.:

        ordering_fields = (('alias1', 'field1'), 'field2', ('alias2', 'field2')) """

    def remove_invalid_fields(self, queryset, fields, view, request):

        valid_fields = getattr(view, 'ordering_fields', self.ordering_fields)

        if valid_fields is None or valid_fields == '__all__':

            return super(AliasedOrderingFilter, self).remove_invalid_fields(queryset, fields, view)

        aliased_fields = {}

        for field in valid_fields:

            if isinstance(field, basestring):

                aliased_fields[field] = field

            else:

                aliased_fields[field[0]] = field[1]

        ordering = []

        for raw_field in fields:

            invert = raw_field[0] == '-'

            field = raw_field.lstrip('-')

            if field in aliased_fields:

                if invert:

                    ordering.append('-{}'.format(aliased_fields[field]))

                else:

                    ordering.append(aliased_fields[field])

        return ordering

class EmployerJobPostActivityFilter(django_filters.FilterSet):

    cityId = django_filters.NumberFilter(field_name='resume__city')

    careerId = django_filters.NumberFilter(field_name='resume__career')

    experienceId = django_filters.ChoiceFilter(choices=var_sys.EXPERIENCE_CHOICES,

                                               field_name='resume__experience')

    positionId = django_filters.ChoiceFilter(choices=var_sys.POSITION_CHOICES,

                                             field_name='resume__position')

    academicLevelId = django_filters.ChoiceFilter(choices=var_sys.ACADEMIC_LEVEL,

                                                  field_name='resume__academic_level')

    typeOfWorkplaceId = django_filters.ChoiceFilter(choices=var_sys.TYPE_OF_WORKPLACE_CHOICES,

                                                    field_name='resume__type_of_workplace')

    jobTypeId = django_filters.ChoiceFilter(choices=var_sys.JOB_TYPE_CHOICES,

                                            field_name='resume__job_type')

    genderId = django_filters.ChoiceFilter(choices=var_sys.GENDER_CHOICES,

                                           field_name='resume__job_seeker_profile__gender')

    maritalStatusId = django_filters.ChoiceFilter(choices=var_sys.MARITAL_STATUS_CHOICES,

                                                  field_name="resume__job_seeker_profile__marital_status")

    jobPostId = django_filters.NumberFilter(field_name='job_post')

    status = django_filters.ChoiceFilter(choices=var_sys.APPLICATION_STATUS,

                                         field_name='status')

    aiAnalysisStatus = django_filters.ChoiceFilter(
        choices=(
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ),
        field_name='ai_analysis_status',
    )

    aiReviewStatus = django_filters.ChoiceFilter(
        choices=(
            ('ai_only', 'AI only'),
            ('reviewed', 'Reviewed'),
            ('overridden', 'Overridden'),
        ),
        field_name='ai_analysis_review_status',
    )

    aiScoreMin = django_filters.NumberFilter(field_name='ai_analysis_score', lookup_expr='gte')
    aiScoreMax = django_filters.NumberFilter(field_name='ai_analysis_score', lookup_expr='lte')
    hasAiAnalysis = django_filters.BooleanFilter(method='filter_has_ai_analysis')

    def filter_has_ai_analysis(self, queryset, name, value):
        if value:
            return queryset.filter(ai_analysis_status='completed', ai_analysis_score__isnull=False)
        return queryset.exclude(ai_analysis_status='completed', ai_analysis_score__isnull=False)

    class Meta:

        model = JobPostActivity

        fields = [

            'cityId', 'careerId',

            'experienceId', 'positionId',

            'academicLevelId', 'typeOfWorkplaceId',

            'jobTypeId', 'genderId', 'maritalStatusId',

            'jobPostId', 'status', 'aiAnalysisStatus', 'aiReviewStatus',
            'aiScoreMin', 'aiScoreMax', 'hasAiAnalysis'

        ]
