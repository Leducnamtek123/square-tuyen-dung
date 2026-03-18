import logging

from shared.services.crypto_service import CryptoService
from shared.services.email_service import EmailService
from shared.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


def print_log_error(func_name, error, now=None):
    if isinstance(error, Exception):
        logger.exception("[%s] %s", func_name, error)
        return
    logger.error("[%s] %s", func_name, error)


def get_full_client_url(func, domain_type):
    return EmailService.get_full_client_url(func, domain_type)


def check_expiration_time(expiration_time):
    return CryptoService.check_expiration_time(expiration_time)


def urlsafe_base64_encode_with_expires(data, expires_in_seconds):
    return CryptoService.encode_with_expires(data, expires_in_seconds)


def urlsafe_base64_decode_with_encoded_data(encoded_data):
    return CryptoService.decode_with_encoded_data(encoded_data)


def send_email_verify_email(request, user, platform):
    return EmailService.send_email_verify_email(request, user, platform)


def send_email_reply_to_job_seeker(to, subject, data):
    return EmailService.send_email_reply_to_job_seeker(to, subject, data)


def add_system_notifications(title, content, user_id_list):
    return NotificationService.add_system_notifications(title, content, user_id_list)


def add_employer_viewed_resume_notifications(title, content, company_image, user_id):
    return NotificationService.add_employer_viewed_resume_notifications(
        title, content, company_image, user_id
    )


def add_employer_saved_resume_notifications(title, content, company_image, user_id):
    return NotificationService.add_employer_saved_resume_notifications(
        title, content, company_image, user_id
    )


def add_apply_status_notifications(title, content, image, user_id):
    return NotificationService.add_apply_status_notifications(title, content, image, user_id)


def add_company_followed_notifications(title, content, avatar, user_id):
    return NotificationService.add_company_followed_notifications(title, content, avatar, user_id)


def add_apply_job_notifications(job_post_activity):
    return NotificationService.add_apply_job_notifications(job_post_activity)


def add_post_verify_required_notifications(company, job_post):
    return NotificationService.add_post_verify_required_notifications(company, job_post)


def add_job_post_verify_notification(job_post):
    return NotificationService.add_job_post_verify_notification(job_post)
