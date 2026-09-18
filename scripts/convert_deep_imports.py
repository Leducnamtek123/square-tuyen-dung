import os
import re
from pathlib import Path

REPO_ROOT = Path('.').resolve()
SRC_DIR = REPO_ROOT / 'frontend' / 'src'

def resolve_deep_import(source_file: Path, import_path: str) -> str:
    if not import_path.startswith('../'):
        return import_path
    
    # Check how many ../ are in the path
    parts = import_path.split('/')
    up_count = sum(1 for p in parts if p == '..')
    if up_count < 2:
        # Keep 1 level (e.g. ../types) or local relative imports if shallow
        return import_path
        
    # Resolve target directory
    source_dir = source_file.parent
    target_path = (source_dir / import_path).resolve()
    
    # Check if target is inside frontend/src
    try:
        rel_to_src = target_path.relative_to(SRC_DIR).as_posix()
        return f"@/{rel_to_src}"
    except ValueError:
        return import_path

def main():
    print("Analyzing and normalizing deep relative imports across frontend/src...")
    ts_files = []
    for root, _, files in os.walk(SRC_DIR):
        for f in files:
            if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
                ts_files.append(Path(root) / f)
                
    modified_files = 0
    total_rewrites = 0
    
    # Pattern to match: from '../..' or import '../..' or require('../..')
    pattern = re.compile(r'(from\s+[\'\"])((\.\./)+[^\'\"]+)([\'\"])')
    
    for f in ts_files:
        try:
            content = f.read_text(encoding='utf-8')
        except Exception:
            continue
            
        def replacer(match):
            nonlocal total_rewrites
            prefix = match.group(1)
            old_path = match.group(2)
            suffix = match.group(4)
            new_path = resolve_deep_import(f, old_path)
            if new_path != old_path:
                total_rewrites += 1
                return f"{prefix}{new_path}{suffix}"
            return match.group(0)
            
        new_content = pattern.sub(replacer, content)
        if new_content != content:
            f.write_text(new_content, encoding='utf-8')
            modified_files += 1

    print(f"Deep import normalization complete: Rewrote {total_rewrites} imports across {modified_files} files.")

if __name__ == '__main__':
    main()
