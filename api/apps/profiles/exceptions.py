"""Domain exceptions for Profiles module."""


class ProfilesDomainError(ValueError):
    """Base class for profiles domain errors."""


class ActiveCompanyRequiredError(ProfilesDomainError):
    """Raised when current user has no active company."""
