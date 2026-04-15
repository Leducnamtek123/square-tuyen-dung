"""
Domain exceptions for Jobs module.
Keep these as ValueError subclasses for backward compatibility while
allowing explicit handling in views/services.
"""


class JobsDomainError(ValueError):
    """Base exception for jobs domain errors."""


class CompanyNotConfiguredError(JobsDomainError):
    """Employer has no active company configured."""


class JobPostInactiveError(JobsDomainError):
    """Job post is not active/approved anymore."""


class JobPostExpiredError(JobsDomainError):
    """Job post is expired."""


class ResumeOwnershipError(JobsDomainError):
    """Resume does not belong to current user."""


class DuplicateApplicationError(JobsDomainError):
    """User already applied for this job."""


class InvalidApplicationStatusTransitionError(JobsDomainError):
    """Application status transition is invalid."""
