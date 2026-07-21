from __future__ import annotations

import importlib.util
from pathlib import Path

_legacy_services_path = Path(__file__).resolve().parent.parent / "services.py"
_legacy_spec = importlib.util.spec_from_file_location(
    "apps.profiles._legacy_services",
    _legacy_services_path,
)
if _legacy_spec is None or _legacy_spec.loader is None:
    raise ImportError(f"Unable to load legacy services module from {_legacy_services_path}")

_legacy_services = importlib.util.module_from_spec(_legacy_spec)
_legacy_spec.loader.exec_module(_legacy_services)

ResumeService = _legacy_services.ResumeService
CompanyService = _legacy_services.CompanyService
ensure_company_system_roles = _legacy_services.ensure_company_system_roles

from .vieclam24h_import import (  # noqa: E402,F401
    DEFAULT_VIECLAM24H_CAREER_NAMES,
    ImportResult,
    collect_vieclam24h_candidates,
    import_vieclam24h_candidates,
    persist_vieclam24h_candidates,
)
from .vieclam24h_import_browser import get_vieclam24h_catalog  # noqa: E402,F401
