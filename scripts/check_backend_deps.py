import os
import sys
import re
from pathlib import Path
from collections import defaultdict

REPO_ROOT = Path('.').resolve()
API_DIR = REPO_ROOT / 'api'

def check_backend():
    apps_dir = API_DIR / 'apps'
    apps = [d.name for d in apps_dir.iterdir() if d.is_dir() and not d.name.startswith('__')]
    
    # Check cross-app imports
    cross_app_imports = defaultdict(lambda: defaultdict(list))
    
    for app in apps:
        app_path = apps_dir / app
        for root, _, files in os.walk(app_path):
            for f in files:
                if f.endswith('.py'):
                    file_path = Path(root) / f
                    rel_file = file_path.relative_to(REPO_ROOT).as_posix()
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                        content = fp.read()
                        
                    for line_no, line in enumerate(content.splitlines(), 1):
                        # match from apps.xxx or import apps.xxx
                        m = re.search(r'(?:from|import)\s+apps\.([a-zA-Z0-9_]+)', line)
                        if m:
                            imported_app = m.group(1)
                            if imported_app != app and imported_app in apps:
                                cross_app_imports[app][imported_app].append((rel_file, line_no, line.strip()))
                                
    print(f"Detected cross-app dependencies among {len(apps)} apps:")
    cross_matrix = {}
    for app, deps in cross_app_imports.items():
        cross_matrix[app] = {d: len(lines) for d, lines in deps.items()}
        print(f"  App '{app}' imports from: {dict(cross_matrix[app])}")
        
    # Check bidirectional cross-app dependencies (coupling/cycles)
    cycles = []
    for app_a in cross_app_imports:
        for app_b in cross_app_imports[app_a]:
            if app_a in cross_app_imports.get(app_b, {}):
                pair = tuple(sorted([app_a, app_b]))
                if pair not in cycles:
                    cycles.append(pair)
                    
    print(f"\nBidirectional App Couplings (Cycles): {cycles}")
    return cross_matrix, cycles, cross_app_imports

if __name__ == '__main__':
    check_backend()
