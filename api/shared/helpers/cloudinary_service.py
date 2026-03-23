
import io
import mimetypes
import os
import uuid
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse

from PIL import Image
import httpx
from django.conf import settings
from shared.helpers import helper
from minio import Minio
from minio.error import S3Error

class CloudinaryService:
    @staticmethod
    def _process_image(file_obj):
        try:
            img = Image.open(file_obj)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            MAX_SIZE = (1200, 1200)
            img.thumbnail(MAX_SIZE, Image.LANCZOS)
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=85, method=6)
            output.seek(0)
            return output, output.getbuffer().nbytes, 'image/webp', 'webp'
        except Exception: return None, None, None, None

    @staticmethod
    def _resolve_endpoint(endpoint: str, secure_default: bool):
        secure = secure_default
        if endpoint.startswith("http://") or endpoint.startswith("https://"):
            parsed = urlparse(endpoint)
            endpoint = parsed.netloc
            secure = parsed.scheme == "https"
        return endpoint, secure

    @staticmethod
    def _get_client(endpoint_override: str = None):
        endpoint = endpoint_override or settings.MINIO_ENDPOINT
        endpoint, secure = CloudinaryService._resolve_endpoint(
            endpoint, settings.MINIO_SECURE
        )
        return Minio(
            endpoint=endpoint,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=secure
        )

    @staticmethod
    def _get_presign_client():
        public_base = getattr(settings, "MINIO_PUBLIC_URL", "").strip()
        if public_base:
            return CloudinaryService._get_client(endpoint_override=public_base)
        return CloudinaryService._get_client()

    @staticmethod
    def _ensure_bucket(client: Minio, bucket: str):
        try:
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
        except S3Error as e:
            helper.print_log_error("minio_ensure_bucket", e)
            raise

    @staticmethod
    def _rewrite_presigned_url(url: str):
        """
        Rewrite internal MinIO presigned URLs to the public proxy URL.
        """
        try:
            if not url:
                return url
            public_base = getattr(settings, "MINIO_PUBLIC_URL", "").rstrip("/")
            if not public_base:
                return url
            parsed = urlparse(url)
            internal_host = str(getattr(settings, "MINIO_ENDPOINT", "minio")).replace("http://", "").replace("https://", "").split("/")[0]
            internal_host = internal_host.split(":")[0] if internal_host else "minio"
            # If it's already on the public host, keep it
            if public_base and url.startswith(public_base):
                return url
            # Only rewrite if the presigned URL is for internal MinIO host
            if parsed.hostname not in ("minio", internal_host):
                return url
            # Rewrite host to the public proxy base, keep path/query intact
            return f"{public_base}{parsed.path}?{parsed.query}" if parsed.query else f"{public_base}{parsed.path}"
        except Exception:
            return url

    @staticmethod
    def _normalize_object_name(folder: str, public_id: str, ext: str):
        folder = folder or ""
        if folder and not folder.endswith("/"):
            folder = f"{folder}/"
        object_name = public_id if public_id else str(uuid.uuid4())
        if folder and not object_name.startswith(folder):
            object_name = f"{folder}{object_name}"
        if ext and not object_name.lower().endswith(f".{ext.lower()}"):
            object_name = f"{object_name}.{ext}"
        return object_name

    @staticmethod
    def _detect_format_and_type(filename: str, content_type: str):
        ext = ""
        resource_type = "raw"
        if filename:
            ext = os.path.splitext(filename)[1].lstrip(".").lower()
        if not ext and content_type:
            guessed = mimetypes.guess_extension(content_type.split(";")[0].strip())
            ext = guessed.lstrip(".") if guessed else ""
        if content_type and content_type.startswith("image/"):
            resource_type = "image"
        return ext, resource_type

    @staticmethod
    def _open_file_source(file):
        if isinstance(file, (bytes, bytearray)):
            return io.BytesIO(file), len(file), None, None
        if isinstance(file, str):
            if file.startswith("http://") or file.startswith("https://"):
                resp = httpx.get(file, timeout=30.0)
                resp.raise_for_status()
                data = resp.content
                return io.BytesIO(data), len(data), None, resp.headers.get("Content-Type")
            if os.path.exists(file):
                size = os.path.getsize(file)
                return open(file, "rb"), size, os.path.basename(file), mimetypes.guess_type(file)[0]
        name = getattr(file, "name", None)
        size = getattr(file, "size", None)
        if size is None:
            file.seek(0, os.SEEK_END)
            size = file.tell()
            file.seek(0)
        else:
            file.seek(0)
        return file, size, name, getattr(file, "content_type", None)

    @staticmethod
    def upload_image(file, folder: str, public_id: str = None, options: dict = {}):
        """
        Upload image to MinIO
        
        Args:

            file: File object

            folder: Folder name

            public_id: Public ID

            options: Options

        Returns:

            Upload result

        """

        try:

            client = CloudinaryService._get_client()
            bucket = settings.MINIO_BUCKET
            CloudinaryService._ensure_bucket(client, bucket)

            file_obj, size, filename, content_type = CloudinaryService._open_file_source(file)
            ext, resource_type = CloudinaryService._detect_format_and_type(filename, content_type)
            # 🎨 Auto-Optimization for Images
            if resource_type == 'image' and ext.lower() not in ['gif', 'svg']:
                opt_file, opt_size, opt_ct, opt_ext = CloudinaryService._process_image(file_obj)
                if opt_file:
                    file_obj, size, content_type, ext = opt_file, opt_size, opt_ct, opt_ext
            object_name = CloudinaryService._normalize_object_name(folder, public_id, ext)

            client.put_object(
                bucket,
                object_name,
                file_obj,
                length=size,
                content_type=content_type
            )
            url, _ = CloudinaryService.get_url_from_public_id(object_name, {})
            return {
                "public_id": object_name,
                "version": str(int(datetime.now(timezone.utc).timestamp())),
                "format": ext or "",
                "resource_type": resource_type,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "bytes": size,
                "bucket": bucket,
                "url": url
            }
        except Exception as e:
            helper.print_log_error("minio_upload_image", e)
            return None
    
    @staticmethod
    def upload_file(file, folder: str, public_id: str = None, options: dict = {}):
        return CloudinaryService.upload_image(file, folder, public_id=public_id, options=options)

    @staticmethod
    def delete_image(public_id: str):
        """
        Delete image from MinIO
        
        Args:

            public_id: Public ID

        Returns:

            Delete result (bool)

        """

        try:

            client = CloudinaryService._get_client()
            bucket = settings.MINIO_BUCKET
            client.remove_object(bucket, public_id)
            return True
        except Exception as e:
            helper.print_log_error("minio_delete_image", e)
            return False
    
    @staticmethod
    def get_url_from_public_id(public_id: str, options_config: dict = {}):
        """
        Get URL from public ID
        
        Args:

            public_id: Public ID

            options_config: Options config

        Returns:

            URL and options

        """
        try:
            if not public_id:
                return None

            use_presigned = getattr(settings, "MINIO_USE_PRESIGNED", False)
            base_url = getattr(settings, "MINIO_PUBLIC_URL", "").rstrip("/")
            bucket = settings.MINIO_BUCKET

            # --- Handle full URL public_ids ---
            if isinstance(public_id, str) and (public_id.startswith("http://") or public_id.startswith("https://")):
                if use_presigned:
                    parsed = urlparse(public_id)

                    # Handle public proxy URLs (https://domain/minio/...)
                    if base_url and public_id.startswith(f"{base_url}/"):
                        object_path = public_id[len(base_url) + 1 :]
                        if object_path.startswith(f"{bucket}/"):
                            object_path = object_path[len(bucket) + 1 :]
                        client = CloudinaryService._get_presign_client()
                        expires = getattr(settings, "MINIO_PRESIGN_EXPIRES", 3600)
                        url = client.presigned_get_object(
                            bucket,
                            object_path,
                            expires=timedelta(seconds=expires),
                        )
                        return CloudinaryService._rewrite_presigned_url(url), options_config

                    # Handle legacy/internal MinIO URLs (http(s)://minio:9000/bucket/...)
                    internal_host = str(getattr(settings, "MINIO_ENDPOINT", "minio")).replace("http://", "").replace("https://", "").split("/")[0]
                    internal_host = internal_host.split(":")[0] if internal_host else "minio"
                    if parsed.hostname in ("minio", internal_host):
                        object_path = parsed.path.lstrip("/")
                        if object_path.startswith(f"{bucket}/"):
                            object_path = object_path[len(bucket) + 1 :]
                        client = CloudinaryService._get_presign_client()
                        expires = getattr(settings, "MINIO_PRESIGN_EXPIRES", 3600)
                        url = client.presigned_get_object(
                            bucket,
                            object_path,
                            expires=timedelta(seconds=expires),
                        )
                        return CloudinaryService._rewrite_presigned_url(url), options_config
                else:
                    # Non-presigned: rewrite internal URLs to public base
                    parsed = urlparse(public_id)
                    internal_host = str(getattr(settings, "MINIO_ENDPOINT", "minio")).replace("http://", "").replace("https://", "").split("/")[0]
                    internal_host = internal_host.split(":")[0] if internal_host else "minio"
                    if parsed.hostname in ("minio", internal_host):
                        object_path = parsed.path.lstrip("/")
                        if object_path.startswith(f"{bucket}/"):
                            object_path = object_path[len(bucket) + 1 :]
                        return f"{base_url}/{bucket}/{object_path}", options_config

                return public_id, options_config

            # --- Handle plain public_id (not a URL) ---
            if use_presigned:
                client = CloudinaryService._get_presign_client()
                expires = getattr(settings, "MINIO_PRESIGN_EXPIRES", 3600)
                url = client.presigned_get_object(
                    bucket,
                    public_id.lstrip("/"),
                    expires=timedelta(seconds=expires),
                )
                return CloudinaryService._rewrite_presigned_url(url), options_config

            # Direct URL construction — no network call needed
            url = f"{base_url}/{bucket}/{public_id.lstrip('/')}"
            return url, options_config
            
        except Exception as e:
            helper.print_log_error("minio_get_url", e)
            return None, None
