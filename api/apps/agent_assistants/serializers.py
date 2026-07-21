from rest_framework import serializers

from .models import AgentMessage, AgentThread, AgentToolCall


class AgentToolCallSerializer(serializers.ModelSerializer):
    toolName = serializers.CharField(source="tool_name", read_only=True)
    displayName = serializers.CharField(source="display_name", read_only=True)
    input = serializers.JSONField(source="input_payload", read_only=True)
    output = serializers.JSONField(source="output_payload", read_only=True)
    errorMessage = serializers.CharField(source="error_message", read_only=True)
    requiresConfirmation = serializers.BooleanField(source="requires_confirmation", read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    class Meta:
        model = AgentToolCall
        fields = (
            "id",
            "toolName",
            "displayName",
            "status",
            "input",
            "output",
            "errorMessage",
            "requiresConfirmation",
            "metadata",
            "createAt",
            "updateAt",
        )


class AgentMessageSerializer(serializers.ModelSerializer):
    toolCalls = AgentToolCallSerializer(source="tool_calls", many=True, read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    class Meta:
        model = AgentMessage
        fields = (
            "id",
            "role",
            "content",
            "parts",
            "metadata",
            "toolCalls",
            "createAt",
            "updateAt",
        )


class AgentThreadSerializer(serializers.ModelSerializer):
    companyId = serializers.IntegerField(source="company_id", read_only=True)
    ownerId = serializers.IntegerField(source="owner_id", read_only=True)
    lastMessageAt = serializers.DateTimeField(source="last_message_at", read_only=True)
    createAt = serializers.DateTimeField(source="create_at", read_only=True)
    updateAt = serializers.DateTimeField(source="update_at", read_only=True)

    class Meta:
        model = AgentThread
        fields = (
            "id",
            "title",
            "portal",
            "status",
            "ownerId",
            "companyId",
            "metadata",
            "lastMessageAt",
            "createAt",
            "updateAt",
        )

