"""
MyJob Recruitment System - Part of MyJob Platform

Author: Square
Email: square@example.com
Copyright (c) 2023 Square

License: MIT License
See the LICENSE file in the project root for full license information.
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myjob_api.settings")

app = Celery("myjob_api")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
