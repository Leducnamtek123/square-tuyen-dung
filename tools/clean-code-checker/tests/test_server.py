"""Tests for server routes including /api/analyze-local and /api/analyze."""

import http.client
import json
import os
import threading
import unittest
from http.server import HTTPServer
from unittest.mock import patch

from app import Handler


class ServerTestCase(unittest.TestCase):
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

    def request(self, path: str, headers: dict | None = None) -> tuple[int, bytes]:
        conn = http.client.HTTPConnection("127.0.0.1", self.port)
        try:
            conn.request("GET", path, headers=headers or {})
            response = conn.getresponse()
            return response.status, response.read()
        finally:
            conn.close()


class AnalyzeLocalServerTests(ServerTestCase):
    def test_missing_path_param_is_400(self):
        status, body = self.request("/api/analyze-local")
        self.assertEqual(status, 400)
        self.assertIn(b"path", body)

    def test_nonexistent_path_is_400(self):
        nonexistent = "path_that_definitely_does_not_exist_12345"
        status, body = self.request(f"/api/analyze-local?path={nonexistent}")
        self.assertEqual(status, 400)
        self.assertIn(b"not found", body.lower())

    def test_valid_local_path_is_200(self):
        status, body = self.request("/api/analyze-local?path=.")
        self.assertEqual(status, 200)
        payload = json.loads(body.decode("utf-8"))
        self.assertIn("repo", payload)
        self.assertIn("summary", payload)
        self.assertIn("stats", payload)
        self.assertIn("files", payload)
        self.assertEqual(payload["repo"]["owner"], "local")

    def test_unexpected_error_is_500(self):
        with patch("app.analyze_local", side_effect=RuntimeError("disk failure on secret_drive")):
            status, body = self.request("/api/analyze-local?path=.")
        self.assertEqual(status, 500)
        self.assertNotIn(b"secret_drive", body)


if __name__ == "__main__":
    unittest.main()
