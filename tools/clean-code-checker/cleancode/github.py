"""A tiny, dependency-free GitHub REST client.

Only the handful of endpoints the checker needs are implemented. File contents
are pulled from the ``raw.githubusercontent.com`` CDN (which does *not* count
against the API rate limit) for public repos, and from the authenticated blob
API when a token is supplied so that private repos work too.
"""

from __future__ import annotations

import base64
import binascii
import json
import re
import urllib.error
import urllib.parse
import urllib.request

API_ROOT = "https://api.github.com"
RAW_ROOT = "https://raw.githubusercontent.com"
USER_AGENT = "clean-code-checker/1.0"
TIMEOUT_SECONDS = 20


class GitHubError(Exception):
    """Raised for any problem talking to GitHub, with a user-facing message."""


_REPO_PATTERNS = (
    re.compile(r"github\.com[:/]+(?P<owner>[^/]+)/(?P<repo>[^/]+?)(?:\.git)?/?$"),
    re.compile(r"^(?P<owner>[^/\s]+)/(?P<repo>[^/\s]+?)(?:\.git)?/?$"),
)


def parse_repo(reference: str) -> tuple[str, str]:
    """Parse ``owner/repo`` out of a URL or shorthand.

    Accepts ``https://github.com/owner/repo``, ``git@github.com:owner/repo.git``
    and the bare ``owner/repo`` form.
    """
    reference = (reference or "").strip()
    if not reference:
        raise GitHubError("Please provide a GitHub repository URL.")
    for pattern in _REPO_PATTERNS:
        match = pattern.search(reference)
        if match:
            return match.group("owner"), match.group("repo")
    raise GitHubError(f"Could not read a GitHub repository from: {reference!r}")


class GitHubClient:
    """Fetches repository metadata, file trees and file contents."""

    def __init__(self, token: str | None = None) -> None:
        self.token = (token or "").strip() or None

    # -- low level ---------------------------------------------------------

    def _headers(self, accept: str = "application/vnd.github+json") -> dict[str, str]:
        headers = {"User-Agent": USER_AGENT, "Accept": accept}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _request(self, url: str, accept: str, retries: int = 2) -> bytes:
        request = urllib.request.Request(url, headers=self._headers(accept))
        last_error: Exception | None = None
        for attempt in range(retries + 1):
            try:
                with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                    return response.read()
            except urllib.error.HTTPError as error:
                # HTTP status errors are not transient — fail immediately.
                raise self._translate_http_error(error) from error
            except (urllib.error.URLError, TimeoutError, OSError) as error:
                # Connection resets / read timeouts are often transient; retry.
                last_error = error
        reason = getattr(last_error, "reason", last_error)
        raise GitHubError(f"Network error contacting GitHub: {reason}") from last_error

    def _get_json(self, url: str) -> dict | list:
        return json.loads(self._request(url, "application/vnd.github+json"))

    @staticmethod
    def _translate_http_error(error: urllib.error.HTTPError) -> GitHubError:
        if error.code == 404:
            return GitHubError("Repository not found (is it private, or mistyped?).")
        if error.code in (401, 403):
            remaining = error.headers.get("X-RateLimit-Remaining")
            if remaining == "0":
                return GitHubError(
                    "GitHub API rate limit reached. Add a personal access "
                    "token to raise the limit from 60 to 5000 requests/hour."
                )
            return GitHubError("Access denied by GitHub (check your token or permissions).")
        return GitHubError(f"GitHub returned HTTP {error.code}: {error.reason}")

    # -- high level --------------------------------------------------------

    def get_repo_info(self, owner: str, repo: str) -> dict:
        """Return repository metadata (name, default branch, stats, ...)."""
        info = self._get_json(f"{API_ROOT}/repos/{owner}/{repo}")
        if not isinstance(info, dict):
            raise GitHubError("Unexpected response from GitHub repository endpoint.")
        return info

    def get_tree(self, owner: str, repo: str, branch: str) -> list[dict]:
        """Return the full recursive file tree for *branch*."""
        encoded = urllib.parse.quote(branch, safe="")
        url = f"{API_ROOT}/repos/{owner}/{repo}/git/trees/{encoded}?recursive=1"
        payload = self._get_json(url)
        if not isinstance(payload, dict) or "tree" not in payload:
            raise GitHubError("Could not read the repository file tree.")
        if payload.get("truncated"):
            # Very large repos truncate the tree; we still analyse what we got.
            pass
        return payload["tree"]

    def fetch_content(self, owner: str, repo: str, branch: str, file: dict) -> str:
        """Return the text content of one file.

        Uses the raw CDN for public repos (no rate-limit cost). When a token is
        configured we go through the blob API instead, which also covers private
        repositories.
        """
        if self.token and file.get("sha"):
            return self._fetch_via_blob(owner, repo, file["sha"])
        return self._fetch_via_raw(owner, repo, branch, file["path"])

    def _fetch_via_raw(self, owner: str, repo: str, branch: str, path: str) -> str:
        quoted = urllib.parse.quote(path, safe="/")
        url = f"{RAW_ROOT}/{owner}/{repo}/{branch}/{quoted}"
        return self._request(url, "text/plain").decode("utf-8", errors="replace")

    def _fetch_via_blob(self, owner: str, repo: str, sha: str) -> str:
        url = f"{API_ROOT}/repos/{owner}/{repo}/git/blobs/{sha}"
        payload = self._get_json(url)
        if isinstance(payload, dict) and payload.get("encoding") == "base64":
            try:
                raw = base64.b64decode(payload.get("content", ""))
            except (ValueError, binascii.Error) as error:
                raise GitHubError(f"Could not decode blob {sha}: {error}") from error
            return raw.decode("utf-8", errors="replace")
        if isinstance(payload, dict):
            return str(payload.get("content", ""))
        raise GitHubError("Could not decode file contents from GitHub.")
