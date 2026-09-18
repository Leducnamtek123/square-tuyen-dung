from rest_framework import serializers
from .models import AsyncOperation


class AsyncOperationSerializer(serializers.ModelSerializer):
    currentStepKey = serializers.CharField(source="current_step_key", read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    finishedAt = serializers.DateTimeField(source="finished_at", read_only=True, allow_null=True)

    class Meta:
        model = AsyncOperation
        fields = [
            "id",
            "type",
            "title",
            "status",
            "progress",
            "currentStepKey",
            "steps",
            "result",
            "error",
            "metadata",
            "createdAt",
            "updatedAt",
            "finishedAt",
        ]

    def to_representation(self, instance):
        if hasattr(instance, "to_payload"):
            return instance.to_payload()
        return super().to_representation(instance)
