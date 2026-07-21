
from django.urls import path

from .views import employer_webhook, jobseeker_webhook

urlpatterns = [
    path("jobseeker/webhook/", jobseeker_webhook, name="jobseeker-webhook"),
    path("employer/webhook/", employer_webhook, name="employer-webhook"),
]
