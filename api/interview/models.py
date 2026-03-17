"""
Interview Management Module - Part of MyJob Platform

Models for AI-powered interview system, following SquareAI architecture.
Supports: Question Bank, Interview Sessions, Transcripts, Evaluations.
"""

from django.db import models
from authentication.models import User
from job.models import JobPost
from info.models import Resume
import uuid

class InterviewBaseModel(models.Model):
    class Meta:
        abstract = True

    create_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

# Question Bank

class Question(InterviewBaseModel):
    """Ngân hàng câu hỏi phỏng vấn — chỉ cần nội dung text."""

    CATEGORY_CHOICES = [
        ('soft_skills', 'Kỹ năng mềm'),
        ('technical', 'Kỹ thuật'),
        ('behavioral', 'Hành vi'),
        ('situational', 'Tình huống'),
        ('general', 'Chung'),
    ]

    text = models.TextField(verbose_name="Nội dung câu hỏi")
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='general',
        verbose_name="Danh mục"
    )
    difficulty = models.IntegerField(
        choices=[(1, 'Dễ'), (2, 'Trung bình'), (3, 'Khó')],
        default=1,
        verbose_name="Mức độ"
    )
    career = models.ForeignKey(
        'common.Career', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='questions',
        verbose_name="Lĩnh vực"
    )
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_questions',
        verbose_name="Người tạo"
    )
    company = models.ForeignKey(
        'info.Company', on_delete=models.CASCADE, null=True, blank=True,
        related_name='questions',
        verbose_name="Thuộc công ty"
    )

    class Meta:
        db_table = "myjob_interview_question"
        ordering = ['sort_order', '-create_at']
        verbose_name = "Question"
        verbose_name_plural = "Questions"

    def __str__(self):
        return self.text[:80]

class QuestionGroup(InterviewBaseModel):
    """Nhóm câu hỏi (cho một vị trí hoặc chủ đề cụ thể)."""

    name = models.CharField(max_length=255, verbose_name="Tên nhóm")
    description = models.TextField(
        blank=True, null=True,
        verbose_name="Mô tả"
    )
    questions = models.ManyToManyField(
        Question,
        blank=True,
        related_name='groups',
        verbose_name="Câu hỏi"
    )
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_question_groups',
        verbose_name="Người tạo"
    )
    company = models.ForeignKey(
        'info.Company', on_delete=models.CASCADE, null=True, blank=True,
        related_name='question_groups',
        verbose_name="Thuộc công ty"
    )

    class Meta:
        db_table = "myjob_interview_question_group"
        ordering = ['-create_at']
        verbose_name = "Question Group"
        verbose_name_plural = "Question Groups"

    def __str__(self):
        return self.name

class InterviewSession(InterviewBaseModel):
    """Buổi Phỏng vấn trực tuyến."""

    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('scheduled', 'Đã lên lịch'),
        ('calibration', 'Kiểm tra thiết bị'),
        ('in_progress', 'Đang phỏng vấn'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
        ('interrupted', 'Bị gián đoạn'),
        ('processing', 'Đang xử lý'),
    ]

    TYPE_CHOICES = [
        ('technical', 'Kỹ thuật'),
        ('behavioral', 'Hành vi'),
        ('mixed', 'Tổng hợp'),
    ]

    room_name = models.CharField(
        max_length=255, unique=True,
        verbose_name="Tên phòng (LiveKit Room)"
    )
    invite_token = models.CharField(
        max_length=255, unique=True, blank=True, null=True,
        verbose_name="Token mời phỏng vấn"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Trạng thái",
        db_index=True
    )
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='mixed',
        verbose_name="Loại phỏng vấn"
    )

    scheduled_at = models.DateTimeField(
        blank=True, null=True,
        verbose_name="Thời gian dự kiến",
        db_index=True
    )
    start_time = models.DateTimeField(
        blank=True, null=True,
        verbose_name="Bắt đầu lúc"
    )
    end_time = models.DateTimeField(
        blank=True, null=True,
        verbose_name="Kết thúc lúc"
    )
    duration = models.IntegerField(
        blank=True, null=True,
        verbose_name="Thời lượng (giây)"
    )

    recording_url = models.URLField(
        max_length=500, blank=True, null=True,
        verbose_name="Link video ghi hình"
    )
    transcript_url = models.URLField(
        max_length=500, blank=True, null=True,
        verbose_name="Link transcript"
    )
    notes = models.TextField(
        blank=True, null=True,
        verbose_name="Ghi chú"
    )

    # AI Analysis
    ai_overall_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        verbose_name="Điểm tổng AI"
    )
    ai_technical_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        verbose_name="Điểm kỹ thuật AI"
    )
    ai_communication_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        verbose_name="Điểm giao tiếp AI"
    )
    ai_summary = models.TextField(
        blank=True, null=True,
        verbose_name="Nhận xét AI"
    )
    ai_strengths = models.JSONField(
        blank=True, null=True,
        verbose_name="Điểm mạnh (AI)"
    )
    ai_weaknesses = models.JSONField(
        blank=True, null=True,
        verbose_name="Điểm yếu (AI)"
    )
    ai_detailed_feedback = models.JSONField(
        blank=True, null=True,
        verbose_name="Phân tích chi tiết (AI)"
    )

    # Foreign Keys
    candidate = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='interview_sessions',
        verbose_name="Ứng viên"
    )
    job_post = models.ForeignKey(
        JobPost, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='interview_sessions',
        verbose_name="Tin tuyển dụng"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_interviews',
        verbose_name="Người tạo (HR)"
    )

    questions = models.ManyToManyField(
        Question, blank=True,
        related_name='interview_sessions',
        verbose_name="Câu hỏi"
    )
    question_group = models.ForeignKey(
        QuestionGroup, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='interview_sessions',
        verbose_name="Nhóm câu hỏi"
    )
    question_cursor = models.IntegerField(
        default=0,
        verbose_name="Chỉ số câu hỏi hiện tại"
    )

    class Meta:
        db_table = "myjob_interview_session"
        ordering = ['-create_at']
        verbose_name = "Interview Session"
        verbose_name_plural = "Interview Sessions"

    def __str__(self):
        return f"Interview #{self.pk} - {self.candidate.full_name} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        if not self.room_name:
            self.room_name = f"interview-{uuid.uuid4().hex[:12]}"
        if not self.invite_token:
            self.invite_token = uuid.uuid4().hex
        super().save(*args, **kwargs)

class InterviewTranscript(models.Model):
    """Lịch sử hội thoại trong buổi phỏng vấn."""

    SPEAKER_CHOICES = [
        ('ai_agent', 'AI Agent'),
        ('candidate', 'Ứng viên'),
    ]

    interview = models.ForeignKey(
        InterviewSession, on_delete=models.CASCADE,
        related_name='transcripts',
        verbose_name="Buổi phỏng vấn"
    )
    speaker_role = models.CharField(
        max_length=20,
        choices=SPEAKER_CHOICES,
        verbose_name="Vai trò người nói"
    )
    content = models.TextField(verbose_name="Nội dung")
    speech_duration_ms = models.IntegerField(
        blank=True, null=True,
        verbose_name="Thời lượng nói (ms)"
    )
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "myjob_interview_transcript"
        ordering = ['create_at']
        verbose_name = "Interview Transcript"
        verbose_name_plural = "Interview Transcripts"

    def __str__(self):
        return f"[{self.get_speaker_role_display()}] {self.content[:60]}"

# Interview Evaluation (HR đánh giá)

class InterviewEvaluation(InterviewBaseModel):
    """Đánh giá kết quả phỏng vấn bởi HR."""

    RESULT_CHOICES = [
        ('passed', 'Đạt'),
        ('failed', 'Không đạt'),
        ('pending', 'Chờ đánh giá'),
    ]

    interview = models.ForeignKey(
        InterviewSession, on_delete=models.CASCADE,
        related_name='evaluations',
        verbose_name="Buổi phỏng vấn"
    )
    evaluator = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='evaluations',
        verbose_name="Người đánh giá"
    )

    # Scores
    attitude_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        verbose_name="Điểm thái độ"
    )
    professional_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        verbose_name="Điểm chuyên môn"
    )
    overall_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        blank=True, null=True,
        verbose_name="Điểm tổng"
    )

    result = models.CharField(
        max_length=20,
        choices=RESULT_CHOICES,
        default='pending',
        verbose_name="Kết quả"
    )
    comments = models.TextField(
        blank=True, null=True,
        verbose_name="Nhận xét"
    )
    proposed_salary = models.IntegerField(
        blank=True, null=True,
        verbose_name="Mức lương đề xuất"
    )

    class Meta:
        db_table = "myjob_interview_evaluation"
        ordering = ['-create_at']
        verbose_name = "Interview Evaluation"
        verbose_name_plural = "Interview Evaluations"

    def __str__(self):
        return f"Eval #{self.pk} for Interview #{self.interview_id} - {self.get_result_display()}"
