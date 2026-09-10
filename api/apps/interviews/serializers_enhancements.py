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

    class Meta:
        model = Question
        fields = [
            'id', 'text', 'category', 'category_display', 'difficulty', 'difficulty_display',
            'career', 'career_name', 'sort_order', 'default_duration_seconds',
            'answer_structure', 'interviewer_intent', 'important_tips', 'follow_up_questions',
            'create_at'
        ]


class SalaryBenchmarkSerializer(serializers.ModelSerializer):
    career_name = serializers.CharField(source="career.name", read_only=True, default="")
    experience_level_display = serializers.CharField(source="get_experience_level_display", read_only=True)

    class Meta:
        model = SalaryBenchmark
        fields = [
            'id', 'career', 'career_name', 'position_title', 'experience_level',
            'experience_level_display', 'salary_min', 'salary_max', 'salary_avg',
            'year', 'sample_count', 'is_hot', 'create_at'
        ]


class CreateMockSessionInputSerializer(serializers.Serializer):
    career_id = serializers.IntegerField(required=False, allow_null=True)
    position_title = serializers.CharField(required=False, default="Phỏng vấn thử AI", max_length=255)
    question_count = serializers.IntegerField(required=False, default=6, min_value=1, max_value=15)


class MockSessionResponseSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source="candidate.full_name", read_only=True)
    questions = QuestionBankItemSerializer(many=True, read_only=True)
    livekit_token = serializers.CharField(read_only=True, default="")

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'room_name', 'invite_token', 'status', 'session_type',
            'type', 'scheduled_at', 'duration', 'candidate', 'candidate_name',
            'time_limit_per_question', 'session_metadata', 'questions', 'livekit_token',
            'create_at'
        ]
