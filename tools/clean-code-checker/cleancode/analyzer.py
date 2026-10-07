"""Orchestrate a full repository analysis.

This ties the pieces together: resolve the repo, list its code files, fetch
them concurrently, run the rules, and assemble a JSON-serialisable report.
"""

from __future__ import annotations

import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

from .github import GitHubClient, GitHubError, parse_repo
from .languages import select_code_files
from .rules import Finding, analyze_file
from .scoring import SEVERITY_WEIGHT, compute_score

MAX_WORKERS = 8
# Files with the most weighted findings are surfaced first in the report.
TOP_FILES = 15


@dataclass
class _FetchContext:
    client: GitHubClient
    owner: str
    repo: str
    branch: str


def analyze_repo(reference: str, token: str | None = None) -> dict:
    """Analyse the repository named by *reference* and return a report dict.

    Raises :class:`GitHubError` for any problem reaching or reading the repo.
    """
    owner, repo = parse_repo(reference)
    client = GitHubClient(token)

    info = client.get_repo_info(owner, repo)
    branch = info.get("default_branch", "main")

    tree = client.get_tree(owner, repo, branch)
    files = select_code_files(tree)
    if not files:
        raise GitHubError("No analysable source files were found in this repository.")

    ctx = _FetchContext(client=client, owner=owner, repo=repo, branch=branch)
    file_reports, total_loc = _scan_files(ctx, files)
    all_findings = [f for report in file_reports for f in report["findings_raw"]]
    summary = compute_score(all_findings, total_loc)

    return {
        "repo": {
            "owner": owner,
            "name": repo,
            "full_name": info.get("full_name", f"{owner}/{repo}"),
            "description": info.get("description") or "",
            "url": info.get("html_url", f"https://github.com/{owner}/{repo}"),
            "stars": info.get("stargazers_count", 0),
            "language": info.get("language") or "—",
            "default_branch": branch,
        },
        "stats": {
            "files_analyzed": len(file_reports),
            "total_findings": len(all_findings),
            "total_loc": total_loc,
            "languages": _language_breakdown(file_reports),
        },
        "summary": summary,
        "files": _format_file_reports(file_reports),
    }


def _scan_files(ctx: _FetchContext, files: list[dict]) -> tuple[list[dict], int]:
    reports: list[dict] = []
    total_loc = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(_scan_one, ctx, file): file
            for file in files
        }
        for future in as_completed(futures):
            try:
                report = future.result()
            except Exception as error:  # noqa: BLE001 — one bad file must not abort the run
                path = futures[future].get("path", "?")
                sys.stderr.write(f"[warn] skipped {path}: {type(error).__name__}: {error}\n")
                continue
            if report is not None:
                reports.append(report)
                total_loc += report["loc"]

    reports.sort(key=lambda r: r["weight"], reverse=True)
    return reports, total_loc


def _scan_one(ctx: _FetchContext, file: dict) -> dict | None:
    try:
        text = ctx.client.fetch_content(ctx.owner, ctx.repo, ctx.branch, file)
    except GitHubError:
        return None  # skip files we can't read rather than failing the whole run
    if "\x00" in text[:1024]:
        return None  # binary content slipped through

    path = file["path"]
    language = file["language"]
    findings = analyze_file(path, language, text)
    loc = sum(1 for line in text.splitlines() if line.strip())
    return {
        "path": path,
        "language": language,
        "loc": loc,
        "weight": _weight(findings),
        "findings_raw": findings,
    }


def _weight(findings: list[Finding]) -> float:
    # Same weights as the final score (single source of truth in scoring.py) so
    # file ranking and the overall score never drift apart.
    return sum(SEVERITY_WEIGHT[f.severity] for f in findings)


def _format_file_reports(reports: list[dict]) -> list[dict]:
    formatted = []
    for report in reports[:TOP_FILES]:
        if not report["findings_raw"]:
            continue
        formatted.append({
            "path": report["path"],
            "language": report["language"],
            "loc": report["loc"],
            "findings": [
                {
                    "rule": f.rule,
                    "category": f.category,
                    "severity": f.severity,
                    "line": f.line,
                    "message": f.message,
                }
                for f in report["findings_raw"]
            ],
        })
    return formatted


def _language_breakdown(reports: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for report in reports:
        counts[report["language"]] = counts.get(report["language"], 0) + 1
    return dict(sorted(counts.items(), key=lambda kv: kv[1], reverse=True))
