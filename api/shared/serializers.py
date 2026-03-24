"""
Shared serializer mixins for DRF.
"""


class DynamicFieldsMixin:
    """
    Mixin cho ModelSerializer hỗ trợ chọn fields khi khởi tạo.

    Usage:
        class MySerializer(DynamicFieldsMixin, serializers.ModelSerializer):
            ...

        # Chỉ serialize 2 fields:
        MySerializer(instance, fields=['id', 'name'])
    """

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            for field_name in set(self.fields) - allowed:
                self.fields.pop(field_name)
