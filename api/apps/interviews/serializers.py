"""
Interview Module — DRF Serializers
"""

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from .models import (
    Question, QuestionGroup,
    InterviewSession, InterviewTranscript, InterviewEvaluation
)
from common import serializers as common_serializers

class QuestionSerializer(serializers.ModelSerializer):
    questionText = serializers.CharField(source="text", read_only=True)
    careerDict = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'text', 'questionText', 'difficulty',
            'career', 'careerDict', 'sort_order', 'author', 'company', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'author', 'company', 'create_at', 'update_at']

    def get_careerDict(self, obj):
        try:
            career = obj.career
        except ObjectDoesNotExist:
            return None
        except Exception:
            return None

        if not career:
            return None
        return common_serializers.CareerSerializer(career).data

class QuestionGroupSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    question_ids = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(),
        many=True, write_only=True, required=False, source='questions'
    )

    class Meta:
        model = QuestionGroup
        fields = [
            'id', 'name', 'description', 'evaluation_rubric', 'questions', 'questions_count',
            'question_ids', 'author', 'company', 'create_at', 'update_at'
        ]
        read_only_fields = ['id', 'author', 'company', 'create_at', 'update_at']

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_questions(self, obj):
        items = []
        for question in obj.questions.all():
            try:
                items.append(QuestionSerializer(question, context=self.context).data)
            except Exception:
                continue
        return items

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

    def validate(self, attrs):
        attitude = attrs.get("attitude_score")
        professional = attrs.get("professional_score")

        if attitude is not None and professional is not None:
            attrs["overall_score"] = (attitude + professional) / 2
        return attrs

class InterviewSessionListSerializer(serializers.ModelSerializer):
    """Serializer for list endpoint."""
    candidate = serializers.SerializerMethodField()
    job_post = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    job_name = serializers.SerializerMethodField()
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

    def get_candidate_name(self, obj):
        try:
            return obj.candidate.full_name if obj.candidate else None
        except Exception:
            return None

    def get_candidate(self, obj):
        try:
            return obj.candidate_id
        except Exception:
            return None

    def get_candidate_email(self, obj):
        try:
            return obj.candidate.email if obj.candidate else None
        except Exception:
            return None

    def get_job_post(self, obj):
        try:
            return obj.job_post_id
        except Exception:
            return None

    def get_job_name(self, obj):
        try:
            return obj.job_post.job_name if obj.job_post else None
        except Exception:
            return None

    def get_company_name(self, obj):
        try:
            if obj.job_post and obj.job_post.company:
                return obj.job_post.company.company_name
        except Exception:
            pass

        try:
            if obj.question_group and obj.question_group.company:
                return obj.question_group.company.company_name
        except Exception:
            pass

        return None

    def get_evaluations_count(self, obj):
        try:
            return obj.evaluations.count()
        except Exception:
            return 0


class InterviewSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer for detail endpoint."""
    candidate = serializers.SerializerMethodField()
    job_post = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    question_group = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    job_name = serializers.SerializerMethodField()
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
            'ai_summary', 'ai_strengths', 'ai_weaknesses', 'ai_detailed_feedback',
            'created_by', 'question_group',
            'questions', 'transcripts', 'evaluations',
            'create_at', 'update_at'
        ]
        read_only_fields = [
            'id', 'room_name', 'invite_token',
            'created_by', 'create_at', 'update_at'
        ]

    def get_candidate_name(self, obj):
        try:
            return obj.candidate.full_name if obj.candidate else None
        except Exception:
            return None

    def get_candidate(self, obj):
        try:
            return obj.candidate_id
        except Exception:
            return None

    def get_candidate_email(self, obj):
        try:
            return obj.candidate.email if obj.candidate else None
        except Exception:
            return None

    def get_job_post(self, obj):
        try:
            return obj.job_post_id
        except Exception:
            return None

    def get_created_by(self, obj):
        try:
            return obj.created_by_id
        except Exception:
            return None

    def get_question_group(self, obj):
        try:
            return obj.question_group_id
        except Exception:
            return None

    def get_job_name(self, obj):
        try:
            return obj.job_post.job_name if obj.job_post else None
        except Exception:
            return None

    def get_company_name(self, obj):
        try:
            if obj.job_post and obj.job_post.company:
                return obj.job_post.company.company_name
        except Exception:
            pass

        try:
            if obj.question_group and obj.question_group.company:
                return obj.question_group.company.company_name
        except Exception:
            pass

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
        # Set status to scheduled by default for new interviews created via this serializer
        validated_data.setdefault('status', 'scheduled')
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

