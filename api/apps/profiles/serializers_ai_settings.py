from rest_framework import serializers
from apps.profiles.models import Company


class CompanyAiSettingsSerializer(serializers.Serializer):
    interviewer_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Tên của Trợ lý AI phỏng vấn",
    )
    interviewer_title = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        help_text="Chức danh hiển thị của AI",
    )
    background_type = serializers.ChoiceField(
        choices=["preset", "custom"],
        required=False,
        help_text="Loại hình nền: preset hoặc custom",
    )
    selected_background_id = serializers.CharField(
        max_length=100,
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="ID phông nền mẫu được chọn",
    )
    custom_background_url = serializers.CharField(
        max_length=500,
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="URL ảnh nền tùy chỉnh của doanh nghiệp",
    )
    avatar_type = serializers.ChoiceField(
        choices=["preset", "custom"],
        required=False,
        help_text="Loại avatar AI: preset hoặc custom",
    )
    active_character_id = serializers.CharField(
        max_length=100,
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="Mã nhân vật AI",
    )
    selected_avatar_id = serializers.CharField(
        max_length=100,
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="Mã hình ảnh đại diện AI",
    )
    custom_avatar_url = serializers.CharField(
        max_length=500,
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="URL ảnh đại diện tùy chỉnh của AI",
    )
    tts_voice = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Giọng nói AI TTS",
    )
    tts_speed = serializers.FloatField(
        required=False,
        min_value=0.5,
        max_value=2.0,
        help_text="Tốc độ nói AI (0.5 - 2.0)",
    )
    default_script_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID kịch bản phỏng vấn mặc định của doanh nghiệp",
    )

    def to_representation(self, instance):
        if hasattr(instance, "get_ai_settings"):
            return instance.get_ai_settings()
        if isinstance(instance, dict):
            dummy = Company(ai_settings=instance)
            return dummy.get_ai_settings()
        return super().to_representation(instance)

    def update(self, instance, validated_data):
        current = instance.ai_settings if isinstance(instance.ai_settings, dict) else {}
        # Merge validated data into current settings
        updated = dict(current)
        updated.update(validated_data)
        instance.ai_settings = updated
        instance.save(update_fields=["ai_settings", "update_at"])
        return instance
