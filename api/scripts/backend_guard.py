#!/usr/bin/env python
"""
Backend consistency guard.

Checks that should fail CI early:
1) Model changes must be accompanied by migrations.
2) Unsafe DB constraints for current DB backend are not allowed.

Optional warning checks:
3) AUTO_MIGRATE=0 in root .env (can cause deploy drift if migrate job is skipped).
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], cwd: Path) -> tuple[int, str]:
    proc = subprocess.run(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        check=False,
    )
    return proc.returncode, proc.stdout


def check_missing_migrations(api_dir: Path) -> list[str]:
    code, output = run_command(
        [sys.executable, "manage.py", "makemigrations", "--check", "--dry-run"],
        cwd=api_dir,
    )
    if code == 0:
        return []
    return [f"Missing migration(s) detected:\n{output.strip()}"]


def check_db_constraint_compatibility() -> list[str]:
    import django

    django.setup()

    from django.apps import apps
    from django.db import connection
    from django.db.models import UniqueConstraint

    issues: list[str] = []
    vendor = connection.vendor
    unsupported_partial_unique = vendor in {"mysql", "sqlite"}

    if not unsupported_partial_unique:
        return issues

    for model in apps.get_models():
        for constraint in model._meta.constraints:
            if isinstance(constraint, UniqueConstraint) and constraint.condition is not None:
                issues.append(
                    (
                        f"{model._meta.label}: conditional unique constraint "
                        f"'{constraint.name}' is not enforced on {vendor}."
                    )
                )
    return issues


def check_auto_migrate_flag(repo_root: Path) -> list[str]:
    env_path = repo_root / ".env"
    if not env_path.exists():
        return []
    try:
        for line in env_path.read_text(encoding="utf-8").splitlines():
            normalized = line.strip()
            if not normalized or normalized.startswith("#"):
                continue
            if normalized.startswith("AUTO_MIGRATE="):
                value = normalized.split("=", 1)[1].strip().strip("'\"")
                if value == "0":
                    return [
                        "AUTO_MIGRATE=0 found in root .env. Ensure deploy always runs migration job."
                    ]
    except Exception:
        return []
    return []


def main() -> int:
    parser = argparse.ArgumentParser(description="Backend consistency guard")
    parser.add_argument(
        "--skip-env-warning",
        action="store_true",
        help="Skip warning check for AUTO_MIGRATE in root .env",
    )
    args = parser.parse_args()

    api_dir = Path(__file__).resolve().parents[1]
    repo_root = api_dir.parent

    if str(api_dir) not in sys.path:
        sys.path.insert(0, str(api_dir))

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    failures: list[str] = []
    warnings: list[str] = []

    failures.extend(check_missing_migrations(api_dir))
    failures.extend(check_db_constraint_compatibility())

    if not args.skip_env_warning:
        warnings.extend(check_auto_migrate_flag(repo_root))

    if warnings:
        print("WARNINGS:")
        for warning in warnings:
            print(f"- {warning}")

    if failures:
        print("FAILURES:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("Backend guard passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
