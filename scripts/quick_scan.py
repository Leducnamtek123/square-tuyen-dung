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

files = scan_files()
print(f"Total non-excluded files: {len(files)}", flush=True)

# Count by dir
dir_counts = Counter()
for f in files:
    rel = f.relative_to(REPO_ROOT)
    top_dir = rel.parts[0] if len(rel.parts) > 1 else "[root]"
    dir_counts[top_dir] += 1

print("\n--- Files per top-level directory ---", flush=True)
for d, c in dir_counts.most_common():
    print(f"  {d}: {c}", flush=True)
