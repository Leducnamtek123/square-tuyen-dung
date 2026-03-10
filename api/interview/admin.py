"""
Interview Module — Django Admin Registration
"""

from django.contrib import admin
from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewTranscript, InterviewEvaluation
)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'text_short', 'category', 'sort_order', 'author', 'create_at']
    list_filter = ['category']
    search_fields = ['text']
    ordering = ['sort_order', '-create_at']

    def text_short(self, obj):
        return obj.text[:80] if obj.text else ''
    text_short.short_description = 'Nội dung'


@admin.register(QuestionGroup)
class QuestionGroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'questions_count', 'author', 'create_at']
    search_fields = ['name']
    filter_horizontal = ['questions']

    def questions_count(self, obj):
        return obj.questions.count()
    questions_count.short_description = 'Số câu hỏi'


class TranscriptInline(admin.TabularInline):
    model = InterviewTranscript
    extra = 0
    readonly_fields = ['speaker_role', 'content', 'speech_duration_ms', 'create_at']


class EvaluationInline(admin.StackedInline):
    model = InterviewEvaluation
    extra = 0


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'room_name', 'status', 'candidate',
        'job_post', 'scheduled_at', 'ai_overall_score', 'create_at'
    ]
    list_filter = ['status', 'type']
    search_fields = ['room_name', 'candidate__full_name', 'job_post__job_name']
    readonly_fields = ['room_name', 'invite_token']
    inlines = [TranscriptInline, EvaluationInline]


@admin.register(InterviewTranscript)
class InterviewTranscriptAdmin(admin.ModelAdmin):
    list_display = ['id', 'interview', 'speaker_role', 'content_short', 'create_at']
    list_filter = ['speaker_role']

    def content_short(self, obj):
        return obj.content[:80] if obj.content else ''
    content_short.short_description = 'Nội dung'


@admin.register(InterviewEvaluation)
class InterviewEvaluationAdmin(admin.ModelAdmin):
    list_display = ['id', 'interview', 'evaluator', 'overall_score', 'result', 'create_at']
    list_filter = ['result']
