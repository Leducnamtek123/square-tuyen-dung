"""CLI entry point for Clean Code Checker.

Run ``python -m cleancode.cli <path>`` to analyse a local directory.
Supports --json and --markdown output modes.
"""

from __future__ import annotations

import argparse
import json
import sys

from .local import analyze_local


TABLE_WIDTH = 64


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m cleancode.cli",
        description="Clean Code Checker — analyse a local directory for clean code smells.",
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to directory to analyse (default: current directory).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="as_json",
        help="Output raw JSON report.",
    )
    parser.add_argument(
        "--markdown",
        action="store_true",
        dest="as_markdown",
        help="Output report formatted as Markdown.",
    )
    parser.add_argument(
        "--include-tests",
        action="store_true",
        help="Include test directories and test files in analysis.",
    )
    parser.add_argument(
        "--max-files",
        type=int,
        default=400,
        help="Maximum files to scan (default: 400).",
    )
    return parser


def format_summary_table(report: dict) -> str:
    """Format analysis report into a human-readable CLI table."""
    repo = report["repo"]
    stats = report["stats"]
    summary = report["summary"]
    sev = summary["by_severity"]

    langs = ", ".join(f"{k}: {v}" for k, v in list(stats["languages"].items())[:4]) or "None"
    lines = [
        "=" * TABLE_WIDTH,
        "  Clean Code Checker - Local Analysis",
        "=" * TABLE_WIDTH,
        f"  Target:      {repo['full_name']}",
        f"  Score:       {summary['score']} / 100 (Grade: {summary['grade']})",
        f"  Lines Code:  {stats['total_loc']:,}",
        f"  Files:       {stats['files_analyzed']} scanned",
        f"  Findings:    {stats['total_findings']} ({sev['major']} major, {sev['minor']} minor, {sev['info']} info)",
        f"  Languages:   {langs}",
        "-" * TABLE_WIDTH,
        "  Findings by Category:",
    ]

    for cat, count in summary.get("by_category", {}).items():
        lines.append(f"    * {cat:<20} {count}")
    if not summary.get("by_category"):
        lines.append("    (no issues detected)")

    lines.append("-" * TABLE_WIDTH)
    lines.append("  Top Files to Review:")
    files = report.get("files", [])
    if not files:
        lines.append("    No clean-code issues found. Nicely done!")
    else:
        for file in files[:5]:
            count = len(file["findings"])
            lines.append(f"    * {file['path']} ({count} findings, {file['loc']} LOC)")
            for f in file["findings"][:3]:
                lines.append(f"      - L{f['line']:<4} [{f['severity']}] {f['message']}")
            if count > 3:
                lines.append(f"      ... and {count - 3} more finding(s)")

    lines.append("=" * TABLE_WIDTH)
    return "\n".join(lines)


def format_markdown(report: dict) -> str:
    """Format report dict into GitHub Markdown."""
    repo = report["repo"]
    stats = report["stats"]
    summary = report["summary"]
    sev = summary["by_severity"]

    lines = [
        f"# Clean Code Report - {repo['name']}",
        "",
        f"**Grade: {summary['grade']} ({summary['score']} / 100)**",
        "",
        f"- Target Path: `{repo['full_name']}`",
        f"- Files Analyzed: {stats['files_analyzed']:,}",
        f"- Lines of Code: {stats['total_loc']:,}",
        f"- Findings: {stats['total_findings']:,} ({sev['major']} major, {sev['minor']} minor, {sev['info']} info)",
        "",
        "## Findings by Category",
        "",
        "| Category | Count |",
        "| --- | --- |",
        *[f"| {cat} | {count} |" for cat, count in summary.get("by_category", {}).items()],
        "",
        "## Top Files to Review",
        "",
    ]

    files = report.get("files", [])
    if not files:
        lines.append("No clean-code issues found. Nicely done!\n")
    else:
        for file in files:
            lines.append(f"### `{file['path']}`\n")
            for f in file["findings"]:
                lines.append(f"- **L{f['line']}** _{f['severity']}_ - {f['message']} (`{f['rule']}`)")
            lines.append("")

    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        report = analyze_local(
            args.path,
            include_tests=args.include_tests,
            max_files=args.max_files,
        )
    except (FileNotFoundError, NotADirectoryError) as err:
        sys.stderr.write(f"Error: {err}\n")
        return 1
    except Exception as err:  # noqa: BLE001
        sys.stderr.write(f"Unexpected error: {err}\n")
        return 1

    if args.as_json:
        sys.stdout.write(json.dumps(report, indent=2) + "\n")
    elif args.as_markdown:
        sys.stdout.write(format_markdown(report) + "\n")
    else:
        sys.stdout.write(format_summary_table(report) + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
