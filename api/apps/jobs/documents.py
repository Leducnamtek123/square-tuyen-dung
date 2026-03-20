from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import JobPost

@registry.register_document
class JobPostDocument(Document):
    # Foreign key fields
    company = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'company_name': fields.TextField(),
    })
    career = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'name': fields.TextField(),
    })
    location = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'city': fields.ObjectField(properties={
            'id': fields.IntegerField(),
            'name': fields.TextField(),
        })
    })

    class Index:
        # Name of the Elasticsearch index
        name = 'job_posts'
        # See Elasticsearch Indices API reference for available settings
        settings = {'number_of_shards': 1,
                    'number_of_replicas': 0}

    class Django:
        model = JobPost # The model associated with this Document

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            'id',
            'job_name',
            'deadline',
            'status',
            'salary_min',
            'salary_max',
            'is_hot',
            'is_urgent',
            'create_at',
            'update_at',
        ]

        # Ignore auto updating of Elasticsearch index when a model is saved
        # or deleted:
        # ignore_signals = True

        # Don't perform an index refresh after every update (overrides global setting):
        # auto_refresh = False

        # Paginate the django queryset used to populate the index with the specified size
        # (by default it uses the database driver's default setting)
        # queryset_pagination = 5000
    
    def get_queryset(self):
        """Return the queryset that should be used to retrieve the objects from the database to index."""
        return super(JobPostDocument, self).get_queryset().select_related(
            'company', 'career', 'location', 'location__city'
        )

    def prepare_company(self, instance):
        if instance.company:
            return {
                'id': instance.company.id,
                'company_name': instance.company.company_name
            }
        return None

    def prepare_career(self, instance):
        if instance.career:
            return {
                'id': instance.career.id,
                'name': instance.career.name
            }
        return None

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
