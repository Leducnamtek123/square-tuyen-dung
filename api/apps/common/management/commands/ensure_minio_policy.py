import json
from django.conf import settings
from django.core.management.base import BaseCommand
from minio import Minio


class Command(BaseCommand):
    help = "Ensures MinIO bucket exists and sets comprehensive public read policy for media assets while keeping private files secure."

    def handle(self, *args, **options):
        endpoint = getattr(settings, 'MINIO_ENDPOINT', 'minio:9000')
        access_key = getattr(settings, 'MINIO_ACCESS_KEY', '')
        secret_key = getattr(settings, 'MINIO_SECRET_KEY', '')
        secure = getattr(settings, 'MINIO_SECURE', False)
        bucket = getattr(settings, 'MINIO_BUCKET', 'square')

        if not endpoint or not access_key or not secret_key:
            self.stdout.write(self.style.WARNING("MinIO configuration missing. Skipping policy setup."))
            return

        try:
            client = Minio(
                endpoint,
                access_key=access_key,
                secret_key=secret_key,
                secure=secure,
            )

            # Ensure bucket exists
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
                self.stdout.write(self.style.SUCCESS(f"Created bucket '{bucket}'."))

            public_patterns = [
                'articles*',
                'articles/*',
                'avatar*',
                'avatar/*',
                'avatars*',
                'avatars/*',
                'banners*',
                'banners/*',
                'career_image*',
                'career_image/*',
                'company_image*',
                'company_image/*',
                'cover_image*',
                'cover_image/*',
                'goldlotustravel*',
                'goldlotustravel/*',
                'vismarttech*',
                'vismarttech/*',
                'icons*',
                'icons/*',
                'logo*',
                'logo/*',
                'logos*',
                'logos/*',
                'system*',
                'system/*',
                'about_us*',
                'about_us/*',
                '*/logo/*',
                '*/cover/*',
                '*/gallery/*',
            ]

            policy = {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Effect': 'Allow',
                        'Principal': {'AWS': ['*']},
                        'Action': ['s3:GetBucketLocation'],
                        'Resource': [f'arn:aws:s3:::{bucket}']
                    },
                    {
                        'Effect': 'Allow',
                        'Principal': {'AWS': ['*']},
                        'Action': ['s3:GetObject'],
                        'Resource': [f'arn:aws:s3:::{bucket}/{p}' for p in public_patterns]
                    },
                    {
                        'Effect': 'Allow',
                        'Principal': {'AWS': ['*']},
                        'Action': ['s3:ListBucket'],
                        'Resource': [f'arn:aws:s3:::{bucket}'],
                        'Condition': {
                            'StringEquals': {
                                's3:prefix': [
                                    'articles', 'avatar', 'avatars', 'banners', 'career_image',
                                    'company_image', 'cover_image', 'icons', 'logo', 'logos',
                                    'system', 'about_us', 'goldlotustravel', 'vismarttech'
                                ]
                            }
                        }
                    }
                ]
            }

            client.set_bucket_policy(bucket, json.dumps(policy))
            self.stdout.write(self.style.SUCCESS(f"Successfully applied public read policy to MinIO bucket '{bucket}'."))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"Failed to configure MinIO bucket policy: {exc}"))
