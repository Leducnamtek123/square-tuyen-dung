
from shared.configs import variable_system as var_sys

from django.db.models import Q

import django_filters

from rest_framework.filters import OrderingFilter
from requests.compat import basestring

from .models import (
    Company,
    Resume,
    ResumeSaved
)

class AliasedOrderingFilter(OrderingFilter):
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

class ResumeFilter(django_filters.FilterSet):
    class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
        pass

    class ChoiceInFilter(django_filters.BaseInFilter, django_filters.ChoiceFilter):
        pass

    kw = django_filters.CharFilter(method="title_or_full_name")

    cityId = django_filters.NumberFilter(field_name='city')
    cityIds = NumberInFilter(field_name='city', lookup_expr='in')

    careerId = django_filters.NumberFilter(field_name='career')
    careerIds = NumberInFilter(field_name='career', lookup_expr='in')

    experienceId = django_filters.ChoiceFilter(choices=var_sys.EXPERIENCE_CHOICES, field_name='experience')
    experienceIds = ChoiceInFilter(choices=var_sys.EXPERIENCE_CHOICES, field_name='experience', lookup_expr='in')

    positionId = django_filters.ChoiceFilter(choices=var_sys.POSITION_CHOICES, field_name='position')
    positionIds = ChoiceInFilter(choices=var_sys.POSITION_CHOICES, field_name='position', lookup_expr='in')

    academicLevelId = django_filters.ChoiceFilter(choices=var_sys.POSITION_CHOICES, field_name='academic_level')
    academicLevelIds = ChoiceInFilter(choices=var_sys.POSITION_CHOICES, field_name='academic_level', lookup_expr='in')

    typeOfWorkplaceId = django_filters.ChoiceFilter(choices=var_sys.TYPE_OF_WORKPLACE_CHOICES, field_name='type_of_workplace')
    typeOfWorkplaceIds = ChoiceInFilter(choices=var_sys.TYPE_OF_WORKPLACE_CHOICES, field_name='type_of_workplace', lookup_expr='in')

    jobTypeId = django_filters.ChoiceFilter(choices=var_sys.JOB_TYPE_CHOICES, field_name='job_type')
    jobTypeIds = ChoiceInFilter(choices=var_sys.JOB_TYPE_CHOICES, field_name='job_type', lookup_expr='in')

    genderId = django_filters.ChoiceFilter(choices=var_sys.GENDER_CHOICES, field_name='job_seeker_profile__gender')
    genderIds = ChoiceInFilter(choices=var_sys.GENDER_CHOICES, field_name='job_seeker_profile__gender', lookup_expr='in')

    maritalStatusId = django_filters.ChoiceFilter(choices=var_sys.MARITAL_STATUS_CHOICES, field_name="job_seeker_profile__marital_status")
    maritalStatusIds = ChoiceInFilter(choices=var_sys.MARITAL_STATUS_CHOICES, field_name="job_seeker_profile__marital_status", lookup_expr='in')

    def title_or_full_name(self, queryset, name, value):

        return queryset.filter(Q(title__icontains=value) | Q(job_seeker_profile__user__full_name__icontains=value))

    class Meta:

        model = Resume

        fields = [
            'kw', 'cityId', 'careerId', 'experienceId', 'positionId',
            'academicLevelId', 'typeOfWorkplaceId', 'jobTypeId', 'genderId', 'maritalStatusId',
            'cityIds', 'careerIds', 'experienceIds', 'positionIds',
            'academicLevelIds', 'typeOfWorkplaceIds', 'jobTypeIds', 'genderIds', 'maritalStatusIds'
        ]

class ResumeSavedFilter(django_filters.FilterSet):

    kw = django_filters.CharFilter(method="job_name_or_full_name")

    salaryMax = django_filters.NumberFilter(field_name="resume__salary_max",

                                            lookup_expr="lte")

    experienceId = django_filters.ChoiceFilter(choices=var_sys.EXPERIENCE_CHOICES,

                                               field_name='resume__experience')

    cityId = django_filters.NumberFilter(field_name='resume__city')

    def job_name_or_full_name(self, queryset, name, value):

        return queryset.filter(Q(resume__title__icontains=value) | Q(resume__user__full_name__icontains=value))

    class Meta:

        model = ResumeSaved

        fields = ['kw', 'salaryMax', 'experienceId', 'cityId']

class CompanyFilter(django_filters.FilterSet):

    kw = django_filters.CharFilter(method="company_name_or_field_operation")

    cityId = django_filters.NumberFilter(field_name='location__city')

    excludeSlug = django_filters.CharFilter(method="exclude_slug")

    class Meta:
        model = Company
        fields = ['kw', 'cityId', 'excludeSlug', 'cityIds']

    class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
        pass

    cityIds = NumberInFilter(field_name='location__city', lookup_expr='in')

    def company_name_or_field_operation(self, queryset, name, value):

        return queryset.filter(Q(company_name__icontains=value) | Q(field_operation__icontains=value))

    def exclude_slug(self, queryset, name, value):

        return queryset.exclude(slug=value)
