import os
import sys
import json
import hashlib
import re
from pathlib import Path
from collections import defaultdict, Counter

REPO_ROOT = Path('.').resolve()

EXCLUDE_DIRS = {
    'node_modules', '.git', '.next', '__pycache__', '.pytest_cache',
    'dist', 'build', '.vscode', '.idea', 'coverage', '.turbo', 'backups'
}

def is_excluded(path: Path):
    for part in path.parts:
        if part in EXCLUDE_DIRS:
            return True
    return False

def get_file_hash(filepath: Path):
    try:
        h = hashlib.sha256()
        with open(filepath, 'rb') as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None

def scan_all_files():
    all_files = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            p = Path(root) / f
            all_files.append(p)
    return all_files

def analyze_extensions(files):
    ext_counter = Counter()
    for f in files:
        ext = f.suffix.lower()
        if ext == '' and f.name.startswith('.'):
            ext = f.name
        ext_counter[ext or '[no extension]'] += 1
    return ext_counter

def analyze_assets(files):
    asset_exts = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.pdf'}
    asset_files = [f for f in files if f.suffix.lower() in asset_exts and not is_excluded(f)]
    
    # Hash check for duplicates
    hash_map = defaultdict(list)
    for f in asset_files:
        h = get_file_hash(f)
        if h:
            hash_map[h].append(f)
            
    duplicates = {h: flist for h, flist in hash_map.items() if len(flist) > 1}
    
    # Load code contents
    code_exts = {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.css', '.scss', '.html', '.md', '.yml', '.yaml'}
    code_files = [f for f in files if f.suffix.lower() in code_exts and not is_excluded(f) and f.stat().st_size < 1_000_000]
    
    code_contents = {}
    for cf in code_files:
        try:
            with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
                code_contents[cf] = f.read()
        except Exception:
            pass
            
    asset_usage = {}
    for af in asset_files:
        fname = af.name
        stem = af.stem
        rel_posix = af.relative_to(REPO_ROOT).as_posix()
        
        referencing_files = []
        for cf, content in code_contents.items():
            if cf == af:
                continue
            if fname in content:
                referencing_files.append(cf.relative_to(REPO_ROOT).as_posix())
            elif len(stem) > 4 and (f'"{stem}"' in content or f"'{stem}'" in content or f"`{stem}`" in content or f"/{stem}" in content or f"{stem}." in content):
                referencing_files.append(cf.relative_to(REPO_ROOT).as_posix())
                    
        asset_usage[rel_posix] = referencing_files
        
    return asset_files, duplicates, asset_usage, code_contents

def analyze_naming_conventions(files):
    inconsistencies = []
    for f in files:
        if is_excluded(f):
            continue
        rel = f.relative_to(REPO_ROOT).as_posix()
        name = f.stem
        ext = f.suffix.lower()
        
        # Frontend components / views
        if 'frontend/src' in rel:
            if ('/components/' in rel or '/views/' in rel or '/layouts/' in rel) and ext in ['.tsx', '.jsx']:
                if name != 'index' and not name.startswith('_') and not name.endswith('.test') and not name.endswith('.spec') and not name.endswith('.d'):
                    if not re.match(r'^[A-Z][a-zA-Z0-9]*$', name):
                        inconsistencies.append((rel, f"Component file '{f.name}' is not PascalCase"))
            if ('/hooks/' in rel) and ext in ['.ts', '.tsx']:
                if name != 'index' and not name.startswith('use') and not name.endswith('.test'):
                    inconsistencies.append((rel, f"Hook file '{f.name}' does not start with 'use'"))
        # Backend apps
        if 'api/apps/' in rel and ext == '.py':
            if name != '__init__' and not name.startswith('test_'):
                if not re.match(r'^[a-z0-9_]+$', name):
                    inconsistencies.append((rel, f"Python file '{f.name}' is not snake_case"))
    return inconsistencies

def analyze_dead_code_and_orphans(files, code_contents):
    ts_files = [f for f in files if f.suffix.lower() in ['.ts', '.tsx'] and 'frontend/src' in f.relative_to(REPO_ROOT).as_posix() and not is_excluded(f)]
    
    orphan_ts = []
    for f in ts_files:
        rel = f.relative_to(REPO_ROOT).as_posix()
        fname = f.stem
        
        # Whitelist entrypoints
        if f.name in ['page.tsx', 'layout.tsx', 'route.ts', 'error.tsx', 'not-found.tsx', 'loading.tsx', 'template.tsx', 'default.tsx', 'middleware.ts', 'shims.d.ts', 'global.d.ts', 'index.ts', 'index.tsx']:
            continue
        if 'src/app/' in rel:
            continue
        if f.name.endswith('.d.ts') or f.name.endswith('.test.ts') or f.name.endswith('.test.tsx') or f.name.endswith('.spec.ts'):
            continue
        if 'tests/' in rel or '__mocks__' in rel or 'mocks/' in rel:
            continue
            
        imported = False
        import_patterns = [re.escape(fname)]
        
        for other_f, content in code_contents.items():
            if other_f == f:
                continue
            if 'frontend/' not in other_f.relative_to(REPO_ROOT).as_posix():
                continue
            for pat in import_patterns:
                if re.search(r'[\'"][^\'"]*' + pat + r'[\'"]', content):
                    imported = True
                    break
            if imported:
                break
                
        if not imported:
            orphan_ts.append(rel)
            
    # Also check backend python files
    py_files = [f for f in files if f.suffix.lower() == '.py' and 'api/' in f.relative_to(REPO_ROOT).as_posix() and not is_excluded(f)]
    orphan_py = []
    for f in py_files:
        rel = f.relative_to(REPO_ROOT).as_posix()
        fname = f.stem
        if fname in ['__init__', 'manage', 'wsgi', 'asgi', 'conftest', 'settings', 'urls', 'apps', 'admin', 'models', 'views', 'serializers', 'tests', 'signals', 'tasks']:
            continue
        if 'migrations/' in rel or 'management/commands/' in rel:
            continue
        
        imported = False
        for other_f, content in code_contents.items():
            if other_f == f:
                continue
            if 'api/' not in other_f.relative_to(REPO_ROOT).as_posix():
                continue
            if fname in content:
                imported = True
                break
        if not imported:
            orphan_py.append(rel)
            
    return orphan_ts, orphan_py

def analyze_circular_dependencies(files):
    ts_files = [f for f in files if f.suffix.lower() in ['.ts', '.tsx'] and 'frontend/src' in f.relative_to(REPO_ROOT).as_posix() and not is_excluded(f)]
    
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
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
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
        except Exception:
            pass

    cycles = []
    visited = set()
    
    def dfs(node, path):
        if node in path:
            cycle_start = path.index(node)
            cycle = path[cycle_start:] + [node]
            if len(cycle) <= 6:
                # normalize cycle representation to avoid permutations
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

    seen_cycles = set()
    for node in list(graph.keys()):
        dfs(node, [])
        
    return cycles

def analyze_code_placement(files):
    issues = []
    for f in files:
        if is_excluded(f):
            continue
        rel = f.relative_to(REPO_ROOT).as_posix()
        if 'frontend/src/utils/' in rel and f.suffix in ['.tsx', '.jsx']:
            issues.append((rel, "React Component (.tsx/.jsx) placed inside src/utils/"))
        if 'frontend/src/services/' in rel and f.suffix in ['.tsx', '.jsx']:
            issues.append((rel, "React Component (.tsx/.jsx) placed inside src/services/"))
        if 'frontend/src/hooks/' in rel and not f.name.startswith('use') and f.name not in ['index.ts', 'index.tsx'] and f.suffix in ['.ts', '.tsx'] and not f.name.endswith('.d.ts'):
            issues.append((rel, "Non-hook file in src/hooks/ (does not start with 'use')"))
        if 'api/apps/' in rel and '/utils/' in rel and 'Service' in f.name:
            issues.append((rel, "Service class/file placed inside utils/"))
    return issues

def analyze_todos_and_debug(files):
    debug_findings = []
    code_exts = {'.ts', '.tsx', '.js', '.jsx', '.py'}
    for f in files:
        if is_excluded(f):
            continue
        rel = f.relative_to(REPO_ROOT).as_posix()
        if f.suffix.lower() in code_exts and f.stat().st_size < 500_000:
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                    for i, line in enumerate(fp, 1):
                        if 'debugger;' in line:
                            debug_findings.append((rel, i, 'debugger statement', line.strip()))
                        elif re.search(r'\bconsole\.(log|debug|trace)\(', line) and 'audit' not in rel and 'scripts/' not in rel and 'tests/' not in rel and '__mocks__' not in rel:
                            debug_findings.append((rel, i, 'console.log/debug', line.strip()[:100]))
                        elif re.search(r'\b(TODO|FIXME|HACK|XXX)\b', line) and 'audit' not in rel and 'scripts/' not in rel:
                            debug_findings.append((rel, i, 'TODO/FIXME/HACK', line.strip()[:100]))
            except Exception:
                pass
    return debug_findings

def analyze_root_hygiene(files):
    root_files = [f for f in files if f.parent == REPO_ROOT]
    suspicious_root = []
    for rf in root_files:
        rel = rf.name
        if rel in ['.env', '.env.prod', '.env.example', 'README.md', 'docker-compose.yml', '.gitignore', '.gitattributes', '.dockerignore']:
            continue
        if rel.endswith('.doc') or rel.endswith('.docx') or rel.endswith('.sql') or rel.endswith('.bak') or rel.endswith('.zip'):
            suspicious_root.append((rel, "Loose binary / database dump / doc file at repository root"))
        elif rel.startswith('ENVIRONMENT_AUDIT') or rel.startswith('MIGRATIONS') or rel.startswith('START_GUIDE'):
            suspicious_root.append((rel, "Loose documentation markdown file at repository root (should be in docs/)"))
        elif rel.startswith('firebase') or rel.startswith('firestore'):
            pass # firebase config
        else:
            suspicious_root.append((rel, "Unusual root file"))
    return suspicious_root

def main():
    print("Scanning files...")
    files = scan_all_files()
    print(f"Total files: {len(files)}")
    
    exts = analyze_extensions(files)
    print("\n--- Top Extensions ---")
    for ext, c in exts.most_common(15):
        print(f"  {ext}: {c}")
        
    print("\n--- Assets Analysis ---")
    assets, dup_assets, asset_usage, code_contents = analyze_assets(files)
    print(f"Total assets: {len(assets)}")
    print(f"Duplicate asset hash groups: {len(dup_assets)}")
    unused_assets = [a for a, uses in asset_usage.items() if len(uses) == 0]
    print(f"Potentially Unused Assets: {len(unused_assets)}")
    
    print("\n--- Root Hygiene ---")
    root_issues = analyze_root_hygiene(files)
    for rf, prob in root_issues:
        print(f"  {rf}: {prob}")
        
    print("\n--- Code Placement Issues ---")
    placement_issues = analyze_code_placement(files)
    for rel, prob in placement_issues:
        print(f"  {rel} -> {prob}")
        
    print("\n--- Naming Issues ---")
    naming_issues = analyze_naming_conventions(files)
    print(f"Total naming issues: {len(naming_issues)}")
    for rel, prob in naming_issues[:15]:
        print(f"  {rel} -> {prob}")
        
    print("\n--- Orphan Code Analysis ---")
    orphan_ts, orphan_py = analyze_dead_code_and_orphans(files, code_contents)
    print(f"Frontend unreferenced TS/TSX files: {len(orphan_ts)}")
    for o in orphan_ts[:15]:
        print(f"  [TS] {o}")
    print(f"Backend unreferenced PY files: {len(orphan_py)}")
    for o in orphan_py[:15]:
        print(f"  [PY] {o}")
        
    print("\n--- Circular Dependency Analysis ---")
    cycles = analyze_circular_dependencies(files)
    print(f"Total Circular Dependency cycles in frontend: {len(cycles)}")
    for c in cycles[:10]:
        print(f"  Cycle: {' -> '.join(c)}")
        
    print("\n--- Debug & TODO statements ---")
    debugs = analyze_todos_and_debug(files)
    print(f"Total Debug/Console/TODO statements: {len(debugs)}")
    
    result_data = {
        "total_files": len(files),
        "extensions": dict(exts),
        "total_assets": len(assets),
        "duplicate_assets": {h: [f.relative_to(REPO_ROOT).as_posix() for f in flist] for h, flist in dup_assets.items()},
        "unused_assets": unused_assets,
        "asset_usage": {a: uses for a, uses in asset_usage.items() if len(uses) > 0},
        "root_issues": root_issues,
        "placement_issues": placement_issues,
        "naming_issues": naming_issues,
        "orphan_ts": orphan_ts,
        "orphan_py": orphan_py,
        "cycles": cycles,
        "debug_count": len(debugs),
        "debug_samples": debugs[:40]
    }
    
    with open(REPO_ROOT / 'scripts' / 'audit_results.json', 'w', encoding='utf-8') as f:
        json.dump(result_data, f, indent=2)
    print("\nAudit analysis written to scripts/audit_results.json")

if __name__ == '__main__':
    main()
