from rest_framework import serializers
from apps.exchange.models import ExportJob, ImportJob


class ExportRequestSerializer(serializers.Serializer):
    entity = serializers.CharField(required=True)
    format = serializers.ChoiceField(choices=["xlsx", "csv"], default="xlsx")
    fields = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    filters = serializers.DictField(required=False, default=dict)
    async_job = serializers.BooleanField(required=False, default=True)


class ExportJobResponseSerializer(serializers.ModelSerializer):
    exportId = serializers.CharField(source="public_id")
    entity = serializers.CharField(source="entity_type")
    currentStep = serializers.CharField(source="current_step")
    totalRows = serializers.IntegerField(source="total_rows")
    processedRows = serializers.IntegerField(source="processed_rows")
    downloadUrl = serializers.SerializerMethodField()
    errorMessage = serializers.CharField(source="error_message")
    createdAt = serializers.DateTimeField(source="create_at")
    completedAt = serializers.DateTimeField(source="completed_at")

    class Meta:
        model = ExportJob
        fields = [
            "exportId",
            "entity",
            "format",
            "status",
            "progress",
            "currentStep",
            "totalRows",
            "processedRows",
            "downloadUrl",
            "errorMessage",
            "createdAt",
            "completedAt",
        ]

    def get_downloadUrl(self, obj) -> str:
        if obj.file_url:
            return obj.file_url
        if obj.file:
            return obj.file.get_full_url() or ""
        return ""


class ImportValidateRequestSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    entity = serializers.CharField(required=True)
    mode = serializers.ChoiceField(choices=["create", "update", "upsert"], default="create")
    match_by = serializers.CharField(required=False, default="")


class ImportJobResponseSerializer(serializers.ModelSerializer):
    importId = serializers.CharField(source="public_id")
    entity = serializers.CharField(source="entity_type")
    matchBy = serializers.CharField(source="match_by")
    fileName = serializers.CharField(source="file_name")
    currentStep = serializers.CharField(source="current_step")
    totalRows = serializers.IntegerField(source="total_rows")
    processedRows = serializers.IntegerField(source="processed_rows")
    validRows = serializers.IntegerField(source="valid_rows")
    invalidRows = serializers.IntegerField(source="invalid_rows")
    warningRows = serializers.IntegerField(source="warning_rows")
    createdRows = serializers.IntegerField(source="created_rows")
    updatedRows = serializers.IntegerField(source="updated_rows")
    failedRows = serializers.IntegerField(source="failed_rows")
    errorReportUrl = serializers.CharField(source="error_report_url")
    errorSummary = serializers.JSONField(source="error_summary")
    createdAt = serializers.DateTimeField(source="create_at")
    completedAt = serializers.DateTimeField(source="completed_at")

    class Meta:
        model = ImportJob
        fields = [
            "importId",
            "entity",
            "mode",
            "matchBy",
            "fileName",
            "status",
            "progress",
            "currentStep",
            "totalRows",
            "processedRows",
            "validRows",
            "invalidRows",
            "warningRows",
            "createdRows",
            "updatedRows",
            "failedRows",
            "errorReportUrl",
            "errorSummary",
            "createdAt",
            "completedAt",
        ]
