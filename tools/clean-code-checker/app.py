"""Clean Code Checker — web server.

Run ``python app.py`` and open http://localhost:8000. The server has no
third-party dependencies: it uses Python's standard library only.

  * ``GET /``            -> the single-page UI
  * ``GET /api/analyze`` -> JSON report for ?repo=<url>

An optional GitHub token is accepted through the ``Authorization: Bearer``
header so credentials never appear in request URLs or access logs. If no
header is provided, the ``GITHUB_TOKEN`` environment variable is used as a
fallback.
"""

from __future__ import annotations

import json
import mimetypes
import os
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from cleancode import GitHubError, analyze_local, analyze_repo
from cleancode.cli import format_summary_table

HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8000"))
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

STATUS_OK = 200
STATUS_BAD_REQUEST = 400
STATUS_NOT_FOUND = 404
STATUS_SERVER_ERROR = 500


def extract_bearer_token(authorization: str | None) -> str | None:
    """Return a Bearer credential from an Authorization header, if valid."""
    if not authorization:
        return None
    scheme, separator, credential = authorization.partition(" ")
    if not separator or scheme.lower() != "bearer":
        return None
    return credential.strip() or None


class Handler(BaseHTTPRequestHandler):
    server_version = "CleanCodeChecker/1.0"

    def do_GET(self) -> None:  # noqa: N802 (name fixed by BaseHTTPRequestHandler)
        route = urlparse(self.path)
        if route.path == "/api/analyze":
            self._handle_analyze(parse_qs(route.query))
        elif route.path == "/api/analyze-local":
            self._handle_analyze_local(parse_qs(route.query))
        else:
            self._serve_static(route.path)

    # -- routes ------------------------------------------------------------

    def _handle_analyze(self, query: dict[str, list[str]]) -> None:
        repo = (query.get("repo", [""])[0]).strip()
        token = extract_bearer_token(self.headers.get("Authorization")) or os.environ.get("GITHUB_TOKEN")
        if not repo:
            self._send_json({"error": "Missing 'repo' parameter."}, status=STATUS_BAD_REQUEST)
            return
        try:
            report = analyze_repo(repo, token)
            self._send_json(report)
        except GitHubError as error:
            self._send_json({"error": str(error)}, status=STATUS_BAD_REQUEST)
        except Exception as error:  # noqa: BLE001 — never leak a stack trace to the client
            self._log_unexpected(error)
            self._send_json({"error": "Unexpected server error while analysing the repo."}, status=STATUS_SERVER_ERROR)

    def _handle_analyze_local(self, query: dict[str, list[str]]) -> None:
        path = (query.get("path", [""])[0]).strip()
        if not path:
            self._send_json({"error": "Missing 'path' parameter."}, status=STATUS_BAD_REQUEST)
            return
        include_tests = query.get("include_tests", ["false"])[0].lower() in ("true", "1", "yes")
        try:
            report = analyze_local(path, include_tests=include_tests)
            self._send_json(report)
        except (FileNotFoundError, NotADirectoryError) as error:
            self._send_json({"error": str(error)}, status=STATUS_BAD_REQUEST)
        except Exception as error:  # noqa: BLE001
            self._log_unexpected(error)
            self._send_json(
                {"error": "Unexpected server error while analysing local directory."},
                status=STATUS_SERVER_ERROR,
            )

    def _serve_static(self, path: str) -> None:
        relative = "index.html" if path in ("/", "") else path.lstrip("/")
        target = os.path.normpath(os.path.join(WEB_DIR, relative))
        # Require a real path-separator boundary so a sibling like "webapp"
        # cannot satisfy a bare prefix match and escape WEB_DIR.
        if not target.startswith(WEB_DIR + os.sep):
            self._send_bytes(b"Not found", STATUS_NOT_FOUND, "text/plain")
            return
        content_type = mimetypes.guess_type(target)[0] or "application/octet-stream"
        try:
            with open(target, "rb") as handle:
                body = handle.read()
        except OSError:
            # Missing file, a directory, a permission error, or a delete-between-
            # check-and-open race all resolve to a clean 404.
            self._send_bytes(b"Not found", STATUS_NOT_FOUND, "text/plain")
            return
        self._send_bytes(body, STATUS_OK, content_type)

    # -- response helpers --------------------------------------------------

    def _send_json(self, payload: dict, status: int = STATUS_OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self._send_bytes(body, status, "application/json; charset=utf-8")

    def _send_bytes(self, body: bytes, status: int, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _log_unexpected(self, error: Exception) -> None:
        sys.stderr.write(f"[error] {type(error).__name__}: {error}\n")

    def log_message(self, fmt: str, *args) -> None:  # quieter, single-line logs
        sys.stderr.write(f"{self.address_string()} - {fmt % args}\n")


def main() -> None:
    local_path = None
    if "--local" in sys.argv:
        idx = sys.argv.index("--local")
        if idx + 1 < len(sys.argv):
            local_path = sys.argv[idx + 1]

    if local_path:
        try:
            report = analyze_local(local_path)
            sys.stdout.write(format_summary_table(report) + "\n")
        except Exception as err:
            sys.stderr.write(f"Error scanning local directory '{local_path}': {err}\n")
        if "--no-serve" in sys.argv:
            return

    server = ThreadingHTTPServer((HOST, PORT), Handler)
    url = f"http://{HOST}:{PORT}"
    sys.stdout.write(f"Clean Code Checker running at {url}\n")
    sys.stdout.write("Press Ctrl+C to stop.\n")
    if "--no-browser" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:  # noqa: BLE001 — opening a browser is best-effort
            pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        sys.stdout.write("\nShutting down.\n")
        server.shutdown()


if __name__ == "__main__":
    main()
