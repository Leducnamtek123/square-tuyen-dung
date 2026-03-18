from django.conf import settings


def get_setting(name, default=None):
    return getattr(settings, name, default)


def _resolve_base_url():
    backend = str(get_setting("FILE_STORAGE_BACKEND", "cloudinary")).lower()

    if backend in {"s3", "minio"}:
        base = get_setting("FILE_STORAGE_PUBLIC_URL")
        if base:
            return str(base).rstrip("/")
        minio_public = get_setting("MINIO_PUBLIC_URL", "")
        minio_bucket = get_setting("MINIO_BUCKET", "")
        return f"{str(minio_public).rstrip('/')}/{str(minio_bucket).strip('/')}".rstrip("/")

    if backend == "local":
        media_public = get_setting("FILE_STORAGE_PUBLIC_URL") or get_setting("MEDIA_URL", "/media/")
        return str(media_public).rstrip("/")

    base = str(get_setting("CLOUDINARY_PATH", "")).rstrip("/")
    if "{}" in base:
        base = base.format("1")
    return base


def asset_url(directory_key, filename):
    base = _resolve_base_url()
    directories = get_setting("CLOUDINARY_DIRECTORY", {}) or {}
    directory = str(directories.get(directory_key, "")).strip("/")
    clean_name = str(filename).lstrip("/")

    if directory:
        return f"{base}/{directory}/{clean_name}"
    return f"{base}/{clean_name}"
