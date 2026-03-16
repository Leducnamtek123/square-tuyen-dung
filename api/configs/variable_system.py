
from django.conf import settings

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
NO_IMAGE = f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}no_image.png"
NOTIFICATION_IMAGE_DEFAULT = f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}notification_image_default.png"

DATE_TIME_FORMAT = {
    "dmY": "%d/%m/%Y",
    "Ymd": "%Y-%m-%d",
    "ISO8601": "%Y-%m-%dT%H:%M:%S.%fZ"
}

AUTH_PROVIDERS = (('email', 'email'), ('facebook',
                  'facebook'), ('google', 'google'))

AVATAR_DEFAULT = {
    "AVATAR": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}avt_default.jpg",
    "COMPANY_LOGO": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}company_logo_default.png",
    "COMPANY_COVER_IMAGE": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}company_cover_image_default.jpg",
}

COMPANY_INFO = {
    "DARK_LOGO_LINK": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}job_dark_logo.png",
    "LIGHT_LOGO_LINK": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['system']}myjob_light_logo.png",
    "EMAIL": "myjob.support@gmail.com",
    "PHONE": "0888-425-094",
    "ADDRESS": "1242 QL1A, Tan Tao A, Binh Tan, Ho Chi Minh City",
    "WORK_TIME": "8:00 - 17:30 (Monday - Friday)",
    "MY_COMPANY_NAME": settings.COMPANY_NAME
}

ABOUT_US_IMAGE_URLS = {
    "JOB_SEEKER": {
        "FEEDBACK_GUIDE": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['about_us']}job_seeker_feedback_guide.png",
        "ACHIEVEMENTS": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['about_us']}job_seeker_achievements.png",
    },
    "EMPLOYER": {
        "FEEDBACK_GUIDE": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['about_us']}job_seeker_feedback_guide.png",
        "ACHIEVEMENTS": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['about_us']}employer_achievements.png",
    }
}

CHATBOT_ICONS = {
    "job_seeker_search_job": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_search_job.png",
    "job_seeker_search_company": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_search_company.png",
    "job_seeker_manage_profile": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_manage_profile.png",
    "job_seeker_track_application_status": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_track_application_status.png",
    "job_seeker_manage_all_profile": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_manage_all_profile.png",
    "job_seeker_myjob_profile": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_myjob_profile.png",
    "job_seeker_attached_profile": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_attached_profile.png",
    "job_seeker_about_us_target_1": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_about_us_target_1.png",
    "job_seeker_about_us_target_2": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_about_us_target_2.png",
    "job_seeker_about_us_target_3": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_about_us_target_3.png",
    "job_seeker_about_us_target_4": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}job_seeker_about_us_target_4.png",
    "employer_search_candidate": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}employer_search_candidate.png",
    "employer_manage_candidate": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}employer_manage_candidate.png",
    "employer_update_company_info": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}employer_update_company_info.png",
    "common_feedback": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_feedback.png",
    "common_support": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_support.png",
    "common_about_us": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_about_us.png",
    "common_notification": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_notification.png",
    "common_login": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_login.png",
    "common_account_and_password": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_account_and_password.png",
    "common_faq": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_faq.png",
    "common_how_to_use": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_how_to_use.png",
    "common_chat_with_us": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_chat_with_us.png",
    "common_social": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_social.png",
    "common_social_facebook": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_social_facebook.png",
    "common_social_linkedin": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_social_linkedin.png",
    "common_social_youtube": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_social_youtube.png",
    "common_social_instagram": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_social_instagram.png",
    "common_privacy_policy": f"{settings.CLOUDINARY_PATH.format('1')}{settings.CLOUDINARY_DIRECTORY['icons']}common_privacy_policy.png"
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

PLATFORM_CHOICES = (
    ('WEB', 'Website'),
    ('APP', 'Application')
)

LINK_GOOGLE_PLAY = "https://play.google.com/store/apps?hl=en"
LINK_APPSTORE = "https://www.apple.com/vn/app-store/"

ROLE_CHOICES = (
    (ADMIN, 'Administrator'),
    (EMPLOYER, 'Employer'),
    (JOB_SEEKER, 'Job Seeker')
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
        "name": "Owner",
        "permissions": ["*"],
    },
    "hr": {
        "name": "HR",
        "permissions": [
            "manage_candidates",
            "manage_interviews",
            "manage_question_bank",
            "manage_members",
        ],
    },
}

JOB_POST_STATUS = (
    (1, 'Pending'),
    (2, 'Rejected'),
    (3, 'Approved')
)

GENDER_CHOICES = (
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other')
)

MARITAL_STATUS_CHOICES = (
    ('S', 'Single'),
    ('M', 'Married')
)

LANGUAGE_CHOICES = (
    (1, 'Vietnamese'),
    (2, 'English'),
    (3, 'Japanese'),
    (4, 'French'),
    (5, 'Chinese'),
    (6, 'Russian'),
    (7, 'Korean'),
    (8, 'German'),
    (9, 'Italian'),
    (10, 'Arabic'),
    (11, 'Other'),
)

LANGUAGE_LEVEL_CHOICES = (
    (1, 'Level 1'),
    (2, 'Level 2'),
    (3, 'Level 3'),
    (4, 'Level 4'),
    (5, 'Level 5')
)

POSITION_CHOICES = (
    (1, 'Senior Management'),
    (2, 'Middle Management'),
    (3, 'Team Leader - Supervisor'),
    (4, 'Specialist'),
    (5, 'Staff / Employee'),
    (6, 'Collaborator'),
)

TYPE_OF_WORKPLACE_CHOICES = (
    (1, 'Office-based'),
    (2, 'Hybrid'),
    (3, 'Remote / Work from home')
)

# OK
JOB_TYPE_CHOICES = (
    (1, 'Full-time Permanent'),
    (2, 'Full-time Temporary'),
    (3, 'Part-time Permanent'),
    (4, 'Part-time Temporary'),
    (5, 'Consultancy Contract'),
    (6, 'Internship'),
    (7, 'Other'),
)

EXPERIENCE_CHOICES = (
    (1, 'No experience'),
    (2, 'Under 1 year'),
    (3, '1 year'),
    (4, '2 years'),
    (5, '3 years'),
    (6, '4 years'),
    (7, '5 years'),
    (8, 'Over 5 years')
)

ACADEMIC_LEVEL = (
    (1, 'Postgraduate'),
    (2, 'University'),
    (3, 'College'),
    (4, 'Vocational / Intermediate'),
    (5, 'High School'),
    (6, 'Certificate')
)

EMPLOYEE_SIZE_CHOICES = (
    (1, 'Under 10 employees'),
    (2, '10 - 150 employees'),
    (3, '150 - 300 employees'),
    (4, 'Over 300 employees'),
)

APPLICATION_STATUS = (
    (1, 'Pending Confirmation'),
    (2, 'Contacted'),
    (3, 'Tested'),
    (4, 'Interviewed'),
    (5, 'Hired'),
    (6, 'Not Selected')
)

FREQUENCY_NOTIFICATION = (
    (1, 'Daily'),
    (2, 'Every 3 Days'),
    (3, 'Weekly'),
)

DESCRIPTION_LOCATION = (
    (1, 'TOP_LEFT'),
    (2, 'TOP_RIGHT'),
    (3, 'BOTTOM_LEFT'),
    (4, 'BOTTOM_RIGHT')
)

BANNER_TYPE = (
    (1, 'HOME'),
    (2, 'MAIN_JOB_RIGHT'),
)
