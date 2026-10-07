"""Clean Code Checker — analyse a GitHub repository for clean-code issues.

The public entry point is :func:`cleancode.analyzer.analyze_repo`.
"""

from .analyzer import analyze_repo
from .github import GitHubError
from .local import analyze_local

__all__ = ["analyze_repo", "analyze_local", "GitHubError"]
__version__ = "1.1.0"
