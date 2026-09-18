import os, sys, json, hashlib, re
from pathlib import Path
from collections import defaultdict, Counter

REPO_ROOT = Path('.').resolve()
EXCLUDE_DIRS = {'node_modules', '.git', '.next', '__pycache__', '.pytest_cache', 'dist', 'build', '.vscode', '.idea', 'coverage', '.turbo', 'backups'}

def scan_files():
    all_files = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            all_files.append(Path(root) / f)
    return all_files

print("1. Scanning files...", flush=True)
files = scan_files()
print(f"Total files: {len(files)}", flush=True)

# 1. Extensions
ext_counter = Counter()
for f in files:
    ext = f.suffix.lower()
    if ext == '' and f.name.startswith('.'):
        ext = f.name
    ext_counter[ext or '[no extension]'] += 1

# 2. Root files analysis
print("2. Checking Root files...", flush=True)
root_files = [f for f in files if f.parent == REPO_ROOT]
root_issues = []
for rf in root_files:
    fname = rf.name
    if fname.endswith('.doc') or fname.endswith('.docx') or fname.endswith('.sql'):
        root_issues.append({"file": fname, "type": "LOOSE_DATABASE_OR_DOC", "reason": "Database dump or binary doc file at repo root", "expected": "backups/ or docs/"})
    elif fname.startswith('ENVIRONMENT_AUDIT') or fname.startswith('MIGRATIONS') or fname.startswith('START_GUIDE'):
        root_issues.append({"file": fname, "type": "LOOSE_DOCS", "reason": "Markdown documentation at repo root instead of docs/", "expected": "docs/"})

# 3. Read code contents into memory for fast searching
print("3. Indexing code files...", flush=True)
code_exts = {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.css', '.scss', '.html', '.md', '.yml', '.yaml'}
code_files = [f for f in files if f.suffix.lower() in code_exts and f.stat().st_size < 1_000_000]

code_map = {}
for cf in code_files:
    try:
        with open(cf, 'r', encoding='utf-8', errors='ignore') as fp:
            code_map[cf] = fp.read()
    except Exception:
        pass

# Concatenate all code for ultra-fast substring presence check
all_code_concat = "\n".join(code_map.values())
frontend_code_concat = "\n".join([c for f, c in code_map.items() if 'frontend/' in f.as_posix()])
backend_code_concat = "\n".join([c for f, c in code_map.items() if 'api/' in f.as_posix()])

# 4. Assets analysis
print("4. Analyzing assets...", flush=True)
asset_exts = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.pdf', '.doc'}
asset_files = [f for f in files if f.suffix.lower() in asset_exts]

# duplicate hashes
asset_hash_map = defaultdict(list)
for af in asset_files:
    try:
        h = hashlib.sha256()
        with open(af, 'rb') as f:
            while chunk := f.read(65536):
                h.update(chunk)
        asset_hash_map[h.hexdigest()].append(af.relative_to(REPO_ROOT).as_posix())
    except Exception:
        pass

dup_assets = {h: flist for h, flist in asset_hash_map.items() if len(flist) > 1}

# Asset usage
asset_usage = {}
unused_assets = []
for af in asset_files:
    rel = af.relative_to(REPO_ROOT).as_posix()
    fname = af.name
    stem = af.stem
    # Check if fname or stem appears in any code
    if fname in all_code_concat:
        asset_usage[rel] = "USED_BY_FILENAME"
    elif len(stem) > 4 and (f'"{stem}"' in all_code_concat or f"'{stem}'" in all_code_concat or f"`{stem}`" in all_code_concat or f"/{stem}" in all_code_concat):
        asset_usage[rel] = "USED_BY_STEM"
    else:
        unused_assets.append(rel)

# 5. Dead / Orphan TS/TSX & Python files
print("5. Checking orphan code files...", flush=True)
orphan_ts = []
for f in files:
    rel = f.relative_to(REPO_ROOT).as_posix()
    if 'frontend/src' not in rel or f.suffix.lower() not in ['.ts', '.tsx']:
        continue
    if f.name in ['page.tsx', 'layout.tsx', 'route.ts', 'error.tsx', 'not-found.tsx', 'loading.tsx', 'template.tsx', 'default.tsx', 'middleware.ts', 'shims.d.ts', 'global.d.ts', 'index.ts', 'index.tsx']:
        continue
    if 'src/app/' in rel:
        continue
    if f.name.endswith('.d.ts') or '.test.' in f.name or '.spec.' in f.name:
        continue
    if 'tests/' in rel or '__mocks__' in rel or 'mocks/' in rel:
        continue

    stem = f.stem
    # Check if imported
    pat = stem
    is_imported = False
    if f"/{pat}" in frontend_code_concat or f"'{pat}'" in frontend_code_concat or f'"{pat}"' in frontend_code_concat or f"from './{pat}'" in frontend_code_concat or f'from "./{pat}"' in frontend_code_concat:
        is_imported = True
    elif pat in frontend_code_concat:
        # verify with regex
        if re.search(r'[\'"][^\'"]*' + re.escape(pat) + r'[\'"]', frontend_code_concat):
            is_imported = True

    if not is_imported:
        orphan_ts.append(rel)

orphan_py = []
for f in files:
    rel = f.relative_to(REPO_ROOT).as_posix()
    if 'api/' not in rel or f.suffix.lower() != '.py':
        continue
    if f.name in ['__init__.py', 'manage.py', 'wsgi.py', 'asgi.py', 'conftest.py', 'settings.py', 'urls.py', 'apps.py', 'admin.py', 'models.py', 'views.py', 'serializers.py', 'signals.py', 'tasks.py', 'tests.py']:
        continue
    if 'migrations/' in rel or 'management/commands/' in rel:
        continue
    stem = f.stem
    if stem not in backend_code_concat:
        orphan_py.append(rel)

# 6. Misplaced Code Analysis (Layers, Naming, Folders)
print("6. Analyzing code placement & architecture anomalies...", flush=True)
placement_anomalies = []

# A. Frontend checks
for f in files:
    rel = f.relative_to(REPO_ROOT).as_posix()
    if 'frontend/src/' in rel:
        # Component in utils
        if '/utils/' in rel and f.suffix in ['.tsx', '.jsx']:
            placement_anomalies.append({"file": rel, "category": "COMPONENT_IN_UTILS", "detail": "React Component (.tsx/.jsx) placed inside utils/", "severity": "HIGH"})
        # Component in services
        if '/services/' in rel and f.suffix in ['.tsx', '.jsx']:
            placement_anomalies.append({"file": rel, "category": "COMPONENT_IN_SERVICES", "detail": "React Component (.tsx/.jsx) placed inside services/", "severity": "HIGH"})
        # Non-hook in hooks/
        if '/hooks/' in rel and not f.name.startswith('use') and f.name not in ['index.ts', 'index.tsx'] and f.suffix in ['.ts', '.tsx'] and not f.name.endswith('.d.ts'):
            placement_anomalies.append({"file": rel, "category": "NON_HOOK_IN_HOOKS", "detail": "File in hooks/ does not start with 'use'", "severity": "MEDIUM"})
        # Service in utils
        if '/utils/' in rel and ('Service' in f.name or 'Api' in f.name or 'client' in f.name.lower()):
            placement_anomalies.append({"file": rel, "category": "SERVICE_IN_UTILS", "detail": "Service/API logic placed in utils/", "severity": "HIGH"})
        # Components placed directly in views/ or views/components
        if 'src/views/components/' in rel:
            placement_anomalies.append({"file": rel, "category": "COMPONENTS_IN_VIEWS", "detail": "Shared/feature components placed in src/views/components/ instead of src/components/ or src/features/", "severity": "MEDIUM"})
        # Duplicate mock directories
        if 'src/__mocks__/' in rel:
            placement_anomalies.append({"file": rel, "category": "DUPLICATE_MOCK_DIR", "detail": "Duplicate __mocks__ alongside src/mocks/", "severity": "LOW"})

# B. Backend checks
for f in files:
    rel = f.relative_to(REPO_ROOT).as_posix()
    if 'api/' in rel:
        if 'apps/' in rel and '/utils/' in rel and ('service' in f.name.lower() or 'handler' in f.name.lower()):
            placement_anomalies.append({"file": rel, "category": "SERVICE_IN_BACKEND_UTILS", "detail": "Service/handler placed in app utils/", "severity": "MEDIUM"})
        if f.name in ['seed_jobs.py', 'seed_users.py', 'reset_db.py'] and f.parent.name == 'api':
            placement_anomalies.append({"file": rel, "category": "LOOSE_SCRIPTS_IN_API_ROOT", "detail": "Root database seed/reset scripts in api/ root instead of api/apps/.../management/commands or api/scripts/", "severity": "MEDIUM"})

# 7. Circular Dependency Detection in Frontend
print("7. Detecting Circular Dependencies...", flush=True)
ts_files = [f for f in files if f.suffix.lower() in ['.ts', '.tsx'] and 'frontend/src' in f.relative_to(REPO_ROOT).as_posix()]
file_map = {}
for f in ts_files:
    rel = f.relative_to(REPO_ROOT / 'frontend/src').as_posix()
    file_map[rel] = f
    no_ext = rel.rsplit('.', 1)[0]
    file_map[no_ext] = f
    if no_ext.endswith('/index'):
        file_map[no_ext[:-6]] = f

graph = defaultdict(set)
for f in ts_files:
    rel = f.relative_to(REPO_ROOT / 'frontend/src').as_posix()
    content = code_map.get(f, '')
    imports = re.findall(r'(?:import|from)\s+[\'"]([^\'"]+)[\'"]', content)
    for imp in imports:
        target = None
        if imp.startswith('@/'):
            target = imp[2:]
        elif imp.startswith('./') or imp.startswith('../'):
            target_path = (f.parent / imp).resolve()
            try:
                target = target_path.relative_to((REPO_ROOT / 'frontend/src').resolve()).as_posix()
            except Exception:
                target = None
        if target:
            for ext in ['', '.ts', '.tsx', '.d.ts', '/index.ts', '/index.tsx', '/index']:
                check = target + ext
                if check in file_map:
                    resolved = file_map[check].relative_to(REPO_ROOT / 'frontend/src').as_posix()
                    if resolved != rel:
                        graph[rel].add(resolved)
                    break

cycles = []
visited = set()
seen_cycles = set()

def dfs(node, path):
    if node in path:
        cycle_start = path.index(node)
        cycle = path[cycle_start:] + [node]
        if len(cycle) <= 6:
            min_idx = cycle[:-1].index(min(cycle[:-1]))
            norm_cycle = cycle[min_idx:-1] + cycle[:min_idx] + [cycle[min_idx]]
            cycle_tuple = tuple(norm_cycle)
            if cycle_tuple not in seen_cycles:
                seen_cycles.add(cycle_tuple)
                cycles.append(norm_cycle)
        return
    if node in visited:
        return
    visited.add(node)
    for neighbor in graph.get(node, []):
        dfs(neighbor, path + [node])

for node in list(graph.keys()):
    dfs(node, [])

# 8. Console.log / Debugger statements
print("8. Checking console.log, debugger, TODOs...", flush=True)
debug_findings = []
for f, content in code_map.items():
    rel = f.relative_to(REPO_ROOT).as_posix()
    if 'audit' in rel or 'scripts/' in rel or 'tests/' in rel or '__mocks__' in rel or 'mocks/' in rel:
        continue
    for i, line in enumerate(content.splitlines(), 1):
        if 'debugger;' in line:
            debug_findings.append({"file": rel, "line": i, "type": "DEBUGGER", "text": line.strip()})
        elif re.search(r'\bconsole\.(log|debug|trace)\(', line):
            debug_findings.append({"file": rel, "line": i, "type": "CONSOLE_LOG", "text": line.strip()[:120]})
        elif re.search(r'\b(TODO|FIXME|HACK|XXX)\b', line):
            debug_findings.append({"file": rel, "line": i, "type": "TODO_FIXME", "text": line.strip()[:120]})

# Write full audit summary JSON
output = {
    "total_files": len(files),
    "extensions": dict(ext_counter),
    "root_issues": root_issues,
    "total_assets": len(asset_files),
    "duplicate_assets_count": len(dup_assets),
    "duplicate_assets": dup_assets,
    "unused_assets_count": len(unused_assets),
    "unused_assets": unused_assets,
    "orphan_ts_count": len(orphan_ts),
    "orphan_ts": orphan_ts,
    "orphan_py_count": len(orphan_py),
    "orphan_py": orphan_py,
    "placement_anomalies_count": len(placement_anomalies),
    "placement_anomalies": placement_anomalies,
    "cycles_count": len(cycles),
    "cycles": cycles,
    "debug_count": len(debug_findings),
    "debug_findings_summary": Counter([d['type'] for d in debug_findings]),
    "debug_samples": debug_findings[:30]
}

with open(REPO_ROOT / 'scripts' / 'audit_report_data.json', 'w', encoding='utf-8') as fp:
    json.dump(output, fp, indent=2)

print("\nAudit analysis completed successfully! Saved to scripts/audit_report_data.json", flush=True)
