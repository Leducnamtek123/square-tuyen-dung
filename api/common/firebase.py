import logging
import os
from typing import Optional

import firebase_admin
from django.conf import settings
from firebase_admin import auth, credentials, firestore

logger = logging.getLogger(__name__)
_FIREBASE_APP: Optional[firebase_admin.App] = None


def initialize_firebase_app() -> Optional[firebase_admin.App]:
    global _FIREBASE_APP

    if _FIREBASE_APP:
        return _FIREBASE_APP

    try:
        _FIREBASE_APP = firebase_admin.get_app()
        return _FIREBASE_APP
    except ValueError:
        pass

    credentials_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", "")
    if not credentials_path or not os.path.isfile(credentials_path):
        logger.info("Firebase disabled: FIREBASE_CREDENTIALS_PATH is missing or invalid.")
        return None

    try:
        credential = credentials.Certificate(credentials_path)
        _FIREBASE_APP = firebase_admin.initialize_app(credential)
        return _FIREBASE_APP
    except Exception:
        logger.exception("Firebase initialization failed")
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
