import os
import sys
import json
import re
from pathlib import Path
from collections import defaultdict

REPO_ROOT = Path('.').resolve()
EXCLUDE_DIRS = {'node_modules', '.git', '.next', '__pycache__', '.pytest_cache', 'dist', 'build', '.vscode', '.idea', 'coverage', '.turbo'}

def main():
    print("Starting fast indexed orphan and dead code audit...")
    
    # 1. Collect all import tokens across all source files
    all_import_tokens = defaultdict(set) # token -> set of files where it appears
    all_source_files = {} # rel_path -> content
    
    code_exts = {'.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.html', '.md', '.yml', '.yaml', '.css', '.scss', '.sql'}
    
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            p = Path(root) / f
            ext = p.suffix.lower()
            if ext in code_exts and p.stat().st_size < 2_000_000:
                rel = p.relative_to(REPO_ROOT).as_posix()
                try:
                    with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                        content = fp.read()
                        all_source_files[rel] = content
                        
                        # Extract words/tokens
                        words = set(re.findall(r'[a-zA-Z0-9_\-\./]+', content))
                        for w in words:
                            all_import_tokens[w].add(rel)
                except Exception:
                    pass

    print(f"Loaded {len(all_source_files)} source files. Total distinct tokens: {len(all_import_tokens)}")

    # 2. Check candidate files
    orphan_candidates = []
    
    for rel, content in all_source_files.items():
        if not (rel.startswith('frontend/src/') or rel.startswith('api/apps/') or rel.startswith('api/common/') or rel.startswith('voice-ai/')):
            continue
            
        p = Path(rel)
        stem = p.stem
        fname = p.name
        
        # Ignored standard files
        if stem in {'index', 'layout', 'page', 'loading', 'error', 'not-found', 'global-error', 'route', 'middleware', 'shims.d', '__init__', 'urls', 'apps', 'models', 'admin', 'views', 'serializers', 'tasks', 'conftest', 'manage', 'wsgi', 'asgi', 'settings'}:
            continue
        if 'app/' in rel and ('page.tsx' in rel or 'layout.tsx' in rel or 'route.ts' in rel):
            continue
        if 'management/commands' in rel or 'migrations/' in rel:
            continue
            
        # Check token references
        referencing_files = set()
        
        # Check stem
        if stem in all_import_tokens:
            referencing_files.update(all_import_tokens[stem] - {rel})
            
        # Check fname
        if fname in all_import_tokens:
            referencing_files.update(all_import_tokens[fname] - {rel})
            
        # Filter out self or .test files if looking for production usage
        prod_refs = [rf for rf in referencing_files if not rf.endswith(('.test.ts', '.test.tsx', '.spec.ts', '_test.py', 'tests.py'))]
        
        if len(referencing_files) == 0:
            orphan_candidates.append({
                "file": rel,
                "status": "DEAD / ORPHAN",
                "reason": "No imports or references found in entire repository",
                "size_bytes": len(content)
            })
        elif len(prod_refs) == 0:
            orphan_candidates.append({
                "file": rel,
                "status": "TEST_ONLY / POTENTIALLY_UNUSED",
                "reason": f"Only referenced in test files ({list(referencing_files)})",
                "size_bytes": len(content)
            })

    print(f"Total orphan / unused candidate files detected: {len(orphan_candidates)}")
    
    with open('scripts/fast_orphan_results.json', 'w', encoding='utf-8') as fp:
        json.dump(orphan_candidates, fp, indent=2)

if __name__ == '__main__':
    main()
