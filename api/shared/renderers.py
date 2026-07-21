
from rest_framework.renderers import JSONRenderer
from django.conf import settings
from shared.configs import variable_response


class MyJSONRenderer(JSONRenderer):
    def _normalize_error(self, payload):
        if isinstance(payload, dict):
            if {"code", "message", "details"}.issubset(payload.keys()):
                return {
                    "code": payload.get("code") or "INTERNAL_ERROR",
                    "message": payload.get("message") or "Unexpected error.",
                    "details": payload.get("details"),
                }

            detail = payload.get("detail")
            if isinstance(detail, str):
                return {"code": "BAD_REQUEST", "message": detail, "details": payload}

            return {
                "code": payload.get("code") or "BAD_REQUEST",
                "message": payload.get("message") or "Request failed.",
                "details": payload,
            }

        if isinstance(payload, list):
            return {"code": "BAD_REQUEST", "message": "Request failed.", "details": payload}

        return {"code": "INTERNAL_ERROR", "message": str(payload), "details": None}

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if not getattr(settings, "API_RESPONSE_ENVELOPE_V2", True):
            # Backward-compatible behavior.
            if renderer_context and "response" in renderer_context:
                response_obj = renderer_context["response"]
                if 200 <= response_obj.status_code < 300:
                    if isinstance(data, dict) and set(data.keys()) == {"errors", "data"}:
                        return super().render(data.get("data"), accepted_media_type, renderer_context)
                    return super().render(data, accepted_media_type, renderer_context)

                errors = response_obj.data
                if isinstance(errors, dict) and set(errors.keys()) == {"errors", "data"}:
                    return super().render(errors, accepted_media_type, renderer_context)
                if isinstance(errors, dict):
                    normalized = variable_response.data_response(data=None, errors=errors)
                    return super().render(normalized, accepted_media_type, renderer_context)
                normalized = variable_response.data_response(data=errors, errors={})
                return super().render(normalized, accepted_media_type, renderer_context)
            return super().render(data, accepted_media_type, renderer_context)

        if not renderer_context or "response" not in renderer_context:
            return super().render(data, accepted_media_type, renderer_context)

        response_obj = renderer_context["response"]
        status_code = int(response_obj.status_code)

        if isinstance(data, dict) and {"success", "data", "error"}.issubset(data.keys()):
            return super().render(data, accepted_media_type, renderer_context)

        if 200 <= status_code < 400:
            normalized_data = data
            if isinstance(data, dict) and set(data.keys()) == {"errors", "data"}:
                normalized_data = data.get("data")
            payload = variable_response.data_response(
                errors=None,
                data=normalized_data,
                status=status_code,
            )
            return super().render(payload, accepted_media_type, renderer_context)

        normalized_error = self._normalize_error(data)
        payload = variable_response.data_response(
            errors=normalized_error,
            data=None,
            status=status_code,
        )
        return super().render(payload, accepted_media_type, renderer_context)
