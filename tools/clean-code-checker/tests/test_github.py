"""Tests for the GitHub client's pure logic (no network)."""

import io
import unittest
import urllib.error
from email.message import Message

from cleancode.github import GitHubClient, GitHubError, parse_repo


class ParseRepoTests(unittest.TestCase):
    def test_variants(self):
        cases = {
            "https://github.com/psf/requests": ("psf", "requests"),
            "psf/requests": ("psf", "requests"),
            "git@github.com:psf/requests.git": ("psf", "requests"),
            "https://github.com/psf/requests.git": ("psf", "requests"),
            "https://github.com/psf/requests/": ("psf", "requests"),
        }
        for ref, expected in cases.items():
            with self.subTest(ref=ref):
                self.assertEqual(parse_repo(ref), expected)

    def test_empty_raises(self):
        with self.assertRaises(GitHubError):
            parse_repo("")

    def test_garbage_raises(self):
        with self.assertRaises(GitHubError):
            parse_repo("not a repo at all")


def make_http_error(code, remaining=None):
    headers = Message()
    if remaining is not None:
        headers["X-RateLimit-Remaining"] = remaining
    return urllib.error.HTTPError("http://x", code, "reason", headers, io.BytesIO(b""))


class ErrorTranslationTests(unittest.TestCase):
    def translate(self, code, remaining=None):
        error = make_http_error(code, remaining)
        try:
            return str(GitHubClient._translate_http_error(error))
        finally:
            error.close()

    def test_404(self):
        self.assertIn("not found", self.translate(404).lower())

    def test_rate_limit(self):
        message = self.translate(403, remaining="0")
        self.assertIn("rate limit", message.lower())

    def test_forbidden_without_rate_limit(self):
        message = self.translate(403, remaining="42")
        self.assertIn("denied", message.lower())

    def test_other_status(self):
        self.assertIn("500", self.translate(500))


class HeaderTests(unittest.TestCase):
    def test_token_adds_auth_header(self):
        headers = GitHubClient("secret")._headers()
        self.assertEqual(headers["Authorization"], "Bearer secret")

    def test_no_token_no_auth_header(self):
        self.assertNotIn("Authorization", GitHubClient()._headers())


if __name__ == "__main__":
    unittest.main()
