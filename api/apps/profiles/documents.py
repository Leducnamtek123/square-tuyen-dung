from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Resume, Company

@registry.register_document
class ResumeDocument(Document):
    user = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'full_name': fields.TextField(),
    })
    job_seeker_profile = fields.ObjectField(properties={
        'gender': fields.TextField(),
        'marital_status': fields.TextField(),
    })
    city = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'name': fields.TextField(),
    })
    career = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'name': fields.TextField(),
    })

    class Index:
        name = 'resumes'
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Resume
        fields = [
            'id',
            'title',
            'description',
            'salary_min',
            'salary_max',
            'expected_salary',
            'skills_summary',
            'position',
            'experience',
            'academic_level',
            'type_of_workplace',
            'job_type',
            'is_active',
            'create_at',
            'update_at',
        ]

    def get_queryset(self):
        return super(ResumeDocument, self).get_queryset().select_related(
            'user', 'job_seeker_profile', 'city', 'career'
        )

    def prepare_user(self, instance):
        if instance.user:
            return {
                'id': instance.user.id,
                'full_name': instance.user.full_name
            }
        return None

    def prepare_job_seeker_profile(self, instance):
        if instance.job_seeker_profile:
            return {
                'gender': instance.job_seeker_profile.gender,
                'marital_status': instance.job_seeker_profile.marital_status
            }
        return None

    def prepare_city(self, instance):
        if instance.city:
            return {
                'id': instance.city.id,
                'name': instance.city.name
            }
        return None

    def prepare_career(self, instance):
        if instance.career:
            return {
                'id': instance.career.id,
                'name': instance.career.name
            }
        return None


@registry.register_document
class CompanyDocument(Document):
    location = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'city': fields.ObjectField(properties={
            'id': fields.IntegerField(),
            'name': fields.TextField(),
        })
    })

    description = fields.TextField()

    class Index:
        name = 'companies'
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Company
        fields = [
            'id',
            'company_name',
            'company_email',
            'company_phone',
            'website_url',
            'field_operation',
            'employee_size',
            'create_at',
            'update_at',
        ]

    def get_queryset(self):
        return super(CompanyDocument, self).get_queryset().select_related(
            'location', 'location__city'
        )

    def prepare_location(self, instance):
        if instance.location:
            data = {
                'id': instance.location.id,
                'city': None
            }
            if instance.location.city:
                data['city'] = {
                    'id': instance.location.city.id,
                    'name': instance.location.city.name
                }
            return data
        return None
