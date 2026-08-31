import os
import sys
import json
import re
from pathlib import Path

REPO_ROOT = Path('.').resolve()
EXCLUDE_DIRS = {'node_modules', '.git', '.next', '__pycache__', '.pytest_cache', 'dist', 'build', '.vscode', '.idea', 'coverage', '.turbo'}

def main():
    print("Performing strict orphan & dead code detection...")
    
    # 1. Collect all source files
    fe_files = []
    be_files = []
    voice_files = []
    
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            p = Path(root) / f
            rel = p.relative_to(REPO_ROOT).as_posix()
            if rel.startswith('frontend/src/') and rel.endswith(('.ts', '.tsx')):
                fe_files.append(rel)
            elif rel.startswith('api/') and rel.endswith('.py'):
                be_files.append(rel)
            elif rel.startswith('voice-ai/') and rel.endswith(('.py', '.ts', '.tsx')):
                voice_files.append(rel)

    # 2. Read all text in repo
    all_text = {}
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() in {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.html', '.md', '.yml', '.yaml', '.css', '.scss'}:
                rel = p.relative_to(REPO_ROOT).as_posix()
                try:
                    with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                        all_text[rel] = fp.read()
                except Exception:
                    pass

    # 3. Check FE orphans
    fe_orphans = []
    for f in fe_files:
        p = Path(f)
        stem = p.stem
        fname = p.name
        # Skip entrypoints, layouts, route pages, shims, mocks, configs
        if stem in {'index', 'layout', 'page', 'loading', 'error', 'not-found', 'global-error', 'route', 'middleware', 'shims.d'}:
            continue
        if 'app/' in f:
            continue
            
        # Count references in other files
        refs = []
        for other_f, content in all_text.items():
            if other_f == f:
                continue
            # Look for exact import of stem or filename or relative path
            if f"/{stem}" in content or f"'{stem}'" in content or f'"{stem}"' in content or f"`{stem}`" in content or f"from '{p.parent.name}'" in content or stem in content:
                refs.append(other_f)
                
        if len(refs) == 0:
            fe_orphans.append({
                "file": f,
                "reason": "Never imported or referenced in any file"
            })

    # 4. Check BE orphans
    be_orphans = []
    for f in be_files:
        p = Path(f)
        stem = p.stem
        fname = p.name
        if fname in {'__init__.py', 'urls.py', 'apps.py', 'models.py', 'admin.py', 'views.py', 'serializers.py', 'tasks.py', 'manage.py', 'wsgi.py', 'asgi.py', 'settings.py', 'conftest.py', 'tests.py'}:
            continue
        if 'migrations/' in f or 'management/commands' in f:
            continue
            
        refs = []
        for other_f, content in all_text.items():
            if other_f == f:
                continue
            if stem in content:
                refs.append(other_f)
                
        if len(refs) == 0:
            be_orphans.append({
                "file": f,
                "reason": "Never imported or referenced in any file"
            })

    print(f"FE Orphans found: {len(fe_orphans)}")
    print(f"BE Orphans found: {len(be_orphans)}")
    
    with open('scripts/orphan_analysis.json', 'w', encoding='utf-8') as fp:
        json.dump({
            "fe_orphans": fe_orphans,
            "be_orphans": be_orphans
        }, fp, indent=2)

if __name__ == '__main__':
    main()
