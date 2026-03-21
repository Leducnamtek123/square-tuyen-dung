"""
Backward-compatible re-export module.

The serializer classes have been refactored into the `serializers_pkg` package:
  - serializers_pkg/company_serializers.py  (CompanySerializer, CompanyImageSerializer, etc.)
  - serializers_pkg/profile_serializers.py  (JobSeekerProfileSerializer, SendMailToJobSeekerSerializer)
  - serializers_pkg/resume_serializers.py   (ResumeSerializer, ResumeDetailSerializer, etc.)

This file re-exports everything so that existing imports like
`from ..serializers import CompanySerializer` continue to work unchanged.
"""
from .serializers_pkg import *  # noqa: F401,F403
