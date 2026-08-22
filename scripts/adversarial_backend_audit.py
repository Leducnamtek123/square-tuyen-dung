import os
import ast
import re
import glob
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
API_DIR = BASE_DIR / "api"
FRONTEND_DIR = BASE_DIR / "frontend"

def run_adversarial_scan():
    findings = []
    
    # 1. Celery task dispatch before commit inside transaction.atomic()
    # If a celery task is dispatched with .delay() inside transaction.atomic() without transaction.on_commit(),
    # it can execute in the worker before the DB transaction commits (Race Condition / Inconsistent state).
    py_files = [Path(f) for f in glob.glob(str(API_DIR / "**/*.py"), recursive=True) if "__pycache__" not in f]
    
    for p in py_files:
        rel_path = str(p.relative_to(BASE_DIR)).replace("\\", "/")
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                code = "".join(lines)
            tree = ast.parse(code, filename=str(p))
            
            for node in ast.walk(tree):
                if isinstance(node, ast.With):
                    # Check if with transaction.atomic():
                    is_atomic = False
                    for item in node.items:
                        item_str = ast.unparse(item.context_expr)
                        if "atomic" in item_str:
                            is_atomic = True
                            
                    if is_atomic:
                        # Check body for .delay() or .apply_async() not wrapped in on_commit
                        for subnode in ast.walk(node):
                            if isinstance(subnode, ast.Call):
                                call_str = ast.unparse(subnode)
                                if (".delay(" in call_str or ".apply_async(" in call_str) and "on_commit" not in call_str:
                                    lineno = subnode.lineno
                                    snippet = "".join(lines[max(0, lineno-2):min(len(lines), lineno+2)])
                                    findings.append({
                                        "id": f"ADV-TX-CELERY-{len(findings)+1:03d}",
                                        "category": "Transaction & Concurrency",
                                        "severity": "P1",
                                        "file": rel_path,
                                        "line": lineno,
                                        "rule": "CELERY_DISPATCH_BEFORE_COMMIT",
                                        "evidence": snippet.strip(),
                                        "detail": f"Celery task dispatched via `{call_str[:80]}` inside `transaction.atomic()` without `transaction.on_commit()`. Worker may read uncommitted data or fail if transaction rolls back."
                                    })
                                    
                # 2. ViewSet or APIView missing permission_classes or queryset scoping
                if isinstance(node, ast.ClassDef):
                    is_view = any("View" in (b.id if isinstance(b, ast.Name) else b.attr if isinstance(b, ast.Attribute) else "") for b in node.bases)
                    if is_view and "Test" not in node.name:
                        body_str = ast.unparse(node)
                        has_perms = "permission_classes" in body_str
                        has_get_queryset = "def get_queryset" in body_str
                        has_static_queryset = "queryset =" in body_str
                        
                        # Check if it has company or user scoping
                        if ("Company" in node.name or "HRM" in node.name or "Employee" in node.name or "Resume" in node.name) and not has_get_queryset and has_static_queryset:
                            lineno = node.lineno
                            snippet = "".join(lines[max(0, lineno-1):min(len(lines), lineno+6)])
                            findings.append({
                                "id": f"ADV-TENANT-SCOPE-{len(findings)+1:03d}",
                                "category": "Multi-Tenancy & Authorization",
                                "severity": "P1",
                                "file": rel_path,
                                "line": lineno,
                                "rule": "STATIC_QUERYSET_WITHOUT_TENANT_FILTER",
                                "evidence": snippet.strip(),
                                "detail": f"View class `{node.name}` defines static queryset without dynamic `get_queryset()` tenant filtering."
                            })

                # 3. Direct DB mutations outside transaction in complex views
                if isinstance(node, ast.FunctionDef):
                    if node.name in ("post", "put", "patch", "delete", "create", "update", "destroy", "perform_create", "perform_update"):
                        body_str = ast.unparse(node)
                        creates = body_str.count(".create(") + body_str.count(".save(")
                        is_atomic = "atomic" in body_str or any("atomic" in ast.unparse(d) for d in node.decorator_list)
                        if creates >= 2 and not is_atomic:
                            # Multi-mutation without atomic
                            lineno = node.lineno
                            snippet = "".join(lines[max(0, lineno-1):min(len(lines), lineno+4)])
                            findings.append({
                                "id": f"ADV-TX-MUTATION-{len(findings)+1:03d}",
                                "category": "Transaction & Concurrency",
                                "severity": "P2",
                                "file": rel_path,
                                "line": lineno,
                                "rule": "MULTI_MUTATION_WITHOUT_ATOMIC",
                                "evidence": snippet.strip(),
                                "detail": f"Method `{node.name}` performs multiple mutations ({creates} creates/saves) without an explicit `transaction.atomic()` block."
                            })
                            
                # 4. Synchronous requests / httpx inside views (potential blocking of event loop / thread)
                if isinstance(node, ast.Call):
                    call_str = ast.unparse(node)
                    if any(k in call_str for k in ["requests.get(", "requests.post(", "requests.put(", "requests.delete("]) and "tasks.py" not in rel_path and "test" not in rel_path and "client.py" not in rel_path:
                        lineno = node.lineno
                        snippet = "".join(lines[max(0, lineno-2):min(len(lines), lineno+2)])
                        findings.append({
                            "id": f"ADV-PERF-SYNCHTTP-{len(findings)+1:03d}",
                            "category": "Performance",
                            "severity": "P2",
                            "file": rel_path,
                            "line": lineno,
                            "rule": "SYNC_HTTP_IN_REQUEST_THREAD",
                            "evidence": snippet.strip(),
                            "detail": f"Synchronous `requests` HTTP call `{call_str[:80]}` executed directly in WSGI request thread without async/Celery offloading."
                        })
                        
        except Exception as e:
            continue
            
    out_dir = BASE_DIR / "docs" / "backend-audit"
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "adversarial_findings_raw.json", "w", encoding="utf-8") as f:
        json.dump(findings, f, indent=2, ensure_ascii=False)
        
    print(f"Adversarial scan found {len(findings)} detailed deep-dive triggers.")

if __name__ == "__main__":
    run_adversarial_scan()
