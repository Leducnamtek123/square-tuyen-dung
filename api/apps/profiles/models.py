
from shared.configs import variable_system as var_sys

from django.db import models
from shared.models import CommonBaseModel

from django.utils.text import slugify

from ckeditor.fields import RichTextField

from autoslug import AutoSlugField

from apps.accounts.models import User

from apps.files.models import File
from apps.locations.models import City, Location
from common.models import Career


class JobSeekerProfile(CommonBaseModel):
    phone = models.CharField(max_length=15, blank=True, null=True)
    birthday = models.DateField(null=True)
    gender = models.CharField(max_length=1, choices=var_sys.GENDER_CHOICES, null=True)
    marital_status = models.CharField(max_length=1,
                                      choices=var_sys.MARITAL_STATUS_CHOICES,
                                      default=var_sys.MaritalStatus.SINGLE,
                                      null=True)
    id_card_number = models.CharField(max_length=30, blank=True, null=True)
    id_card_issue_date = models.DateField(blank=True, null=True)
    id_card_issue_place = models.CharField(max_length=255, blank=True, null=True)
    tax_code = models.CharField(max_length=30, blank=True, null=True)
    social_insurance_no = models.CharField(max_length=30, blank=True, null=True)
    permanent_address = models.CharField(max_length=255, blank=True, null=True)
    contact_address = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="job_seeker_profile")

    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True,

                                 related_name="job_seeker_profiles")

    class Meta:

        db_table = "project_info_job_seeker_profile"

    def __str__(self):

        return f'Job seeker profile of {self.user.email}'

class Resume(CommonBaseModel):
    title = models.CharField(max_length=200, null=True)
    slug = AutoSlugField(populate_from='title',
                         unique=True,
                         unique_with=['id'],
                         slugify=slugify)
    # slug = AutoSlugField(populate_from='title', unique=True, slugify_function=slugify)

    description = models.TextField(null=True)

    salary_min = models.DecimalField(default=0, max_digits=12, decimal_places=0)
    salary_max = models.DecimalField(default=0, max_digits=12, decimal_places=0)
    expected_salary = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True)
    skills_summary = models.TextField(blank=True, null=True)
    position = models.SmallIntegerField(choices=var_sys.POSITION_CHOICES, null=True)

    experience = models.SmallIntegerField(choices=var_sys.EXPERIENCE_CHOICES, null=True)

    academic_level = models.SmallIntegerField(choices=var_sys.ACADEMIC_LEVEL, null=True)

    type_of_workplace = models.SmallIntegerField(choices=var_sys.TYPE_OF_WORKPLACE_CHOICES, null=True)

    job_type = models.SmallIntegerField(choices=var_sys.JOB_TYPE_CHOICES, null=True)

    is_active = models.BooleanField(default=False, db_index=True)

    type = models.CharField(max_length=10, default=var_sys.CV_UPLOAD)

    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, related_name="resumes")

    career = models.ForeignKey(Career, on_delete=models.SET_NULL, null=True, related_name="resumes")

    job_seeker_profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name="resumes")

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")

    file = models.OneToOneField(File, on_delete=models.SET_NULL, null=True, related_name="resume_file")

    company_viewers = models.ManyToManyField("Company", through='ResumeViewed', related_name="resumes_viewed")

    company_savers = models.ManyToManyField("Company", through='ResumeSaved', related_name="resumes_saved")

    class Meta:

        db_table = "project_info_resume"
        indexes = [
            models.Index(fields=['is_active', '-update_at'], name='idx_resume_active_updated'),
            models.Index(fields=['user', 'is_active'], name='idx_resume_user_active'),
        ]

    def __str__(self):

        return f"{self.title} - {self.user}"

class EducationDetail(CommonBaseModel):
    degree_name = models.CharField(max_length=200)
    major = models.CharField(max_length=255)
    training_place_name = models.CharField(max_length=255)
    start_date = models.DateField()
    completed_date = models.DateField(null=True)
    description = models.CharField(max_length=500, blank=True, null=True)
    grade_or_rank = models.CharField(max_length=100, blank=True, null=True)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="education_details")

    class Meta:

        db_table = "project_info_education_detail"

class ExperienceDetail(CommonBaseModel):
    job_name = models.CharField(max_length=200)
    company_name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.CharField(max_length=500, null=True, blank=True)
    last_salary = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True)
    leave_reason = models.CharField(max_length=255, blank=True, null=True)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE,

                               related_name="experience_details")

    class Meta:

        db_table = "project_info_experience_detail"

class Certificate(CommonBaseModel):

    name = models.CharField(max_length=200)

    training_place = models.CharField(max_length=255)

    start_date = models.DateField()

    expiration_date = models.DateField(null=True, blank=True)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE,

                               related_name='certificates')

    class Meta:

        db_table = "project_info_certificate"

class LanguageSkill(CommonBaseModel):

    language = models.SmallIntegerField(choices=var_sys.LANGUAGE_CHOICES)

    level = models.SmallIntegerField(choices=var_sys.LANGUAGE_LEVEL_CHOICES)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE,

                               related_name="language_skills")

    class Meta:

        db_table = "project_info_language_skill"

class AdvancedSkill(CommonBaseModel):

    name = models.CharField(max_length=200)

    level = models.SmallIntegerField(default=3)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE,

                               related_name='advanced_skills')

    class Meta:

        db_table = "project_info_advanced_skill"

class CompanyFollowed(CommonBaseModel):

    company = models.ForeignKey("Company", on_delete=models.CASCADE)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:

        db_table = "project_info_company_followed"

        verbose_name_plural = "Companies followed"
        indexes = [
            models.Index(fields=['user', 'company'], name='idx_followed_user_company'),
        ]
        unique_together = [('user', 'company')]

    def __str__(self):

        return f"{self.user} followed {self.company}"

class CompanyRole(CommonBaseModel):
    code = models.SlugField(max_length=50)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True, null=True)
    permissions = models.JSONField(default=list, blank=True)
    is_system = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    company = models.ForeignKey("Company", on_delete=models.CASCADE, related_name="roles")

    class Meta:
        db_table = "project_info_company_role"
        constraints = [
            models.UniqueConstraint(fields=["company", "code"], name="uq_company_role_code"),
            models.UniqueConstraint(fields=["company", "name"], name="uq_company_role_name"),
        ]

    def __str__(self):
        return f"{self.company.company_name} - {self.name}"

class Company(CommonBaseModel):

    company_name = models.CharField(max_length=255, unique=True)

    slug = AutoSlugField(populate_from='company_name', unique=True,

                         unique_with=['id'],

                         slugify=slugify, max_length=300)

    facebook_url = models.URLField(null=True, blank=True)

    youtube_url = models.URLField(null=True, blank=True)

    linkedin_url = models.URLField(null=True, blank=True)

    company_email = models.EmailField(max_length=100, unique=True)

    company_phone = models.CharField(max_length=15, unique=True)

    website_url = models.URLField(max_length=300, null=True, blank=True)

    tax_code = models.CharField(max_length=30, unique=True)

    since = models.DateField(null=True)

    field_operation = models.CharField(max_length=255, blank=True, null=True)

    description = RichTextField(blank=True, null=True)

    employee_size = models.SmallIntegerField(choices=var_sys.EMPLOYEE_SIZE_CHOICES, null=True)

    is_verified = models.BooleanField(default=False, db_index=True)

    user = models.OneToOneField(User, on_delete=models.CASCADE,

                                related_name="company")

    logo = models.OneToOneField(File, on_delete=models.SET_NULL, null=True,

                                related_name="company_logo")

    cover_image = models.OneToOneField(File, on_delete=models.SET_NULL, null=True,

                                       related_name="company_cover_image")

    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True,

                                 related_name="companies")

    followers = models.ManyToManyField(User, through='CompanyFollowed', related_name="companies_followed")

    class Meta:

        db_table = "project_info_company"

        verbose_name_plural = "Companies"

    def __str__(self):

        return f"{self.company_name if self.company_name is not None else '-'}"


class TrustReport(CommonBaseModel):
    TARGET_JOB = "job"
    TARGET_COMPANY = "company"
    TARGET_CHOICES = (
        (TARGET_JOB, "Job post"),
        (TARGET_COMPANY, "Company"),
    )

    REASON_SCAM = "scam"
    REASON_WRONG_INFO = "wrong_info"
    REASON_SPAM = "spam"
    REASON_DUPLICATE = "duplicate"
    REASON_OTHER = "other"
    REASON_CHOICES = (
        (REASON_SCAM, "Scam or fraud"),
        (REASON_WRONG_INFO, "Wrong or misleading information"),
        (REASON_SPAM, "Spam"),
        (REASON_DUPLICATE, "Duplicate listing"),
        (REASON_OTHER, "Other"),
    )

    STATUS_OPEN = "open"
    STATUS_REVIEWING = "reviewing"
    STATUS_RESOLVED = "resolved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = (
        (STATUS_OPEN, "Open"),
        (STATUS_REVIEWING, "Reviewing"),
        (STATUS_RESOLVED, "Resolved"),
        (STATUS_REJECTED, "Rejected"),
    )

    target_type = models.CharField(max_length=20, choices=TARGET_CHOICES)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    message = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN, db_index=True)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="trust_reports",
    )
    job_post = models.ForeignKey(
        "jobs.JobPost",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="trust_reports",
    )
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trust_reports")

    class Meta:
        db_table = "project_info_trust_report"
        indexes = [
            models.Index(fields=["target_type", "status"], name="idx_trust_report_target_status"),
            models.Index(fields=["reporter", "status"], name="idx_trust_report_reporter_status"),
        ]

    def __str__(self):
        target = self.company.company_name if self.company_id else (self.job_post.job_name if self.job_post_id else self.target_type)
        return f"{self.get_reason_display()} - {target}"

class CompanyMember(CommonBaseModel):
    STATUS_INVITED = "INVITED"
    STATUS_ACTIVE = "ACTIVE"
    STATUS_DISABLED = "DISABLED"
    STATUS_CHOICES = (
        (STATUS_INVITED, "Invited"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_DISABLED, "Disabled"),
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    joined_at = models.DateTimeField(null=True, blank=True)
    invited_email = models.EmailField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    company = models.ForeignKey("Company", on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_memberships")
    role = models.ForeignKey(CompanyRole, on_delete=models.PROTECT, related_name="members")
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="company_invitations_sent",
    )

    class Meta:
        db_table = "project_info_company_member"
        constraints = [
            models.UniqueConstraint(fields=["company", "user"], name="uq_company_member_company_user"),
        ]

    def __str__(self):
        return f"{self.company.company_name} - {self.user.email}"

class CompanyImage(CommonBaseModel):

    # ForeignKey

    image = models.OneToOneField(File, on_delete=models.CASCADE, related_name="company_image", null=True)

    company = models.ForeignKey("Company", on_delete=models.CASCADE,

                                related_name="company_images")

    class Meta:

        db_table = "project_info_company_image"

class ResumeSaved(CommonBaseModel):

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)

    company = models.ForeignKey(Company, on_delete=models.CASCADE)

    class Meta:

        db_table = "project_info_resume_saved"

        verbose_name_plural = "Resumes saved"

    def __str__(self):

        return f"{self.company} saved {self.resume}"

class ResumeViewed(CommonBaseModel):

    views = models.BigIntegerField(default=0)

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)

    company = models.ForeignKey(Company, on_delete=models.CASCADE)

    class Meta:

        db_table = "project_info_resume_viewed"

        verbose_name_plural = "Resumes viewed"

    def __str__(self):

        return f"{self.company} have watching {self.resume}"

class ContactProfile(CommonBaseModel):

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)

    company = models.ForeignKey(Company, on_delete=models.CASCADE)

    class Meta:

        db_table = "project_info_contact_profile"

        verbose_name_plural = "Contact profiles"

    def __str__(self):

        return f"{self.company} saved {self.resume}"



