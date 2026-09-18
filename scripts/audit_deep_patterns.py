import os
import ast
import re
import glob
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
API_DIR = BASE_DIR / "api"
FRONTEND_DIR = BASE_DIR / "frontend"

def run_deep_static_checks():
    findings = []
    
    # 1. Check for Bare Except and Exception Swallowing (Error Handling)
    py_files = [Path(f) for f in glob.glob(str(API_DIR / "**/*.py"), recursive=True) if "__pycache__" not in f]
    
    for p in py_files:
        rel_path = str(p.relative_to(BASE_DIR)).replace("\\", "/")
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                code = "".join(lines)
                
            tree = ast.parse(code, filename=str(p))
            
            for node in ast.walk(tree):
                # Bare except / broad except pass
                if isinstance(node, ast.ExceptHandler):
                    # Check if handler just passes or returns fake data
                    is_pass = False
                    is_return_none_or_fake = False
                    returned_val = None
                    for b in node.body:
                        if isinstance(b, ast.Pass):
                            is_pass = True
                        elif isinstance(b, ast.Return):
                            is_return_none_or_fake = True
                            returned_val = ast.unparse(b.value) if b.value else "None"
                            
                    if is_pass or is_return_none_or_fake:
                        exc_type = ast.unparse(node.type) if node.type else "Bare except"
                        lineno = node.lineno
                        snippet = "".join(lines[max(0, lineno-2):min(len(lines), lineno+4)])
                        findings.append({
                            "category": "Error Handling",
                            "severity": "P2" if is_return_none_or_fake else "P3",
                            "file": rel_path,
                            "line": lineno,
                            "rule": "EXCEPTION_SWALLOWED",
                            "evidence": snippet.strip(),
                            "detail": f"Exception handler ({exc_type}) returns {returned_val or 'pass'} silently."
                        })
                        
                # 2. Database queries in loops (N+1 potential)
                if isinstance(node, (ast.For, ast.While)):
                    for sub in ast.walk(node):
                        if isinstance(sub, ast.Call):
                            call_str = ast.unparse(sub)
                            if any(k in call_str for k in [".objects.get(", ".objects.filter(", ".objects.create(", ".save(", "requests.get(", "requests.post(", "httpx.get(", "httpx.post("]):
                                lineno = sub.lineno
                                snippet = "".join(lines[max(0, lineno-2):min(len(lines), lineno+2)])
                                findings.append({
                                    "category": "Performance",
                                    "severity": "P1" if "requests." in call_str or "httpx." in call_str else "P2",
                                    "file": rel_path,
                                    "line": lineno,
                                    "rule": "SYNC_CALL_OR_QUERY_IN_LOOP",
                                    "evidence": snippet.strip(),
                                    "detail": f"Query or external network call inside loop: {call_str[:80]}"
                                })
                                
                # 3. Raw SQL execution without parameterization or dangerous format strings
                if isinstance(node, ast.Call):
                    call_str = ast.unparse(node)
                    if "raw(" in call_str or "execute(" in call_str:
                        if any(fmt in call_str for fmt in ["%s %", "f\"", "f'", ".format("]):
                            lineno = node.lineno
                            snippet = "".join(lines[max(0, lineno-2):min(len(lines), lineno+2)])
                            findings.append({
                                "category": "Security",
                                "severity": "P0",
                                "file": rel_path,
                                "line": lineno,
                                "rule": "SQL_INJECTION_RISK",
                                "evidence": snippet.strip(),
                                "detail": f"Raw SQL execution using string interpolation: {call_str[:80]}"
                            })
                            
                # 4. Check for @transaction.atomic / missing atomic on multi-table mutating operations
                if isinstance(node, ast.FunctionDef):
                    body_str = ast.unparse(node)
                    has_multiple_creates_or_updates = (
                        body_str.count(".save(") + body_str.count(".create(") + body_str.count(".delete(") + body_str.count(".update(") >= 2
                    )
                    is_atomic = any("atomic" in ast.unparse(d) for d in node.decorator_list) or "with transaction.atomic()" in body_str
                    if has_multiple_creates_or_updates and not is_atomic and ("views" in rel_path or "services" in rel_path):
                        # Check if modifying important models like JobPost, Application, Interview, Employee
                        if any(m in body_str for m in ["JobPostActivity", "InterviewSession", "Employee", "Contract", "Leave"]):
                            findings.append({
                                "category": "Transaction & Concurrency",
                                "severity": "P1",
                                "file": rel_path,
                                "line": node.lineno,
                                "rule": "MISSING_TRANSACTION_ATOMIC",
                                "evidence": f"def {node.name}(...) modifies multiple records without transaction.atomic context",
                                "detail": f"Function '{node.name}' performs multi-record mutations without atomic transaction wrapper."
                            })

        except Exception as e:
            continue
            
    # Write findings
    out_dir = BASE_DIR / "docs" / "backend-audit"
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "static_analysis_findings.json", "w", encoding="utf-8") as f:
        json.dump(findings, f, indent=2, ensure_ascii=False)
        
    print(f"Deep static analysis found {len(findings)} initial rule-based trigger points.")

if __name__ == "__main__":
    run_deep_static_checks()
