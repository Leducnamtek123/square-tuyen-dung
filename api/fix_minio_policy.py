
import json
from django.conf import settings
from minio import Minio
from urllib.parse import urlparse

def fix_policy():
    print("Checking MinIO policy...")
    endpoint = settings.MINIO_ENDPOINT
    access_key = settings.MINIO_ACCESS_KEY
    secret_key = settings.MINIO_SECRET_KEY
    secure = settings.MINIO_SECURE
    bucket = settings.MINIO_BUCKET

    if endpoint.startswith("http://") or endpoint.startswith("https://"):
        parsed = urlparse(endpoint)
        endpoint = parsed.netloc
        secure = parsed.scheme == "https"

    client = Minio(
        endpoint=endpoint,
        access_key=access_key,
        secret_key=secret_key,
        secure=secure
    )

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Resource": [f"arn:aws:s3:::{bucket}"]
            },
            {
                "Action": ["s3:GetObject"],
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Resource": [f"arn:aws:s3:::{bucket}/*"]
            }
        ]
    }

    try:
        if not client.bucket_exists(bucket):
            print(f"Bucket {bucket} does not exist. Creating it...")
            client.make_bucket(bucket)
        
        client.set_bucket_policy(bucket, json.dumps(policy))
        print(f"Successfully set ReadOnly policy for bucket: {bucket}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_policy()
