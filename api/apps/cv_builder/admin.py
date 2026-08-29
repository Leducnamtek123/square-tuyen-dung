from django.contrib import admin
from .models import CVTemplate, CandidateCV, CVSuggestion


@admin.register(CVTemplate)
class CVTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "category_name", "is_active", "is_popular", "is_premium", "use_count", "sort_order"]
    list_filter = ["category", "is_active", "is_popular", "is_premium"]
    search_fields = ["name", "code", "category_name", "description"]
    list_editable = ["is_active", "is_popular", "is_premium", "sort_order"]


@admin.register(CandidateCV)
class CandidateCVAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "template_code", "is_main_cv", "is_public", "views_count", "update_at"]
    list_filter = ["template_code", "is_main_cv", "is_public"]
    search_fields = ["title", "user__email", "user__full_name", "slug"]
    readonly_fields = ["slug", "views_count", "download_count", "create_at", "update_at"]


@admin.register(CVSuggestion)
class CVSuggestionAdmin(admin.ModelAdmin):
    list_display = ["title", "industry_name", "suggestion_type", "sort_order", "is_active"]
    list_filter = ["industry", "suggestion_type", "is_active"]
    search_fields = ["title", "content", "industry_name"]
    list_editable = ["sort_order", "is_active"]
