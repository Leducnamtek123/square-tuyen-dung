
from shared.configs import variable_system as var_sys

from django.db import models
from shared.models import CommonBaseModel

from ckeditor.fields import RichTextField

from autoslug import AutoSlugField

from django.utils.text import slugify

from apps.accounts.models import User

from apps.locations.models import City, District, Location
from common.models import Career

from apps.profiles.models import Company, Resume

def custom_slugify_function(value, model_instance):

    slug = slugify(value)

    # Kết hợp slug với id của đối tượng

    slug_with_id = f"{slug}-{model_instance.id}"

    return slug_with_id


class JobPost(CommonBaseModel):

    job_name = models.CharField(max_length=255)

    slug = AutoSlugField(populate_from='job_name', unique=True,

                         unique_with=['id'],

                         slugify=slugify, max_length=300)

    deadline = models.DateField(db_index=True)

    quantity = models.IntegerField()

    gender_required = models.CharField(max_length=1, choices=var_sys.GENDER_CHOICES,

                                       blank=True, null=True)

    job_description = RichTextField()

    job_requirement = RichTextField(null=True, blank=True)

    benefits_enjoyed = RichTextField(null=True, blank=True)

    position = models.SmallIntegerField(choices=var_sys.POSITION_CHOICES)

    type_of_workplace = models.SmallIntegerField(choices=var_sys.TYPE_OF_WORKPLACE_CHOICES)

    experience = models.SmallIntegerField(choices=var_sys.EXPERIENCE_CHOICES)

    academic_level = models.SmallIntegerField(choices=var_sys.ACADEMIC_LEVEL)

    job_type = models.SmallIntegerField(choices=var_sys.JOB_TYPE_CHOICES)

    salary_min = models.IntegerField()

    salary_max = models.IntegerField()

    is_hot = models.BooleanField(default=False)

    is_urgent = models.BooleanField(default=False)

    status = models.IntegerField(choices=var_sys.JOB_POST_STATUS, default=var_sys.JobPostStatus.PENDING, db_index=True)

    contact_person_name = models.CharField(max_length=100)

    contact_person_phone = models.CharField(max_length=15)

    contact_person_email = models.EmailField(max_length=100)

    views = models.BigIntegerField(default=0)

    shares = models.BigIntegerField(default=0)

    career = models.ForeignKey(Career, on_delete=models.SET_NULL,

                               related_name="job_posts", null=True)

    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True,

                                 related_name="job_posts")

    user = models.ForeignKey(User, on_delete=models.CASCADE,

                             related_name="job_posts")

    company = models.ForeignKey(Company, on_delete=models.CASCADE,

                                related_name="job_posts")

    peoples_saved = models.ManyToManyField(User, through='SavedJobPost', related_name="saved_job_posts")

    peoples_applied = models.ManyToManyField(User, through='JobPostActivity', related_name="job_posts_activity")

    interview_template = models.ForeignKey('interview.QuestionGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_job_posts')

    class Meta:

        db_table = "project_job_job_post"
        indexes = [
            models.Index(fields=["status", "deadline"], name="job_post_stt_dead_idx"),
            models.Index(fields=["status", "create_at"], name="job_post_stt_create_idx"),
            models.Index(fields=["deadline", "create_at"], name="job_post_dead_create_idx"),
            models.Index(fields=["status", "deadline", "-update_at", "-create_at"], name="job_post_list_idx"),
        ]

    def __str__(self):

        return f"{self.job_name}"

class SavedJobPost(CommonBaseModel):

    job_post = models.ForeignKey(JobPost, on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:

        db_table = "project_job_saved_job_post"

        verbose_name_plural = "Saved job posts"

    def __str__(self):

        return f"{self.user} saved {self.job_post}"

class JobPostActivity(CommonBaseModel):

    full_name = models.CharField(max_length=100, null=True)

    email = models.EmailField(max_length=100, null=True)

    phone = models.CharField(max_length=15, null=True)

    status = models.IntegerField(
        choices=var_sys.APPLICATION_STATUS,
        default=var_sys.ApplicationStatus.PENDING_CONFIRMATION,
        db_index=True,
    )

    is_sent_email = models.BooleanField(default=False)

    is_deleted = models.BooleanField(default=False, db_index=True)

    job_post = models.ForeignKey(JobPost, on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, null=True)

    # AI Analysis Fields

    ai_analysis_score = models.IntegerField(null=True, blank=True)

    ai_analysis_summary = models.TextField(null=True, blank=True)

    ai_analysis_skills = models.TextField(null=True, blank=True) # JSON or Comma separated

    ai_analysis_pros = models.TextField(null=True, blank=True)

    ai_analysis_cons = models.TextField(null=True, blank=True)

    ai_analysis_matching_skills = models.JSONField(null=True, blank=True)

    ai_analysis_missing_skills = models.JSONField(null=True, blank=True)

    ai_analysis_status = models.CharField(max_length=20, choices=[

        ('pending', 'Pending'),

        ('processing', 'Processing'),

        ('completed', 'Completed'),

        ('failed', 'Failed')

    ], default='pending')
    ai_analysis_progress = models.PositiveSmallIntegerField(default=0)

    class Meta:

        db_table = "project_job_job_post_activity"

        verbose_name_plural = "Job posts activity"
        indexes = [
            models.Index(fields=["status", "is_deleted"], name="job_act_stt_del_idx"),
            models.Index(fields=["job_post", "status"], name="job_act_post_stt_idx"),
            models.Index(fields=["create_at"], name="job_act_create_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'job_post', 'is_deleted'],
                name='uq_jobpostactivity_user_jobpost_deleted_state',
            ),
        ]

class JobPostNotification(CommonBaseModel):

    job_name = models.CharField(max_length=255)

    position = models.SmallIntegerField(choices=var_sys.POSITION_CHOICES, null=True)

    experience = models.SmallIntegerField(choices=var_sys.EXPERIENCE_CHOICES, null=True)

    salary = models.IntegerField(null=True)

    frequency = models.IntegerField(choices=var_sys.FREQUENCY_NOTIFICATION)

    is_active = models.BooleanField(default=False)

    career = models.ForeignKey(Career, on_delete=models.SET_NULL,

                               related_name="job_post_notifications", null=True)

    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True,

                             related_name="job_post_notifications")

    user = models.ForeignKey(User, on_delete=models.CASCADE,

                             related_name="job_post_notifications")

    class Meta:

        db_table = "project_job_job_post_notification"

        verbose_name_plural = "Job post notifications"



