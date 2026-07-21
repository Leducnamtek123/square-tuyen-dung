from apps.jobs.models import JobPostActivity


MANUAL_CANDIDATE_ACTIVITY_FIELD_MAP = {
    "fullName": "full_name",
    "email": "email",
    "phone": "phone",
}


def _first_request_value(value):
    if isinstance(value, (list, tuple)):
        return value[0] if value else None
    return value


def validate_manual_candidate_activity_storage(data):
    errors = {}
    for api_name, model_field in MANUAL_CANDIDATE_ACTIVITY_FIELD_MAP.items():
        if api_name not in data:
            continue

        value = _first_request_value(data.get(api_name))
        if value in (None, ""):
            continue

        max_length = JobPostActivity._meta.get_field(model_field).max_length
        if max_length and len(str(value).strip()) > max_length:
            errors[api_name] = [f"Ensure this field has no more than {max_length} characters."]

    return errors
