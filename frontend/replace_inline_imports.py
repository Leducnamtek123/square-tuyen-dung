import os
import re

src_dir = 'src' # Since we run inside frontend

pattern = re.compile(r"import\(['\"]([^'\"]+)['\"]\)\.([a-zA-Z0-9_]+)")

COMMON_GENERIC_TYPES = {'FormValues', 'Resolver', 'FieldValues', 'CellContext', 'Control', 'Theme'}

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = pattern.findall(content)
    if not matches:
        return False
        
    unique_imports = set(matches)
    imports_to_add = []
    
    # Pre-check existing definitions
    existing_defs = set()
    for m in re.finditer(r'\b(?:interface|type|const|class)\s+([a-zA-Z0-9_]+)\b', content):
        existing_defs.add(m.group(1))
    for m in re.finditer(r'import\s+.*?([a-zA-Z0-9_]+)\b.*?(?:from|require)', content):
        existing_defs.add(m.group(1))
    
    for path, type_name in unique_imports:
        alias = type_name
        
        needs_alias = (type_name in COMMON_GENERIC_TYPES) or (type_name in existing_defs)
        
        if needs_alias:
            basename = os.path.basename(path).replace('-', '_').replace('.', '_')
            if not basename or basename == '_':
                basename = path.replace('/', '_').replace('@', '')
            # Clean up basename to only alphanumeric
            basename = re.sub(r'[^a-zA-Z0-9_]', '', basename)
            prefix = ''.join(word.capitalize() for word in basename.split('_') if word)
            alias = f"{prefix}{type_name}"
            
            # Avoid collision of aliased name
            counter = 1
            original_alias = alias
            while alias in existing_defs:
                alias = f"{original_alias}{counter}"
                counter += 1
                
            imports_to_add.append(f"import type {{ {type_name} as {alias} }} from '{path}';")
            existing_defs.add(alias)
        else:
            imports_to_add.append(f"import type {{ {type_name} }} from '{path}';")
            existing_defs.add(type_name)
            
        # Replace inline
        content = content.replace(f"import('{path}').{type_name}", alias)
        content = content.replace(f'import("{path}").{type_name}', alias)
        
    # Insert new imports below the last import statement or at top
    lines = content.split('\n')
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last_import_idx = i
            
    if last_import_idx != -1:
        lines.insert(last_import_idx + 1, '\n'.join(imports_to_add))
    else:
        lines.insert(0, '\n'.join(imports_to_add))
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
        
    print(f"Refactored {file_path}")
    return True

changed_files = 0
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if process_file(os.path.join(root, file)):
                changed_files += 1

print(f"Done. Modified {changed_files} files.")
