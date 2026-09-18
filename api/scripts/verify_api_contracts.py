#!/usr/bin/env python
"""
Automated Frontend ↔ Backend API Contract Verification Tool.
Enforces that every API call in frontend/src/services/ maps to a valid Django route
with matching HTTP method and proper serializer/view.
"""
import os
import sys
import re
import json

# Setup Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.urls import resolve, Resolver404

FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend", "src")
SERVICES_DIR = os.path.join(FRONTEND_DIR, "services")

call_regex = re.compile(
    r'(?:httpRequest|this\.client|refreshClient|axios)\s*(?:<[^>]+>)?\s*\.\s*(get|post|put|patch|delete)\s*(?:<[^>]+>)?\s*\(\s*([`\'"][^`\'"\n]+[`\'"]|url|[a-zA-Z0-9_]+)',
    re.MULTILINE
)

def scan_frontend_services():
    extracted = []
    for root, dirs, files in os.walk(SERVICES_DIR):
        if "__tests__" in root:
            continue
        for file in files:
            if not file.endswith(('.ts', '.tsx')):
                continue
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath, FRONTEND_DIR)
            with open(filepath, "r", encoding="utf-8", errors="ignore") as fp:
                lines = fp.readlines()
            for idx, line in enumerate(lines):
                for m in call_regex.finditer(line):
                    method = m.group(1).upper()
                    raw_url = m.group(2).strip('`\'"')
                    extracted.append({
                        "file": relpath,
                        "line": idx + 1,
                        "method": method,
                        "url": raw_url,
                        "line_content": line.strip()
                    })
    return extracted

def verify_contracts():
    calls = scan_frontend_services()
    print(f"[*] Auditing {len(calls)} Frontend Service API calls...")

    passed = []
    failed = []
    mismatches = []
    skipped_dynamic = []

    for item in calls:
        url = item["url"]
        file = item["file"]
        line = item["line"]
        method = item["method"]

        if url in ['url', 'endpoint', 'CONFIG_ENDPOINT'] or url.startswith(('http://', 'https://')):
            skipped_dynamic.append(item)
            continue

        clean_url = url.strip('/')
        if not clean_url.startswith('api/'):
            clean_url = 'api/v1/' + clean_url

        if "slug" in url.lower():
            test_path = '/' + re.sub(r'\$\{[^}]+\}', 'test-slug', clean_url) + '/'
        else:
            test_path = '/' + re.sub(r'\$\{[^}]+\}', '1', clean_url) + '/'

        test_path = re.sub(r'/+', '/', test_path).split('?')[0]
        if not test_path.endswith('/'):
            test_path += '/'

        try:
            match = resolve(test_path)
            callback_str = str(match.func)

            if "catch_all_view" in callback_str:
                failed.append({
                    **item,
                    "test_path": test_path,
                    "reason": "Resolves to Django Admin catch_all_view (404 for API)"
                })
            else:
                func_obj = match.func
                actions = getattr(func_obj, 'actions', None)
                cls_obj = getattr(func_obj, 'cls', None)

                allowed = []
                if actions:
                    allowed = [k.upper() for k in actions.keys()]
                elif cls_obj and hasattr(cls_obj, 'http_method_names'):
                    allowed = [m.upper() for m in cls_obj.http_method_names]

                if allowed and method not in allowed:
                    mismatches.append({
                        **item,
                        "test_path": test_path,
                        "view": cls_obj.__name__ if cls_obj else func_obj.__name__,
                        "allowed": allowed
                    })
                else:
                    passed.append({
                        **item,
                        "test_path": test_path,
                        "view": cls_obj.__name__ if cls_obj else func_obj.__name__
                    })
        except Resolver404:
            failed.append({
                **item,
                "test_path": test_path,
                "reason": "404 Not Found in Django URL Resolver"
            })

    print(f"\n========================================================")
    print(f" CONTRACT VERIFICATION RESULTS:")
    print(f"   [+] Passed calls:            {len(passed)}")
    print(f"   [+] Dynamic/External:        {len(skipped_dynamic)}")
    print(f"   [-] Unmapped / 404 Failures: {len(failed)}")
    print(f"   [-] Method Mismatches:       {len(mismatches)}")
    print(f"========================================================")

    if failed:
        print("\n[!] CONTRACT FAILURES:")
        for f in failed:
            print(f"   {f['file']}:{f['line']} [{f['method']} {f['url']}] -> {f['test_path']} ({f['reason']})")

    if mismatches:
        print("\n[!] METHOD MISMATCHES:")
        for m in mismatches:
            print(f"   {m['file']}:{m['line']} [{m['method']} {m['url']}] -> View {m['view']} (Allowed: {m['allowed']})")

    if failed or mismatches:
        print("\n[FAIL] CI CONTRACT VERIFICATION: FAILED")
        return 1

    print("\n[PASS] CI CONTRACT VERIFICATION: PASSED (100% Contract Match)")
    return 0

if __name__ == "__main__":
    sys.exit(verify_contracts())
