import logging

from apps.accounts.models import User
from shared.configs import variable_system as var_sys
from shared.configs.messages import NOTIFICATION_MESSAGES

logger = logging.getLogger(__name__)


class NotificationService:
    @staticmethod
    def add_system_notifications(title, content, user_id_list):
        try:
            from console.jobs import queue_notification

            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                type_name=var_sys.NOTIFICATION_TYPE["SYSTEM"],
                user_id_list=user_id_list,
            )
        except Exception:
            logger.exception("add_system_notifications failed")

    @staticmethod
    def add_employer_viewed_resume_notifications(title, content, company_image, user_id):
        try:
            from console.jobs import queue_notification

            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                type_name=var_sys.NOTIFICATION_TYPE["EMPLOYER_VIEWED_RESUME"],
                image=company_image,
                user_id_list=[user_id],
            )
        except Exception:
            logger.exception("add_employer_viewed_resume_notifications failed")

    @staticmethod
    def add_employer_saved_resume_notifications(title, content, company_image, user_id):
        try:
            from console.jobs import queue_notification

            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                type_name=var_sys.NOTIFICATION_TYPE["EMPLOYER_SAVED_RESUME"],
                image=company_image,
                user_id_list=[user_id],
            )
        except Exception:
            logger.exception("add_employer_saved_resume_notifications failed")

    @staticmethod
    def add_apply_status_notifications(title, content, image, user_id):
        try:
            from console.jobs import queue_notification

            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                image=image,
                type_name=var_sys.NOTIFICATION_TYPE["APPLY_STATUS"],
                user_id_list=[user_id],
            )
        except Exception:
            logger.exception("add_apply_status_notifications failed")

    @staticmethod
    def add_company_followed_notifications(title, content, avatar, user_id):
        try:
            from console.jobs import queue_notification

            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                image=avatar,
                type_name=var_sys.NOTIFICATION_TYPE["COMPANY_FOLLOWED"],
                user_id_list=[user_id],
            )
        except Exception:
            logger.exception("add_company_followed_notifications failed")

    @staticmethod
    def add_apply_job_notifications(job_post_activity):
        try:
            from console.jobs import queue_notification

            title = NOTIFICATION_MESSAGES["APPLICANT_APPLICATION"].format(
                full_name=job_post_activity.full_name,
                email=job_post_activity.email,
            )
            content = NOTIFICATION_MESSAGES["JOB_APPLICATION_SUBMITTED"].format(
                job_name=job_post_activity.job_post.job_name
            )
            avatar = job_post_activity.user.avatar
            avatar_url = avatar.get_full_url() if avatar else var_sys.AVATAR_DEFAULT["AVATAR"]
            content_of_type = {
                "resume_id": job_post_activity.resume_id,
                "resume_slug": job_post_activity.resume.slug,
            }
            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                image=avatar_url,
                content_of_type=content_of_type,
                type_name=var_sys.NOTIFICATION_TYPE["APPLY_JOB"],
                user_id_list=[job_post_activity.job_post.user_id],
            )
        except Exception:
            logger.exception("add_apply_job_notifications failed")

    @staticmethod
    def add_post_verify_required_notifications(company, job_post):
        try:
            from console.jobs import queue_notification

            title = company.company_name
            content = NOTIFICATION_MESSAGES["JOB_POSTING_REQUEST"].format(job_post_title=job_post.job_name)
            company_image = company.logo.get_full_url() if company.logo else var_sys.AVATAR_DEFAULT["COMPANY_LOGO"]
            user_id_list = list(User.objects.filter(is_staff=True).values_list("id", flat=True))
            content_of_type = {"job_post_id": job_post.id}
            queue_notification.add_notification_to_user.delay(
                title=title,
                content=content,
                content_of_type=content_of_type,
                image=company_image,
                type_name=var_sys.NOTIFICATION_TYPE["POST_VERIFY_REQUIRED"],
                user_id_list=user_id_list,
            )
        except Exception:
            logger.exception("add_post_verify_required_notifications failed")

    @staticmethod
    def add_job_post_verify_notification(job_post):
        try:
            from console.jobs import queue_notification

            stt_str = [x[1] for x in var_sys.JOB_POST_STATUS if x[0] == job_post.status][0]
            content = NOTIFICATION_MESSAGES["JOB_STATUS_CHANGE"].format(
                job_name=job_post.job_name, status=stt_str
            )
            queue_notification.add_notification_to_user.delay(
                title=NOTIFICATION_MESSAGES["SYSTEM_NOTIFICATION"],
                content=content,
                type_name=var_sys.NOTIFICATION_TYPE["POST_VERIFY_RESULT"],
                user_id_list=[job_post.user_id],
            )
        except Exception:
            logger.exception("add_job_post_verify_notification failed")
