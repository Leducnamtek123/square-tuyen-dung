from dataclasses import dataclass
from typing import Any, Dict, Optional

from django.conf import settings

from shared.configs import variable_system as var_sys
from apps.chatbot.chat_responses.employer_chat_response import EmployerChatResponse
from apps.chatbot.chat_responses.job_seeker_chat_response import JobSeekerChatResponse


@dataclass(frozen=True)
class JobSeekerLinks:
    search_job_link: str
    search_company_link: str
    manage_profile_link: str
    online_profile_link: str
    track_application_status_link: str
    login_link: str
    job_notification_link: str
    faq_link: str
    how_to_use_link: str
    account_and_password_link: str
    about_us_link: str
    privacy_policy_link: str
    terms_of_use_link: str
    intellectual_property_link: str


@dataclass(frozen=True)
class EmployerLinks:
    search_candidate_link: str
    manage_candidate_link: str
    update_company_info_link: str
    faq_link: str
    how_to_use_link: str
    account_and_password_link: str
    privacy_policy_link: str
    terms_of_use_link: str
    intellectual_property_link: str


def _get_intent_display_name(payload: Dict[str, Any]) -> Optional[str]:
    return payload.get("queryResult", {}).get("intent", {}).get("displayName")


def _get_contact_consultant_info(query_result: Dict[str, Any], output_context_name: str) -> Optional[Dict[str, Any]]:
    output_contexts = query_result.get("outputContexts", [])
    contact_context = next(
        (context for context in output_contexts if context.get("name", "").endswith(output_context_name)),
        None,
    )
    if contact_context:
        return contact_context.get("parameters", {})
    return None


class JobSeekerDialogFlowService:
    def __init__(self) -> None:
        self.job_seeker_chat_response = JobSeekerChatResponse()
        base_url = settings.WEB_JOB_SEEKER_CLIENT_URL
        self.links = JobSeekerLinks(
            search_job_link=base_url + "viec-lam",
            search_company_link=base_url + "cong-ty",
            manage_profile_link=base_url + "bang-dieu-khien/ho-so",
            online_profile_link=base_url + "bang-dieu-khien/ho-so-tung-buoc/resume",
            track_application_status_link=base_url + "bang-dieu-khien/viec-lam-cua-toi/?tab=2",
            login_link=base_url + "dang-nhap",
            job_notification_link=base_url + "bang-dieu-khien/thong-bao",
            faq_link=base_url + "cau-hoi-thuong-gap",
            how_to_use_link=base_url + "huong-dan-su-dung",
            account_and_password_link=base_url + "bang-dieu-khien/tai-khoan",
            about_us_link=base_url + "ve-chung-toi",
            privacy_policy_link=base_url + "chinh-sach-bao-mat",
            terms_of_use_link=base_url + "dieu-khoan-su-dung",
            intellectual_property_link=base_url + "quyen-so-huu-tri-tue",
        )

    def handle_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        intent = _get_intent_display_name(payload)
        if not intent:
            return self.job_seeker_chat_response.get_error_intent_response()

        if intent == JobSeekerChatResponse.WELCOME_INTENT:
            return self.job_seeker_chat_response.get_welcome_intent_response()
        if intent == JobSeekerChatResponse.SEARCH_JOB_INTENT:
            return self.job_seeker_chat_response.get_search_job_intent_response(
                params={"search_job_link": self.links.search_job_link}
            )
        if intent == JobSeekerChatResponse.SEARCH_COMPANY_INTENT:
            return self.job_seeker_chat_response.get_search_company_intent_response(
                params={"search_company_link": self.links.search_company_link}
            )
        if intent == JobSeekerChatResponse.MANAGE_PROFILE_INTENT:
            return self.job_seeker_chat_response.get_manage_profile_intent_response(
                params={
                    "manage_profile_link": self.links.manage_profile_link,
                    "online_profile_link": self.links.online_profile_link,
                }
            )
        if intent == JobSeekerChatResponse.TRACK_APPLICATION_STATUS_INTENT:
            return self.job_seeker_chat_response.get_track_application_status_intent_response(
                params={"track_application_status_link": self.links.track_application_status_link}
            )
        if intent == JobSeekerChatResponse.FEEDBACK_INTENT:
            reference_image_url = var_sys.ABOUT_US_IMAGE_URLS.get("JOB_SEEKER", {}).get("FEEDBACK_GUIDE", "")
            return self.job_seeker_chat_response.get_feedback_intent_response(
                params={
                    "reference_image_url": reference_image_url,
                    "login_link": self.links.login_link,
                }
            )
        if intent == JobSeekerChatResponse.JOB_NOTIFICATION_INTENT:
            return self.job_seeker_chat_response.get_job_notification_intent_response(
                params={
                    "job_notification_link": self.links.job_notification_link,
                    "login_link": self.links.login_link,
                }
            )
        if intent == JobSeekerChatResponse.SUPPORT_INTENT:
            return self.job_seeker_chat_response.get_support_intent_response(
                params={
                    "faq_link": self.links.faq_link,
                    "how_to_use_link": self.links.how_to_use_link,
                }
            )
        if intent == JobSeekerChatResponse.CONTACT_CONSULTANT_INTENT:
            return self.job_seeker_chat_response.get_contact_consultant_intent_response()
        if intent == JobSeekerChatResponse.CONTACT_CONSULTANT_INPUT_NAME_EMAIL_PHONE_INTENT:
            query_result = payload.get("queryResult", {})
            contact_info = _get_contact_consultant_info(query_result, "/contactinfo")
            if not contact_info:
                return self.job_seeker_chat_response.get_error_intent_response()
            return self.job_seeker_chat_response.get_contact_consultant_input_name_email_phone_intent_response(
                params={
                    "name": contact_info.get("name.original", "---"),
                    "email": contact_info.get("email.original", "---"),
                    "phone": contact_info.get("phone.original", "---"),
                }
            )
        if intent == JobSeekerChatResponse.ACCOUNT_AND_PASSWORD_INTENT:
            return self.job_seeker_chat_response.get_account_and_password_intent_response(
                params={
                    "account_and_password_link": self.links.account_and_password_link,
                    "faq_link": self.links.faq_link,
                    "how_to_use_link": self.links.how_to_use_link,
                }
            )
        if intent == JobSeekerChatResponse.ABOUT_US_INTENT:
            params = {
                "about_us_company_count": "20.000+",
                "about_us_job_count": "1.000.000+",
                "about_us_candidate_count": "5.000.000+",
                "about_us_satisfaction_rate": "98%",
                "about_us_matching_rate": "95%",
                "about_us_image_url": var_sys.ABOUT_US_IMAGE_URLS.get("JOB_SEEKER", {}).get("ACHIEVEMENTS", ""),
                "about_us_action_link": "",
                "search_company_link": self.links.search_company_link,
                "search_job_link": self.links.search_job_link,
                "google_play_download_app_link": var_sys.LINK_GOOGLE_PLAY,
                "app_store_download_app_link": var_sys.LINK_APPSTORE,
                "about_us_contact_info": [
                    f'📍 Địa chỉ: {var_sys.COMPANY_INFO.get("ADDRESS", "")}',
                    f'📞 Hotline: {var_sys.COMPANY_INFO.get("PHONE", "")}',
                    f'✉️ Email: {var_sys.COMPANY_INFO.get("EMAIL", "")}',
                    f'🕒 Giờ làm việc: {var_sys.COMPANY_INFO.get("WORK_TIME", "")}',
                ],
                "facebook_link": var_sys.SOCIAL_MEDIA_LINKS.get("facebook"),
                "linkedin_link": var_sys.SOCIAL_MEDIA_LINKS.get("linkedin"),
                "youtube_link": var_sys.SOCIAL_MEDIA_LINKS.get("youtube"),
                "instagram_link": var_sys.SOCIAL_MEDIA_LINKS.get("instagram"),
                "privacy_policy_link": self.links.privacy_policy_link,
                "terms_of_use_link": self.links.terms_of_use_link,
                "intellectual_property_link": self.links.intellectual_property_link,
            }
            return self.job_seeker_chat_response.get_about_us_intent_response(params=params)

        return self.job_seeker_chat_response.get_fallback_intent_response()


class EmployerDialogFlowService:
    def __init__(self) -> None:
        self.employer_chat_response = EmployerChatResponse()
        base_url = settings.WEB_EMPLOYER_CLIENT_URL
        self.links = EmployerLinks(
            search_candidate_link=base_url + "danh-sach-ung-vien",
            manage_candidate_link=base_url + "ho-so-ung-tuyen",
            update_company_info_link=base_url + "cong-ty",
            faq_link=base_url + "cau-hoi-thuong-gap",
            how_to_use_link=base_url + "huong-dan-su-dung",
            account_and_password_link=base_url + "tai-khoan",
            privacy_policy_link=base_url + "chinh-sach-bao-mat",
            terms_of_use_link=base_url + "dieu-khoan-su-dung",
            intellectual_property_link=base_url + "quyen-so-huu-tri-tue",
        )

    def handle_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        intent = _get_intent_display_name(payload)
        if not intent:
            return self.employer_chat_response.get_error_intent_response()

        if intent == EmployerChatResponse.WELCOME_INTENT:
            return self.employer_chat_response.get_welcome_intent_response()
        if intent == EmployerChatResponse.SEARCH_CANDIDATE_INTENT:
            return self.employer_chat_response.get_search_candidate_intent_response(
                params={"search_candidate_link": self.links.search_candidate_link}
            )
        if intent == EmployerChatResponse.MANAGE_CANDIDATE_INTENT:
            return self.employer_chat_response.get_manage_candidate_intent_response(
                params={"manage_candidate_link": self.links.manage_candidate_link}
            )
        if intent == EmployerChatResponse.UPDATE_COMPANY_INFO_INTENT:
            return self.employer_chat_response.get_update_company_info_intent_response(
                params={"update_company_info_link": self.links.update_company_info_link}
            )
        if intent == EmployerChatResponse.FEEDBACK_INTENT:
            feedback_image_url = "https://img.icons8.com/?size=100&id=52209&format=png"
            return self.employer_chat_response.get_feedback_intent_response(
                params={"feedback_image_url": feedback_image_url}
            )
        if intent == EmployerChatResponse.SUPPORT_INTENT:
            return self.employer_chat_response.get_support_intent_response(
                params={
                    "faq_link": self.links.faq_link,
                    "how_to_use_link": self.links.how_to_use_link,
                }
            )
        if intent == EmployerChatResponse.CONTACT_CONSULTANT_INTENT:
            return self.employer_chat_response.get_contact_consultant_intent_response()
        if intent == EmployerChatResponse.CONTACT_CONSULTANT_INPUT_NAME_COMPANY_EMAIL_PHONE_INTENT:
            query_result = payload.get("queryResult", {})
            contact_info = _get_contact_consultant_info(query_result, "/contactinfo")
            if not contact_info:
                return self.employer_chat_response.get_error_intent_response()
            return self.employer_chat_response.get_contact_consultant_input_name_company_email_phone_intent_response(
                params={
                    "name": contact_info.get("name.original", "---"),
                    "company_name": contact_info.get("company_name.original", "---"),
                    "email": contact_info.get("email.original", "---"),
                    "phone": contact_info.get("phone.original", "---"),
                }
            )
        if intent == EmployerChatResponse.ACCOUNT_AND_PASSWORD_INTENT:
            return self.employer_chat_response.get_account_and_password_intent_response(
                params={
                    "account_and_password_link": self.links.account_and_password_link,
                    "faq_link": self.links.faq_link,
                    "how_to_use_link": self.links.how_to_use_link,
                }
            )
        if intent == EmployerChatResponse.ABOUT_US_INTENT:
            params = {
                "about_us_company_count": "20.000+",
                "about_us_job_count": "1.000.000+",
                "about_us_candidate_count": "5.000.000+",
                "about_us_satisfaction_rate": "98%",
                "about_us_matching_rate": "95%",
                "about_us_image_url": var_sys.ABOUT_US_IMAGE_URLS.get("EMPLOYER", {}).get("ACHIEVEMENTS", ""),
                "about_us_action_link": "",
                "search_candidate_link": self.links.search_candidate_link,
                "google_play_download_app_link": var_sys.LINK_GOOGLE_PLAY,
                "app_store_download_app_link": var_sys.LINK_APPSTORE,
                "about_us_contact_info": [
                    f'📍 Địa chỉ: {var_sys.COMPANY_INFO.get("ADDRESS", "")}',
                    f'📞 Hotline: {var_sys.COMPANY_INFO.get("PHONE", "")}',
                    f'✉️ Email: {var_sys.COMPANY_INFO.get("EMAIL", "")}',
                    f'🕒 Giờ làm việc: {var_sys.COMPANY_INFO.get("WORK_TIME", "")}',
                ],
                "facebook_link": var_sys.SOCIAL_MEDIA_LINKS.get("facebook"),
                "linkedin_link": var_sys.SOCIAL_MEDIA_LINKS.get("linkedin"),
                "youtube_link": var_sys.SOCIAL_MEDIA_LINKS.get("youtube"),
                "instagram_link": var_sys.SOCIAL_MEDIA_LINKS.get("instagram"),
                "privacy_policy_link": self.links.privacy_policy_link,
                "terms_of_use_link": self.links.terms_of_use_link,
                "intellectual_property_link": self.links.intellectual_property_link,
            }
            return self.employer_chat_response.get_about_us_intent_response(params=params)

        return self.employer_chat_response.get_fallback_intent_response()
