"""
Serializers for Interview Enhancements: Question Bank, Mock Sessions, Salary Benchmarks
"""

from rest_framework import serializers
from .models import Question, InterviewSession, SalaryBenchmark
from apps.common.models import Career

class QuestionBankItemSerializer(serializers.ModelSerializer):
    career_name = serializers.CharField(source="career.name", read_only=True, default="")
    difficulty_display = serializers.CharField(source="get_difficulty_display", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    question_text = serializers.CharField(source="text", read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'text', 'question_text', 'category', 'category_display', 'difficulty', 'difficulty_display',
            'career', 'career_name', 'sort_order', 'default_duration_seconds',
            'answer_structure', 'interviewer_intent', 'important_tips', 'follow_up_questions',
            'create_at'
        ]


class SalaryBenchmarkSerializer(serializers.ModelSerializer):
    career_name = serializers.CharField(source="career.name", read_only=True, default="")
    experience_level_display = serializers.CharField(source="get_experience_level_display", read_only=True)
    job_title = serializers.CharField(source="position_title", read_only=True)
    category = serializers.CharField(source="career.name", read_only=True, default="Chung")
    seniority = serializers.CharField(source="experience_level", read_only=True)
    min_salary = serializers.IntegerField(source="salary_min", read_only=True)
    max_salary = serializers.IntegerField(source="salary_max", read_only=True)
    median_salary = serializers.IntegerField(source="salary_avg", read_only=True)
    sample_size = serializers.IntegerField(source="sample_count", read_only=True)

    class Meta:
        model = SalaryBenchmark
        fields = [
            'id', 'career', 'career_name', 'position_title', 'job_title', 'category',
            'experience_level', 'experience_level_display', 'seniority',
            'salary_min', 'salary_max', 'salary_avg', 'min_salary', 'max_salary', 'median_salary',
            'year', 'sample_count', 'sample_size', 'is_hot', 'create_at'
        ]


class CreateMockSessionInputSerializer(serializers.Serializer):
    career_id = serializers.IntegerField(required=False, allow_null=True)
    position_title = serializers.CharField(required=False, default="Phỏng vấn thử AI", max_length=255)
    job_title = serializers.CharField(required=False, max_length=255)
    category = serializers.CharField(required=False, max_length=255)
    seniority = serializers.CharField(required=False, max_length=50)
    experience_level = serializers.CharField(required=False, max_length=50)
    question_count = serializers.IntegerField(required=False, default=6, min_value=1, max_value=15)
    question_group_id = serializers.IntegerField(required=False, allow_null=True)
    question_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
    voice_profile_id = serializers.IntegerField(required=False, allow_null=True)
    job_post_id = serializers.IntegerField(required=False, allow_null=True)
    interview_language = serializers.CharField(required=False, default='vi')
    session_metadata = serializers.JSONField(required=False, default=dict)


class MockSessionResponseSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source="candidate.full_name", read_only=True, default=None)
    questions = serializers.SerializerMethodField()
    livekit_token = serializers.CharField(read_only=True, default="")
    interview_url = serializers.SerializerMethodField()
    session_id = serializers.IntegerField(source="id", read_only=True)
    interview_language_display = serializers.CharField(source='get_interview_language_display', read_only=True)

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'session_id', 'room_name', 'invite_token', 'status', 'session_type', 'interview_language', 'interview_language_display',
            'type', 'scheduled_at', 'duration', 'candidate', 'candidate_name',
            'time_limit_per_question', 'session_metadata', 'questions', 'livekit_token',
            'interview_url', 'create_at'
        ]

    def get_questions(self, obj):
        if not getattr(obj, "pk", None):
            return []
        try:
            return QuestionBankItemSerializer(obj.questions.all(), many=True).data
        except Exception:
            return []

    def get_interview_url(self, obj):
        token = obj.invite_token or obj.id
        return f"/interview/{token}"

