"""
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
"""


import io
import mimetypes
import os
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
from django.conf import settings
from helpers import helper
from minio import Minio
from minio.error import S3Error

class CloudinaryService:
    @staticmethod
    def _get_client():
        endpoint = settings.MINIO_ENDPOINT
        secure = settings.MINIO_SECURE
        if endpoint.startswith("http://") or endpoint.startswith("https://"):
            parsed = urlparse(endpoint)
            endpoint = parsed.netloc
            secure = parsed.scheme == "https"
        return Minio(
            endpoint=endpoint,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=secure
        )

    @staticmethod
    def _ensure_bucket(client: Minio, bucket: str):
        try:
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
        except S3Error as e:
            helper.print_log_error("minio_ensure_bucket", e)
            raise

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
                "created_at": datetime.now(timezone.utc),
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
            if isinstance(public_id, str) and (public_id.startswith("http://") or public_id.startswith("https://")):
                return public_id, options_config
                
            base_url = settings.MINIO_PUBLIC_URL.rstrip("/")
            bucket = settings.MINIO_BUCKET
            url = f"{base_url}/{bucket}/{public_id.lstrip('/')}"
            return url, options_config
            
        except Exception as e:
            helper.print_log_error("minio_get_url", e)
            return None, None
