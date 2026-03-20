from django.db import models
from django.utils.translation import gettext_lazy as _

from shared.configs.storage_interface import asset_url, get_setting

ADMIN = 'ADMIN'
EMPLOYER = 'EMPLOYER'
JOB_SEEKER = 'JOB_SEEKER'

CV_WEBSITE = "WEBSITE"
CV_UPLOAD = "UPLOAD"

NOTIFICATION_TYPE = {
    "SYSTEM": "SYSTEM",
    "EMPLOYER_VIEWED_RESUME": "EMPLOYER_VIEWED_RESUME",
    "EMPLOYER_SAVED_RESUME": "EMPLOYER_SAVED_RESUME",
    "APPLY_STATUS": "APPLY_STATUS",
    "COMPANY_FOLLOWED": "COMPANY_FOLLOWED",
    "APPLY_JOB": "APPLY_JOB",
    "POST_VERIFY_REQUIRED": "POST_VERIFY_REQUIRED",
    "POST_VERIFY_RESULT": "POST_VERIFY_RESULT"
}
NO_IMAGE = asset_url("system", "no_image.png")
NOTIFICATION_IMAGE_DEFAULT = asset_url("system", "notification_image_default.png")

DATE_TIME_FORMAT = {
    "dmY": "%d/%m/%Y",
    "Ymd": "%Y-%m-%d",
    "ISO8601": "%Y-%m-%dT%H:%M:%S.%fZ"
}

AUTH_PROVIDERS = (('email', 'email'), ('facebook',
                  'facebook'), ('google', 'google'))

AVATAR_DEFAULT = {
    "AVATAR": asset_url("system", "avt_default.jpg"),
    "COMPANY_LOGO": asset_url("system", "company_logo_default.png"),
    "COMPANY_COVER_IMAGE": asset_url("system", "company_cover_image_default.jpg"),
}

COMPANY_INFO = {
    "DARK_LOGO_LINK": asset_url("system", "job_dark_logo.png"),
    "LIGHT_LOGO_LINK": asset_url("system", "project_light_logo.png"),
    "EMAIL": get_setting("COMPANY_CONTACT_EMAIL", "support@squaregroup.vn"),
    "PHONE": get_setting("COMPANY_CONTACT_PHONE", ""),
    "ADDRESS": get_setting("COMPANY_CONTACT_ADDRESS", ""),
    "WORK_TIME": get_setting("COMPANY_WORK_TIME", ""),
    "MY_COMPANY_NAME": get_setting("COMPANY_NAME", "Project"),
}

ABOUT_US_IMAGE_URLS = {
    "JOB_SEEKER": {
        "FEEDBACK_GUIDE": asset_url("about_us", "job_seeker_feedback_guide.png"),
        "ACHIEVEMENTS": asset_url("about_us", "job_seeker_achievements.png"),
    },
    "EMPLOYER": {
        "FEEDBACK_GUIDE": asset_url("about_us", "job_seeker_feedback_guide.png"),
        "ACHIEVEMENTS": asset_url("about_us", "employer_achievements.png"),
    }
}

CHATBOT_ICONS = {
    "job_seeker_search_job": asset_url("icons", "job_seeker_search_job.png"),
    "job_seeker_search_company": asset_url("icons", "job_seeker_search_company.png"),
    "job_seeker_manage_profile": asset_url("icons", "job_seeker_manage_profile.png"),
    "job_seeker_track_application_status": asset_url("icons", "job_seeker_track_application_status.png"),
    "job_seeker_manage_all_profile": asset_url("icons", "job_seeker_manage_all_profile.png"),
    "job_seeker_project_profile": asset_url("icons", "job_seeker_project_profile.png"),
    "job_seeker_attached_profile": asset_url("icons", "job_seeker_attached_profile.png"),
    "job_seeker_about_us_target_1": asset_url("icons", "job_seeker_about_us_target_1.png"),
    "job_seeker_about_us_target_2": asset_url("icons", "job_seeker_about_us_target_2.png"),
    "job_seeker_about_us_target_3": asset_url("icons", "job_seeker_about_us_target_3.png"),
    "job_seeker_about_us_target_4": asset_url("icons", "job_seeker_about_us_target_4.png"),
    "employer_search_candidate": asset_url("icons", "employer_search_candidate.png"),
    "employer_manage_candidate": asset_url("icons", "employer_manage_candidate.png"),
    "employer_update_company_info": asset_url("icons", "employer_update_company_info.png"),
    "common_feedback": asset_url("icons", "common_feedback.png"),
    "common_support": asset_url("icons", "common_support.png"),
    "common_about_us": asset_url("icons", "common_about_us.png"),
    "common_notification": asset_url("icons", "common_notification.png"),
    "common_login": asset_url("icons", "common_login.png"),
    "common_account_and_password": asset_url("icons", "common_account_and_password.png"),
    "common_faq": asset_url("icons", "common_faq.png"),
    "common_how_to_use": asset_url("icons", "common_how_to_use.png"),
    "common_chat_with_us": asset_url("icons", "common_chat_with_us.png"),
    "common_social": asset_url("icons", "common_social.png"),
    "common_social_facebook": asset_url("icons", "common_social_facebook.png"),
    "common_social_linkedin": asset_url("icons", "common_social_linkedin.png"),
    "common_social_youtube": asset_url("icons", "common_social_youtube.png"),
    "common_social_instagram": asset_url("icons", "common_social_instagram.png"),
    "common_privacy_policy": asset_url("icons", "common_privacy_policy.png"),
}

SOCIAL_MEDIA_LINKS = {
    "facebook": "https://www.facebook.com/bkhuy/",
    "linkedin": "https://www.linkedin.com/in/huy-khanh-10041b20b/",
    "youtube": "https://www.youtube.com/channel/UCn49BvcP1w1mamaOSGTKVZw",
    "instagram": "https://www.instagram.com/huy.buikhanh_/",
    "github": "https://github.com/Square",
    "tiktok": "https://www.tiktok.com/@khanhhuy_27?_t=ZS-8vSsKoClLBB&_r=1",
    "twitter": "",
    "telegram": "",
}

class Platform(models.TextChoices):
    WEB = 'WEB', _('Website')
    APP = 'APP', _('Application')


PLATFORM_CHOICES = Platform.choices

LINK_GOOGLE_PLAY = "https://play.google.com/store/apps?hl=en"
LINK_APPSTORE = "https://www.apple.com/vn/app-store/"

ROLE_CHOICES = (
    (ADMIN, _('Administrator')),
    (EMPLOYER, _('Employer')),
    (JOB_SEEKER, _('Job Seeker'))
)

COMPANY_PERMISSION_KEYS = (
    "manage_company_profile",
    "manage_job_posts",
    "manage_candidates",
    "manage_interviews",
    "manage_question_bank",
    "manage_members",
    "manage_roles",
)

COMPANY_SYSTEM_ROLES = {
    "owner": {
        "name": _("Owner"),
        "permissions": ["*"],
    },
    "hr": {
        "name": _("HR"),
        "permissions": [
            "manage_candidates",
            "manage_interviews",
            "manage_question_bank",
            "manage_members",
        ],
    },
}

class JobPostStatus(models.IntegerChoices):
    PENDING = 1, _('Pending')
    REJECTED = 2, _('Rejected')
    APPROVED = 3, _('Approved')


JOB_POST_STATUS = JobPostStatus.choices

GENDER_CHOICES = (
    ('M', _('Male')),
    ('F', _('Female')),
    ('O', _('Other'))
)

class MaritalStatus(models.TextChoices):
    SINGLE = 'S', _('Single')
    MARRIED = 'M', _('Married')


MARITAL_STATUS_CHOICES = MaritalStatus.choices

LANGUAGE_CHOICES = (
    (1, _('Vietnamese')),
    (2, _('English')),
    (3, _('Japanese')),
    (4, _('French')),
    (5, _('Chinese')),
    (6, _('Russian')),
    (7, _('Korean')),
    (8, _('German')),
    (9, _('Italian')),
    (10, _('Arabic')),
    (11, _('Other')),
)

LANGUAGE_LEVEL_CHOICES = (
    (1, _('Level 1')),
    (2, _('Level 2')),
    (3, _('Level 3')),
    (4, _('Level 4')),
    (5, _('Level 5'))
)

POSITION_CHOICES = (
    (1, _('Senior Management')),
    (2, _('Middle Management')),
    (3, _('Team Leader - Supervisor')),
    (4, _('Specialist')),
    (5, _('Staff / Employee')),
    (6, _('Collaborator')),
)

TYPE_OF_WORKPLACE_CHOICES = (
    (1, _('Office-based')),
    (2, _('Hybrid')),
    (3, _('Remote / Work from home'))
)

# OK
JOB_TYPE_CHOICES = (
    (1, _('Full-time Permanent')),
    (2, _('Full-time Temporary')),
    (3, _('Part-time Permanent')),
    (4, _('Part-time Temporary')),
    (5, _('Consultancy Contract')),
    (6, _('Internship')),
    (7, _('Other')),
)

EXPERIENCE_CHOICES = (
    (1, _('No experience')),
    (2, _('Under 1 year')),
    (3, _('1 year')),
    (4, _('2 years')),
    (5, _('3 years')),
    (6, _('4 years')),
    (7, _('5 years')),
    (8, _('Over 5 years'))
)

ACADEMIC_LEVEL = (
    (1, _('Postgraduate')),
    (2, _('University')),
    (3, _('College')),
    (4, _('Vocational / Intermediate')),
    (5, _('High School')),
    (6, _('Certificate'))
)

EMPLOYEE_SIZE_CHOICES = (
    (1, _('Under 10 employees')),
    (2, _('10 - 150 employees')),
    (3, _('150 - 300 employees')),
    (4, _('Over 300 employees')),
)

class ApplicationStatus(models.IntegerChoices):
    PENDING_CONFIRMATION = 1, _('Pending Confirmation')
    CONTACTED = 2, _('Contacted')
    TESTED = 3, _('Tested')
    INTERVIEWED = 4, _('Interviewed')
    HIRED = 5, _('Hired')
    NOT_SELECTED = 6, _('Not Selected')


APPLICATION_STATUS = ApplicationStatus.choices

FREQUENCY_NOTIFICATION = (
    (1, _('Daily')),
    (2, _('Every 3 Days')),
    (3, _('Weekly')),
)

class DescriptionLocation(models.IntegerChoices):
    TOP_LEFT = 1, 'TOP_LEFT'
    TOP_RIGHT = 2, 'TOP_RIGHT'
    BOTTOM_LEFT = 3, 'BOTTOM_LEFT'
    BOTTOM_RIGHT = 4, 'BOTTOM_RIGHT'


DESCRIPTION_LOCATION = DescriptionLocation.choices


class BannerType(models.IntegerChoices):
    HOME = 1, 'HOME'
    MAIN_JOB_RIGHT = 2, 'MAIN_JOB_RIGHT'


BANNER_TYPE = BannerType.choices
