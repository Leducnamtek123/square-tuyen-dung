import logging
import base64
import json
import os
from typing import Optional

import firebase_admin
from django.conf import settings
from firebase_admin import auth, credentials, firestore

logger = logging.getLogger(__name__)
_FIREBASE_APP: Optional[firebase_admin.App] = None
_FIREBASE_DISABLED = False


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
            if not credentials_path or not os.path.isfile(credentials_path):
                logger.info("Firebase disabled: FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON is missing or invalid.")
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
    app = _FIREBASE_APP or initialize_firebase_app()
    if not app:
        return None
    return firestore.client(app=app)


def verify_id_token(id_token: str):
    app = _FIREBASE_APP or initialize_firebase_app()
    if not app:
        return None
    try:
        decoded_token = auth.verify_id_token(id_token, app=app)
        return decoded_token
    except Exception:
        logger.exception("Firebase token verification failed")
        return None
