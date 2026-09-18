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

def main():
    print("[1/10] Scanning entire repository files...")
    all_files = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            p = Path(root) / f
            all_files.append(p)
            
    print(f"Total files discovered: {len(all_files)}")

    # 1. Root hygiene analysis
    root_files = []
    for item in REPO_ROOT.iterdir():
        if item.is_file():
            root_files.append({
                "name": item.name,
                "size": item.stat().st_size,
                "ext": item.suffix
            })
    root_dirs = [d.name for d in REPO_ROOT.iterdir() if d.is_dir() and d.name not in {'.git'}]

    # 2. Extension breakdown
    ext_stats = Counter(f.suffix.lower() if f.suffix else f.name for f in all_files)

    # 3. Read code contents for cross-referencing
    print("[2/10] Loading code contents for cross-reference analysis...")
    code_exts = {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.css', '.scss', '.html', '.md', '.yml', '.yaml', '.sql', '.sh'}
    code_contents = {}
    for f in all_files:
        if f.suffix.lower() in code_exts and f.stat().st_size < 3_000_000:
            try:
                rel = f.relative_to(REPO_ROOT).as_posix()
                with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                    code_contents[rel] = fp.read()
            except Exception:
                pass

    # 4. Asset Analysis
    print("[3/10] Auditing all visual, font, and media assets...")
    asset_exts = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.pdf'}
    asset_files = [f for f in all_files if f.suffix.lower() in asset_exts]
    
    asset_hashes = defaultdict(list)
    for af in asset_files:
        h = get_file_hash(af)
        if h:
            asset_hashes[h].append(af.relative_to(REPO_ROOT).as_posix())
            
    duplicate_asset_groups = {h: paths for h, paths in asset_hashes.items() if len(paths) > 1}
    
    asset_usage_map = {}
    for af in asset_files:
        rel = af.relative_to(REPO_ROOT).as_posix()
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
        asset_usage_map[rel] = {
            "references": refs,
            "ref_count": len(refs),
            "size": af.stat().st_size
        }
    
    unused_assets = [rel for rel, data in asset_usage_map.items() if data["ref_count"] == 0]

    # 5. Frontend Deep Placement Audit
    print("[4/10] Auditing frontend layers, components, views, services, stores, utils...")
    frontend_files = [f for f in all_files if f.parts[0] == 'frontend']
    fe_components = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'components' in f.parts and f.suffix in {'.tsx', '.jsx'}]
    fe_views = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'views' in f.parts and f.suffix in {'.tsx', '.jsx'}]
    fe_services = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'services' in f.parts]
    fe_hooks = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'hooks' in f.parts]
    fe_utils = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'utils' in f.parts or 'helpers' in f.parts]
    fe_stores = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'store' in f.parts or 'stores' in f.parts]
    fe_types = [f.relative_to(REPO_ROOT).as_posix() for f in frontend_files if 'types' in f.parts or 'interfaces' in f.parts]

    # Check component usage across views vs components
    component_usages = {}
    for comp in fe_components:
        comp_stem = Path(comp).stem
        if comp_stem == 'index':
            comp_stem = Path(comp).parent.name
        
        importers = []
        for cf, content in code_contents.items():
            if cf == comp:
                continue
            if not cf.startswith('frontend/'):
                continue
            if comp_stem in content:
                importers.append(cf)
        component_usages[comp] = {
            "importers": importers,
            "import_count": len(importers)
        }

    # 6. Backend Deep Placement Audit
    print("[5/10] Auditing backend Django apps, models, serializers, views, services, tasks...")
    backend_files = [f for f in all_files if f.parts[0] == 'api']
    django_apps = set()
    be_models = []
    be_serializers = []
    be_views = []
    be_services = []
    be_tasks = []
    be_seeders = []

    for bf in backend_files:
        rel = bf.relative_to(REPO_ROOT).as_posix()
        parts = bf.parts
        if len(parts) >= 3 and parts[1] == 'apps':
            django_apps.add(parts[2])
            if 'models' in parts or bf.stem == 'models' or 'models.py' in rel:
                be_models.append(rel)
            elif 'serializers' in parts or bf.stem.endswith('serializer') or bf.stem == 'serializers':
                be_serializers.append(rel)
            elif 'views' in parts or bf.stem.endswith('view') or bf.stem == 'views':
                be_views.append(rel)
            elif 'services' in parts or bf.stem.endswith('service') or bf.stem == 'services':
                be_services.append(rel)
            elif 'tasks' in parts or bf.stem == 'tasks':
                be_tasks.append(rel)
            elif 'management' in parts or 'seed' in bf.name.lower():
                be_seeders.append(rel)

    # 7. Circular Dependency & Coupling Analysis
    print("[6/10] Analyzing circular imports & cross-module boundaries...")
    # FE import graph
    fe_import_graph = defaultdict(set)
    for rel, content in code_contents.items():
        if rel.startswith('frontend/src/') and rel.endswith(('.ts', '.tsx', '.js', '.jsx')):
            # match imports
            matches = re.findall(r'from\s+[\'\"]([^\'\"]+)[\'\"]', content)
            for m in matches:
                if m.startswith('.'):
                    # resolve relative path
                    target_dir = Path(rel).parent
                    try:
                        resolved = (target_dir / m).resolve()
                        rel_target = resolved.relative_to(REPO_ROOT).as_posix()
                        fe_import_graph[rel].add(rel_target)
                    except Exception:
                        pass
                elif m.startswith('@/'):
                    rel_target = f"frontend/src/{m[2:]}"
                    fe_import_graph[rel].add(rel_target)

    # 8. Duplicate / Semantic Duplication Audit
    print("[7/10] Checking duplicate code, duplicate utilities, duplicate naming...")
    file_by_name = defaultdict(list)
    for f in all_files:
        if f.suffix in {'.ts', '.tsx', '.py', '.js', '.jsx'}:
            file_by_name[f.name].append(f.relative_to(REPO_ROOT).as_posix())
            
    duplicate_filenames = {name: paths for name, paths in file_by_name.items() if len(paths) > 1 and not name.startswith('index.') and not name.startswith('__init__.') and not name == 'types.ts' and not name == 'urls.py' and not name == 'admin.py' and not name == 'models.py' and not name == 'views.py' and not name == 'serializers.py' and not name == 'apps.py'}

    # 9. Dead / Orphan Files Audit
    print("[8/10] Identifying orphan / unreferenced files...")
    orphan_files = []
    for rel, content in code_contents.items():
        if rel.startswith(('frontend/src/', 'api/apps/', 'voice-ai/src/')):
            stem = Path(rel).stem
            fname = Path(rel).name
            if fname in {'index.ts', 'index.tsx', '__init__.py', 'urls.py', 'apps.py', 'models.py', 'admin.py', 'views.py', 'serializers.py', 'tasks.py', 'conftest.py', 'manage.py'}:
                continue
            if 'app/' in rel or 'routes/' in rel or 'pages/' in rel or 'management/commands' in rel:
                continue
                
            # Check if referenced in any other file
            is_referenced = False
            for other_file, other_content in code_contents.items():
                if other_file == rel:
                    continue
                if stem in other_content or fname in other_content:
                    is_referenced = True
                    break
            if not is_referenced:
                orphan_files.append(rel)

    # 10. Temporary / Debug Code Audit
    print("[9/10] Auditing debug logs, console.*, debugger, TODO/FIXME...")
    debug_findings = []
    for rel, content in code_contents.items():
        if rel.startswith(('frontend/src/', 'api/apps/', 'voice-ai/src/')):
            lines = content.splitlines()
            for idx, line in enumerate(lines, 1):
                clean_line = line.strip()
                if 'console.log' in clean_line and not clean_line.startswith('//'):
                    debug_findings.append({'file': rel, 'line': idx, 'type': 'console.log', 'code': clean_line[:120]})
                elif 'debugger;' in clean_line or 'debugger' == clean_line:
                    debug_findings.append({'file': rel, 'line': idx, 'type': 'debugger', 'code': clean_line[:120]})
                elif 'TODO' in clean_line or 'FIXME' in clean_line or 'HACK' in clean_line:
                    debug_findings.append({'file': rel, 'line': idx, 'type': 'TODO/FIXME', 'code': clean_line[:120]})
                elif 'print(' in clean_line and rel.startswith('api/apps/') and 'management' not in rel and not clean_line.startswith('#'):
                    debug_findings.append({'file': rel, 'line': idx, 'type': 'python_print', 'code': clean_line[:120]})

    # Deep relative imports
    deep_relative_imports = []
    for rel, content in code_contents.items():
        if rel.startswith('frontend/src/'):
            for idx, line in enumerate(content.splitlines(), 1):
                if re.search(r'from\s+[\'\"](\.\./\.\./\.\..*)[\'\"]', line):
                    deep_relative_imports.append({'file': rel, 'line': idx, 'code': line.strip()})

    print("[10/10] Consolidating and serializing full audit dataset...")
    audit_data = {
        "summary": {
            "total_files": len(all_files),
            "root_files_count": len(root_files),
            "django_apps": sorted(list(django_apps)),
            "django_apps_count": len(django_apps),
            "asset_files_count": len(asset_files),
            "unused_assets_count": len(unused_assets),
            "duplicate_asset_groups_count": len(duplicate_asset_groups),
            "duplicate_filenames_count": len(duplicate_filenames),
            "orphan_files_count": len(orphan_files),
            "debug_findings_count": len(debug_findings),
            "deep_relative_imports_count": len(deep_relative_imports),
            "extension_distribution": dict(ext_stats.most_common(25))
        },
        "root_hygiene": {
            "root_files": root_files,
            "root_dirs": root_dirs
        },
        "assets": {
            "total": len(asset_files),
            "unused": unused_assets,
            "duplicates": duplicate_asset_groups,
            "usage_sample": {k: asset_usage_map[k] for k in list(asset_usage_map.keys())[:30]}
        },
        "frontend": {
            "components_count": len(fe_components),
            "views_count": len(fe_views),
            "services_count": len(fe_services),
            "hooks_count": len(fe_hooks),
            "utils_count": len(fe_utils),
            "stores_count": len(fe_stores),
            "types_count": len(fe_types),
            "deep_relative_imports": deep_relative_imports[:50],
            "component_usages_sample": {k: component_usages[k] for k in list(component_usages.keys())[:40]}
        },
        "backend": {
            "apps": sorted(list(django_apps)),
            "models_count": len(be_models),
            "serializers_count": len(be_serializers),
            "views_count": len(be_views),
            "services_count": len(be_services),
            "tasks_count": len(be_tasks),
            "seeders_count": len(be_seeders)
        },
        "duplicate_filenames": duplicate_filenames,
        "orphan_files": orphan_files,
        "debug_findings_summary": Counter(d['type'] for d in debug_findings),
        "debug_findings_samples": debug_findings[:60]
    }

    out_path = Path('scripts/complete_audit_dataset.json')
    with open(out_path, 'w', encoding='utf-8') as fp:
        json.dump(audit_data, fp, indent=2)
        
    print(f"Audit analysis complete. Output written to {out_path} ({out_path.stat().st_size} bytes).")

if __name__ == '__main__':
    main()
