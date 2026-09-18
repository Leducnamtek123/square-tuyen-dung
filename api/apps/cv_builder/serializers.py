from rest_framework import serializers
from .models import CVTemplate, CandidateCV, CVSuggestion


class CVTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVTemplate
        fields = [
            "id",
            "code",
            "name",
            "description",
            "category",
            "category_name",
            "thumbnail_url",
            "color_palettes",
            "default_theme",
            "sample_data",
            "is_active",
            "is_premium",
            "is_popular",
            "sort_order",
            "use_count",
            "view_count",
            "create_at",
            "update_at",
        ]


class CandidateCVListSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source="template.name", read_only=True, default="")
    template_category = serializers.CharField(source="template.category_name", read_only=True, default="")

    class Meta:
        model = CandidateCV
        fields = [
            "id",
            "template",
            "template_code",
            "template_name",
            "template_category",
            "title",
            "slug",
            "thumbnail_url",
            "pdf_url",
            "is_main_cv",
            "is_public",
            "views_count",
            "download_count",
            "ai_score",
            "create_at",
            "update_at",
        ]


class CandidateCVDetailSerializer(serializers.ModelSerializer):
    template_info = CVTemplateSerializer(source="template", read_only=True)

    class Meta:
        model = CandidateCV
        fields = [
            "id",
            "user",
            "template",
            "template_code",
            "template_info",
            "title",
            "slug",
            "theme_config",
            "cv_data",
            "thumbnail_url",
            "pdf_url",
            "is_main_cv",
            "is_public",
            "views_count",
            "download_count",
            "ai_score",
            "ai_review_data",
            "create_at",
            "update_at",
        ]
        read_only_fields = ["id", "user", "slug", "views_count", "download_count", "create_at", "update_at"]


class CandidateCVCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateCV
        fields = [
            "id",
            "template",
            "template_code",
            "title",
            "slug",
            "theme_config",
            "cv_data",
            "thumbnail_url",
            "pdf_url",
            "is_main_cv",
            "is_public",
        ]
        read_only_fields = ["id", "slug"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user

        # If set as main CV, unset other main CVs of this user
        if validated_data.get("is_main_cv"):
            CandidateCV.objects.filter(user=user, is_main_cv=True).update(is_main_cv=False)

        # Increment use_count on CVTemplate
        template = validated_data.get("template")
        if template:
            template.use_count += 1
            template.save(update_fields=["use_count"])

        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if validated_data.get("is_main_cv") and not instance.is_main_cv:
            CandidateCV.objects.filter(user=user, is_main_cv=True).update(is_main_cv=False)

        return super().update(instance, validated_data)


class PublicCVSerializer(serializers.ModelSerializer):
    template_info = CVTemplateSerializer(source="template", read_only=True)
    candidate_name = serializers.CharField(source="user.full_name", read_only=True, default="")

    class Meta:
        model = CandidateCV
        fields = [
            "id",
            "template_code",
            "template_info",
            "title",
            "slug",
            "theme_config",
            "cv_data",
            "thumbnail_url",
            "pdf_url",
            "candidate_name",
            "create_at",
            "update_at",
        ]


class CVSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVSuggestion
        fields = [
            "id",
            "industry",
            "industry_name",
            "suggestion_type",
            "title",
            "content",
            "skills_list",
            "sort_order",
        ]
