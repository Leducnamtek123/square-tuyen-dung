"""Tests for the local HTTP server's pure request helpers and HTTP surface."""

import http.client
import os
import threading
import unittest
from http.server import HTTPServer
from unittest.mock import patch

from app import Handler, extract_bearer_token
from cleancode import GitHubError


class ExtractBearerTokenTests(unittest.TestCase):
    def test_extracts_bearer_credential(self):
        self.assertEqual(extract_bearer_token("Bearer secret"), "secret")

    def test_scheme_is_case_insensitive(self):
        self.assertEqual(extract_bearer_token("bearer secret"), "secret")

    def test_ignores_missing_or_blank_credentials(self):
        self.assertIsNone(extract_bearer_token(None))
        self.assertIsNone(extract_bearer_token(""))
        self.assertIsNone(extract_bearer_token("Bearer   "))

    def test_rejects_other_authorization_schemes(self):
        self.assertIsNone(extract_bearer_token("Basic secret"))


class ServerTestCase(unittest.TestCase):
    """Runs the real Handler against a real socket bound to an ephemeral port."""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), Handler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.thread.join()
        cls.server.server_close()

    def request(self, path, headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port)
        try:
            conn.request("GET", path, headers=headers or {})
            response = conn.getresponse()
            return response.status, response.read()
        finally:
            conn.close()


class StaticFileServingTests(ServerTestCase):
    def test_serves_index(self):
        status, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn(b"<html", body.lower())

    def test_missing_file_is_404(self):
        status, _ = self.request("/does-not-exist.txt")
        self.assertEqual(status, 404)

    def test_path_traversal_is_blocked(self):
        status, body = self.request("/../app.py")
        self.assertEqual(status, 404)
        self.assertNotIn(b"extract_bearer_token", body)


class AnalyzeEndpointTests(ServerTestCase):
    def test_missing_repo_param_is_400(self):
        status, body = self.request("/api/analyze")
        self.assertEqual(status, 400)
        self.assertIn(b"repo", body)

    def test_github_error_maps_to_400(self):
        with patch("app.analyze_repo", side_effect=GitHubError("nope")):
            status, body = self.request("/api/analyze?repo=foo/bar")
        self.assertEqual(status, 400)
        self.assertIn(b"nope", body)

    def test_unexpected_error_maps_to_500_without_leaking_traceback(self):
        with patch("app.analyze_repo", side_effect=RuntimeError("boom, secret path/x.py")):
            status, body = self.request("/api/analyze?repo=foo/bar")
        self.assertEqual(status, 500)
        self.assertNotIn(b"Traceback", body)
        self.assertNotIn(b"RuntimeError", body)
        self.assertNotIn(b"boom", body)

    def test_github_token_env_var_used_as_fallback(self):
        captured = {}

        def fake_analyze(repo, token):
            captured["token"] = token
            return {"ok": True}

        with patch("app.analyze_repo", side_effect=fake_analyze), patch.dict(
            os.environ, {"GITHUB_TOKEN": "env-secret"}
        ):
            status, _ = self.request("/api/analyze?repo=foo/bar")
        self.assertEqual(status, 200)
        self.assertEqual(captured["token"], "env-secret")

    def test_authorization_header_takes_precedence_over_env_var(self):
        captured = {}

        def fake_analyze(repo, token):
            captured["token"] = token
            return {"ok": True}

        with patch("app.analyze_repo", side_effect=fake_analyze), patch.dict(
            os.environ, {"GITHUB_TOKEN": "env-secret"}
        ):
            status, _ = self.request(
                "/api/analyze?repo=foo/bar", headers={"Authorization": "Bearer header-secret"}
            )
        self.assertEqual(status, 200)
        self.assertEqual(captured["token"], "header-secret")


if __name__ == "__main__":
    unittest.main()
