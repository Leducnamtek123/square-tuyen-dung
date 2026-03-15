"""
Interview Module — DRF Serializers
"""

from rest_framework import serializers
from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewTranscript, InterviewEvaluation
)
from common import serializers as common_serializers

class QuestionSerializer(serializers.ModelSerializer):
    questionText = serializers.CharField(source="text", read_only=True)
    careerDict = common_serializers.CareerSerializer(source="career", read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'text', 'questionText', 'difficulty',
            'career', 'careerDict', 'sort_order', 'author', 'company', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'author', 'company', 'create_at', 'update_at']

class QuestionGroupSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()
    question_ids = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(),
        many=True, write_only=True, required=False, source='questions'
    )

    class Meta:
        model = QuestionGroup
        fields = [
            'id', 'name', 'description', 'questions', 'questions_count',
            'question_ids', 'author', 'company', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'author', 'company', 'create_at', 'update_at']

    def get_questions_count(self, obj):
        return obj.questions.count()

class InterviewTranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewTranscript
        fields = ['id', 'interview', 'speaker_role', 'content', 'speech_duration_ms', 'create_at']
        read_only_fields = ['id', 'create_at']

class InterviewEvaluationSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.full_name', read_only=True)

    class Meta:
        model = InterviewEvaluation
        fields = [
            'id', 'interview', 'evaluator', 'evaluator_name',
            'attitude_score', 'professional_score', 'overall_score',
            'result', 'comments', 'proposed_salary',
            'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'evaluator', 'create_at', 'update_at']

class InterviewSessionListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách (nhẹ, không nested)."""
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    job_name = serializers.CharField(source='job_post.job_name', read_only=True, default=None)
    company_name = serializers.SerializerMethodField()
    evaluations_count = serializers.SerializerMethodField()

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'room_name', 'invite_token', 'status', 'type',
            'candidate', 'candidate_name', 'candidate_email',
            'job_post', 'job_name', 'company_name',
            'scheduled_at', 'start_time', 'end_time', 'duration',
            'ai_overall_score', 'evaluations_count',
            'create_at', 'update_at'
        ]

    def get_company_name(self, obj):
        if obj.job_post and obj.job_post.company:
            return obj.job_post.company.company_name
        if obj.question_group and obj.question_group.company:
            return obj.question_group.company.company_name
        return None

    def get_evaluations_count(self, obj):
        return obj.evaluations.count()

class InterviewSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết (có nested transcripts, evaluations, questions)."""
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    job_name = serializers.CharField(source='job_post.job_name', read_only=True, default=None)
    company_name = serializers.SerializerMethodField()
    questions = QuestionSerializer(many=True, read_only=True)
    transcripts = InterviewTranscriptSerializer(many=True, read_only=True)
    evaluations = InterviewEvaluationSerializer(many=True, read_only=True)

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'room_name', 'invite_token', 'status', 'type',
            'candidate', 'candidate_name', 'candidate_email',
            'job_post', 'job_name', 'company_name',
            'scheduled_at', 'start_time', 'end_time', 'duration',
            'recording_url', 'transcript_url', 'notes',
            'ai_overall_score', 'ai_technical_score', 'ai_communication_score',
            'ai_summary', 'ai_strengths', 'ai_weaknesses',
            'created_by', 'question_group',
            'questions', 'transcripts', 'evaluations',
            'create_at', 'update_at'
        ]
        read_only_fields = [
            'id', 'room_name', 'invite_token',
            'created_by', 'create_at', 'update_at'
        ]

    def get_company_name(self, obj):
        if obj.job_post and obj.job_post.company:
            return obj.job_post.company.company_name
        if obj.question_group and obj.question_group.company:
            return obj.question_group.company.company_name
        return None

class InterviewSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer tạo mới interview."""
    question_ids = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(),
        many=True, write_only=True, required=False
    )

    class Meta:
        model = InterviewSession
        fields = [
            'candidate', 'job_post', 'type',
            'scheduled_at', 'notes',
            'question_group', 'question_ids'
        ]

    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        session = InterviewSession.objects.create(**validated_data)
        if question_ids:
            session.questions.set(question_ids)
        elif session.question_group:
            session.questions.set(session.question_group.questions.all())
        return session

class InterviewContextSerializer(serializers.Serializer):
    """Context cho AI Agent khi join room (follow SquareAI)."""
    candidateName = serializers.CharField()
    candidateEmail = serializers.CharField()
    jobTitle = serializers.CharField(allow_null=True)
    questions = serializers.ListField()
    interviewType = serializers.CharField()

class AppendTranscriptSerializer(serializers.Serializer):
    """Serializer cho agent gửi transcript."""
    speaker_role = serializers.ChoiceField(choices=['ai_agent', 'candidate'])
    content = serializers.CharField()
    speech_duration_ms = serializers.IntegerField(required=False, allow_null=True)

class UpdateStatusSerializer(serializers.Serializer):
    """Serializer cập nhật status."""
    status = serializers.ChoiceField(
        choices=['scheduled', 'calibration', 'in_progress', 'completed', 'cancelled', 'interrupted']
    )
