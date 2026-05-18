import logging
import base64
import json
import os
from typing import Optional

import firebase_admin
from google.auth.transport import requests as google_auth_requests
from google.oauth2 import id_token as google_id_token
from django.conf import settings
from firebase_admin import auth, credentials, firestore

logger = logging.getLogger(__name__)
_FIREBASE_APP: Optional[firebase_admin.App] = None
_FIREBASE_DISABLED = False


def has_firebase_admin_credentials() -> bool:
    credentials_json = getattr(settings, "FIREBASE_CREDENTIALS_JSON", "")
    credentials_json_base64 = getattr(settings, "FIREBASE_CREDENTIALS_JSON_BASE64", "")
    credentials_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", "")
    return bool(credentials_json or credentials_json_base64 or credentials_path)


def initialize_firebase_app() -> Optional[firebase_admin.App]:
    global _FIREBASE_APP
    global _FIREBASE_DISABLED

    if _FIREBASE_APP:
        return _FIREBASE_APP
    if _FIREBASE_DISABLED:
        return None

    try:
        _FIREBASE_APP = firebase_admin.get_app()
        return _FIREBASE_APP
    except ValueError:
        pass

    try:
        credentials_json = getattr(settings, "FIREBASE_CREDENTIALS_JSON", "")
        credentials_json_base64 = getattr(settings, "FIREBASE_CREDENTIALS_JSON_BASE64", "")
        if credentials_json_base64 and not credentials_json:
            credentials_json = base64.b64decode(credentials_json_base64).decode("utf-8")

        if credentials_json:
            credential = credentials.Certificate(json.loads(credentials_json))
        else:
            credentials_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", "")
            if not credentials_path:
                logger.debug("Firebase Admin app not initialized: service-account credentials are not configured.")
                _FIREBASE_DISABLED = True
                return None
            if not os.path.isfile(credentials_path):
                logger.warning("Firebase Admin app not initialized: FIREBASE_CREDENTIALS_PATH does not exist.")
                _FIREBASE_DISABLED = True
                return None
            credential = credentials.Certificate(credentials_path)

        _FIREBASE_APP = firebase_admin.initialize_app(credential)
        return _FIREBASE_APP
    except Exception:
        logger.exception("Firebase initialization failed")
        _FIREBASE_DISABLED = True
        return None


def get_firestore_client():
    if not (_FIREBASE_APP or has_firebase_admin_credentials()):
        return None
    app = _FIREBASE_APP or initialize_firebase_app()
    if not app:
        return None
    return firestore.client(app=app)


def verify_id_token(id_token: str):
    app = _FIREBASE_APP
    if not app and has_firebase_admin_credentials():
        app = initialize_firebase_app()
    if app:
        try:
            return auth.verify_id_token(id_token, app=app)
        except Exception:
            logger.exception("Firebase Admin token verification failed")

    project_id = (getattr(settings, "FIREBASE_CONFIG", {}) or {}).get("projectId")
    if not project_id:
        logger.error("Firebase token verification failed: FIREBASE_PROJECT_ID is missing.")
        return None

    try:
        decoded_token = google_id_token.verify_firebase_token(
            id_token,
            google_auth_requests.Request(),
            audience=project_id,
        )
        expected_issuer = f"https://securetoken.google.com/{project_id}"
        if decoded_token.get("iss") != expected_issuer:
            logger.error("Firebase token verification failed: invalid issuer.")
            return None
        return decoded_token
    except Exception:
        logger.exception("Firebase public token verification failed")
        return None
