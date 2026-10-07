"""Local directory scanner for Clean Code Checker.

Scans a directory on the local filesystem, runs all clean-code rules, and
assembles the same JSON-serialisable report structure as GitHub analysis.
"""

from __future__ import annotations

import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

from .analyzer import MAX_WORKERS, _format_file_reports, _language_breakdown, _weight
from .languages import SKIP_DIRECTORIES, is_test_path, language_for, should_skip
from .rules import analyze_file
from .scoring import compute_score

TEST_DIR_NAMES = {"test", "tests", "__tests__", "spec", "specs"}


def analyze_local(
    path: str,
    include_tests: bool = False,
    max_files: int = 400,
) -> dict:
    """Analyse source files in a local directory *path* and return a report dict."""
    abs_path = os.path.abspath(path)
    if not os.path.exists(abs_path):
        raise FileNotFoundError(f"Directory not found: '{path}'.")
    if not os.path.isdir(abs_path):
        raise NotADirectoryError(f"Path is not a directory: '{path}'.")

    candidates = _collect_candidate_files(abs_path, include_tests, max_files)
    file_reports, total_loc = _scan_local_files(candidates)
    all_findings = [f for report in file_reports for f in report["findings_raw"]]
    summary = compute_score(all_findings, total_loc)
    langs = _language_breakdown(file_reports)
    top_language = next(iter(langs.keys()), "—") if langs else "—"
    dir_name = os.path.basename(abs_path) or abs_path

    return {
        "repo": {
            "owner": "local",
            "name": dir_name,
            "full_name": abs_path,
            "description": "Local Directory",
            "url": "",
            "stars": 0,
            "language": top_language,
            "default_branch": "local",
        },
        "stats": {
            "files_analyzed": len(file_reports),
            "total_findings": len(all_findings),
            "total_loc": total_loc,
            "languages": langs,
        },
        "summary": summary,
        "files": _format_file_reports(file_reports),
    }


def _collect_candidate_files(
    abs_path: str,
    include_tests: bool,
    max_files: int,
) -> list[tuple[str, str, int, str]]:
    """Walk *abs_path* and return list of (rel_path, abs_file, size, lang)."""
    candidates: list[tuple[str, str, int, str]] = []
    for root, dirs, files in os.walk(abs_path):
        dirs[:] = [
            d for d in dirs
            if not d.startswith(".")
            and d.lower() not in SKIP_DIRECTORIES
            and (include_tests or d.lower() not in TEST_DIR_NAMES)
        ]
        for filename in files:
            if filename.startswith("."):
                continue
            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, abs_path).replace("\\", "/")
            if not include_tests and is_test_path(rel_path):
                continue
            try:
                size = os.path.getsize(full_path)
            except OSError:
                continue
            if should_skip(rel_path, size):
                continue
            lang = language_for(rel_path)
            if lang is None:
                continue
            candidates.append((rel_path, full_path, size, lang))

    candidates.sort(key=lambda item: item[2], reverse=True)
    return candidates[:max_files]


def _scan_local_files(
    candidates: list[tuple[str, str, int, str]],
) -> tuple[list[dict], int]:
    reports: list[dict] = []
    total_loc = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(_scan_local_one, item): item[0]
            for item in candidates
        }
        for future in as_completed(futures):
            try:
                report = future.result()
            except Exception as error:  # noqa: BLE001
                path = futures[future]
                sys.stderr.write(f"[warn] skipped {path}: {type(error).__name__}: {error}\n")
                continue
            if report is not None:
                reports.append(report)
                total_loc += report["loc"]

    reports.sort(key=lambda r: r["weight"], reverse=True)
    return reports, total_loc


def _scan_local_one(item: tuple[str, str, int, str]) -> dict | None:
    rel_path, full_path, _size, lang = item
    try:
        with open(full_path, "r", encoding="utf-8", errors="replace") as handle:
            text = handle.read()
    except OSError:
        return None
    if "\x00" in text[:1024]:
        return None

    findings = analyze_file(rel_path, lang, text)
    loc = sum(1 for line in text.splitlines() if line.strip())
    return {
        "path": rel_path,
        "language": lang,
        "loc": loc,
        "weight": _weight(findings),
        "findings_raw": findings,
    }
