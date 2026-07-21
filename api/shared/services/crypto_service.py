import time
from typing import Optional, Tuple

from django.core import signing
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.http import urlsafe_base64_encode

SIGNING_SALT_VERIFY_EMAIL = "Project.verify_email.v1"


class CryptoService:
    @staticmethod
    def check_expiration_time(expiration_time: int) -> bool:
        return int(expiration_time) - int(time.time()) > 0

    @staticmethod
    def encode_with_expires(data, expires_in_seconds: int) -> str:
        expires_at = int(time.time()) + int(expires_in_seconds)
        payload = {"data": str(data), "exp": expires_at}
        return signing.dumps(payload, salt=SIGNING_SALT_VERIFY_EMAIL, compress=True)

    @staticmethod
    def decode_with_encoded_data(encoded_data: str) -> Tuple[Optional[str], Optional[int]]:
        if not encoded_data:
            return None, None

        # New secure format (signed payload).
        try:
            payload = signing.loads(encoded_data, salt=SIGNING_SALT_VERIFY_EMAIL)
            return str(payload.get("data")), int(payload.get("exp"))
        except Exception:
            pass

        # Backward-compatible fallback for old base64.data format.
        try:
            separator = "." if "." in str(encoded_data) else "|"
            encoded_data_split = str(encoded_data).split(separator)
            data = force_str(urlsafe_base64_decode(encoded_data_split[0]))
            expiration_time = force_str(urlsafe_base64_decode(encoded_data_split[1]))
            return data, int(expiration_time)
        except Exception:
            return None, None

    @staticmethod
    def legacy_base64_encode_with_expires(data, expires_in_seconds: int) -> str:
        base64_data = urlsafe_base64_encode(force_bytes(data))
        current_time = int(time.time())
        expiration_time = current_time + int(expires_in_seconds)
        base64_time = urlsafe_base64_encode(force_bytes(str(expiration_time)))
        return f"{base64_data}.{base64_time}"


