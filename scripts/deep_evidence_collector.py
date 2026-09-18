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
    'dist', 'build', '.vscode', '.idea', 'coverage', '.turbo'
}

def normalize_path(p: Path) -> str:
    return p.relative_to(REPO_ROOT).as_posix()

def get_file_hash(filepath: Path):
    try:
        h = hashlib.sha256()
        with open(filepath, 'rb') as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None

def main():
    print("Collecting deep evidence across entire workspace...")
    all_files = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            all_files.append(Path(root) / f)

    # 1. ROOT HYGIENE
    root_items = []
    for p in REPO_ROOT.iterdir():
        if p.name in {'.git', 'node_modules', '.next'}:
            continue
        root_items.append({
            "name": p.name,
            "is_dir": p.is_dir(),
            "size": p.stat().st_size if p.is_file() else 0,
            "ext": p.suffix if p.is_file() else "[dir]"
        })

    # 2. READ ALL CODE CONTENTS
    code_exts = {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.css', '.scss', '.html', '.md', '.yml', '.yaml', '.sql', '.sh', '.ini', '.doc', '.cjs', '.mjs'}
    code_contents = {}
    for f in all_files:
        if f.suffix.lower() in code_exts and f.stat().st_size < 3_000_000:
            rel = normalize_path(f)
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                    code_contents[rel] = fp.read()
            except Exception:
                pass

    # 3. ASSET AUDIT
    asset_exts = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.pdf'}
    asset_files = [f for f in all_files if f.suffix.lower() in asset_exts]
    
    asset_hashes = defaultdict(list)
    for af in asset_files:
        h = get_file_hash(af)
        if h:
            asset_hashes[h].append(normalize_path(af))
            
    duplicate_assets = {h: paths for h, paths in asset_hashes.items() if len(paths) > 1}
    
    asset_usage_map = {}
    for af in asset_files:
        rel = normalize_path(af)
        fname = af.name
        stem = af.stem
        refs = []
        for cf, content in code_contents.items():
            if cf == rel:
                continue
            if fname in content:
                refs.append(cf)
            elif len(stem) >= 4 and f"/{stem}" in content:
                refs.append(cf)
            elif len(stem) >= 4 and f"'{stem}'" in content or f'"{stem}"' in content:
                refs.append(cf)
        
        # Categorize asset location
        category = "unknown"
        if rel.startswith("frontend/public/"):
            category = "public_static"
        elif rel.startswith("frontend/src/assets/"):
            category = "frontend_src_assets"
        elif rel.startswith("api/data/"):
            category = "backend_seed_images"
        elif rel.startswith("api/"):
            category = "backend_other"
        elif rel.startswith("docs/"):
            category = "documentation_assets"
        else:
            category = "root_or_other"

        asset_usage_map[rel] = {
            "name": fname,
            "category": category,
            "size": af.stat().st_size,
            "ref_count": len(refs),
            "references": refs[:5]
        }

    unused_assets = [rel for rel, data in asset_usage_map.items() if data["ref_count"] == 0]

    # 4. BACKEND ARCHITECTURE & CODE PLACEMENT
    backend_anomalies = []
    
    # Check apps inside api/
    api_apps_dir = REPO_ROOT / 'api' / 'apps'
    django_apps = [d.name for d in api_apps_dir.iterdir() if d.is_dir() and not d.name.startswith('__')] if api_apps_dir.exists() else []

    # Check for apps outside api/apps
    api_dir = REPO_ROOT / 'api'
    for d in api_dir.iterdir():
        if d.is_dir() and d.name not in {'apps', '__pycache__', '.pytest_cache', 'config', 'logs', 'data', 'scripts', 'shared', 'console', 'integrations'}:
            # check if it has models.py or apps.py
            if (d / 'models.py').exists() or (d / 'apps.py').exists() or (d / 'views.py').exists():
                backend_anomalies.append({
                    "path": f"api/{d.name}",
                    "issue": f"Django app 'api/{d.name}' located outside 'api/apps/' convention",
                    "severity": "HIGH"
                })

    # Check api/config files
    config_dir = api_dir / 'config'
    for f in config_dir.iterdir():
        if f.is_file():
            if f.name in {'admin.py', 'interviews_compat_views.py', 'views.py', 'tests.py'}:
                backend_anomalies.append({
                    "path": f"api/config/{f.name}",
                    "issue": f"Application logic / admin / view / test '{f.name}' inside project root configuration package 'api/config/'",
                    "severity": "HIGH" if f.name in {'admin.py', 'interviews_compat_views.py'} else "MEDIUM",
                    "size": f.stat().st_size
                })

    # Check root api scripts
    for f in api_dir.iterdir():
        if f.is_file() and f.suffix == '.py' and f.name not in {'manage.py', 'conftest.py'}:
            backend_anomalies.append({
                "path": f"api/{f.name}",
                "issue": f"Database seed/utility script '{f.name}' sitting in api root directory instead of management commands or api/scripts/",
                "severity": "MEDIUM",
                "size": f.stat().st_size
            })

    # 5. FRONTEND CODE PLACEMENT & CONVENTIONS
    frontend_anomalies = []
    
    # Check Commons vs Common
    if (REPO_ROOT / 'frontend/src/components/Commons').exists():
        frontend_anomalies.append({
            "path": "frontend/src/components/Commons",
            "issue": "Duplicate / typo folder 'Commons' alongside 'Common' containing only a re-export shim",
            "severity": "HIGH"
        })

    # Check views/components vs components/
    views_comp = REPO_ROOT / 'frontend/src/views/components'
    if views_comp.exists():
        frontend_anomalies.append({
            "path": "frontend/src/views/components",
            "issue": "Parallel component hierarchy 'src/views/components/' competing with 'src/components/Common' and 'src/components/Features'",
            "severity": "HIGH"
        })

    # Check configs vs themeConfigs
    if (REPO_ROOT / 'frontend/src/themeConfigs').exists() and (REPO_ROOT / 'frontend/src/configs').exists():
        frontend_anomalies.append({
            "path": "frontend/src/themeConfigs",
            "issue": "Split configuration folders: 'src/themeConfigs/' vs 'src/configs/'",
            "severity": "MEDIUM"
        })

    # Check mocks vs __mocks__ vs test
    fe_src = REPO_ROOT / 'frontend/src'
    mock_folders = [d.name for d in fe_src.iterdir() if d.is_dir() and ('mock' in d.name.lower() or 'test' in d.name.lower())]
    if len(mock_folders) > 1:
        frontend_anomalies.append({
            "path": f"frontend/src/({', '.join(mock_folders)})",
            "issue": f"Fragmented test/mock directories in src: {mock_folders} while frontend/tests also exists",
            "severity": "MEDIUM"
        })

    # Check root frontend files
    fe_root = REPO_ROOT / 'frontend'
    for f in fe_root.iterdir():
        if f.is_file() and f.name in {'audit_i18n.cjs', 'audit_output.md', 'doctor.config.json', 'skills-lock.json'}:
            frontend_anomalies.append({
                "path": f"frontend/{f.name}",
                "issue": f"Ad-hoc audit/tooling file '{f.name}' placed in frontend root",
                "severity": "LOW"
            })

    # 6. SEMANTIC DUPLICATIONS & DUPLICATE UTILITIES
    semantic_duplications = []
    
    # Find all date format functions across repo
    date_helpers = []
    for rel, content in code_contents.items():
        if rel.startswith(('frontend/src/', 'api/apps/', 'api/shared/')):
            for line_no, line in enumerate(content.splitlines(), 1):
                if re.search(r'(function|const|def)\s+(formatDate|formatDateTime|timeAgo|formatTime|getFormattedDate|dateFormatter)', line):
                    date_helpers.append({"file": rel, "line": line_no, "code": line.strip()})
    if len(date_helpers) > 3:
        semantic_duplications.append({
            "category": "Date / Time Formatting",
            "count": len(date_helpers),
            "samples": date_helpers[:8]
        })

    # Find API clients / baseURL definitions
    api_base_urls = []
    for rel, content in code_contents.items():
        if rel.startswith('frontend/src/'):
            for line_no, line in enumerate(content.splitlines(), 1):
                if re.search(r'axios\.create|API_BASE_URL|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_BACKEND_URL', line):
                    api_base_urls.append({"file": rel, "line": line_no, "code": line.strip()})
    if len(api_base_urls) > 2:
        semantic_duplications.append({
            "category": "API Base URL / Axios Client Instantiations",
            "count": len(api_base_urls),
            "samples": api_base_urls[:8]
        })

    # 7. DEBUG & TEMPORARY CODE DETAILS
    debug_items = []
    for rel, content in code_contents.items():
        if rel.startswith(('frontend/src/', 'api/apps/', 'voice-ai/src/')):
            for line_no, line in enumerate(content.splitlines(), 1):
                line_str = line.strip()
                if line_str.startswith('//') or line_str.startswith('#'):
                    continue
                if 'console.log(' in line_str:
                    debug_items.append({"file": rel, "line": line_no, "type": "console.log", "code": line_str[:120]})
                elif 'debugger;' in line_str or line_str == 'debugger':
                    debug_items.append({"file": rel, "line": line_no, "type": "debugger", "code": line_str[:120]})
                elif 'print(' in line_str and rel.startswith('api/apps/') and 'management' not in rel and 'seeder' not in rel:
                    debug_items.append({"file": rel, "line": line_no, "type": "print", "code": line_str[:120]})

    # 8. CIRCULAR DEPENDENCIES CHECK
    # Build FE dependency graph
    ts_files = [rel for rel in code_contents.keys() if rel.startswith('frontend/src/') and rel.endswith(('.ts', '.tsx'))]
    fe_graph = defaultdict(set)
    for rel in ts_files:
        content = code_contents[rel]
        # find imports
        for m in re.finditer(r'from\s+[\'\"]([^\'\"]+)[\'\"]', content):
            imp = m.group(1)
            target = None
            if imp.startswith('.'):
                cur_dir = (REPO_ROOT / rel).parent
                cand = cur_dir / imp
                # check cand.ts, cand.tsx, cand/index.ts, cand/index.tsx
                for ext in ['', '.ts', '.tsx', '/index.ts', '/index.tsx']:
                    p = Path(str(cand) + ext).resolve()
                    if p.exists() and p.is_file():
                        try:
                            target = normalize_path(p)
                            break
                        except Exception:
                            pass
            elif imp.startswith('@/'):
                cand = REPO_ROOT / 'frontend' / 'src' / imp[2:]
                for ext in ['', '.ts', '.tsx', '/index.ts', '/index.tsx']:
                    p = Path(str(cand) + ext).resolve()
                    if p.exists() and p.is_file():
                        try:
                            target = normalize_path(p)
                            break
                        except Exception:
                            pass
            if target and target.startswith('frontend/src/'):
                fe_graph[rel].add(target)

    # Find cycles in fe_graph using DFS
    cycles = []
    visited = {}
    path = []

    def dfs(node):
        visited[node] = 1 # in progress
        path.append(node)
        for neighbor in fe_graph.get(node, []):
            if visited.get(neighbor) == 1:
                # Cycle found
                cycle_start = path.index(neighbor)
                cycle = path[cycle_start:] + [neighbor]
                if len(cycle) <= 6:
                    cycles.append(cycle)
            elif visited.get(neighbor) != 2:
                dfs(neighbor)
        path.pop()
        visited[node] = 2 # completed

    for node in list(fe_graph.keys()):
        if visited.get(node) != 2:
            dfs(node)

    # 9. COMPILE SUMMARY OUTPUT
    deep_data = {
        "root_items": root_items,
        "django_apps": django_apps,
        "backend_anomalies": backend_anomalies,
        "frontend_anomalies": frontend_anomalies,
        "assets_total": len(asset_files),
        "assets_unused_count": len(unused_assets),
        "assets_unused": unused_assets,
        "duplicate_assets_groups": duplicate_assets,
        "semantic_duplications": semantic_duplications,
        "debug_items_count": len(debug_items),
        "debug_items": debug_items[:30],
        "cycles_count": len(cycles),
        "cycles_sample": cycles[:10]
    }

    out_file = Path('scripts/deep_evidence_dataset.json')
    with open(out_file, 'w', encoding='utf-8') as fp:
        json.dump(deep_data, fp, indent=2)

    print(f"Deep evidence collected into {out_file}.")

if __name__ == '__main__':
    main()
