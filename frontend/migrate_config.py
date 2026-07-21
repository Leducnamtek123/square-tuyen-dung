import os
import re

FRONTEND_DIR = r"c:\Users\leduc\Documents\square-tuyen-dung-1\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match the Redux hook usage
    pattern = re.compile(r'const\s+\{\s*allConfig\s*\}\s*=\s*useAppSelector\(\s*\(\s*state\s*\)\s*=>\s*state\.config\s*\)\s*;')

    if not pattern.search(content):
        return  # No match, ignore file

    # Replace with useConfig hook
    new_content = pattern.sub('const { allConfig } = useConfig();', content)

    # Add import statement if not already there
    import_stmt = "import { useConfig } from '@/hooks/useConfig';\n"
    if 'import { useConfig }' not in new_content:
        # insert after the last import, or at the top
        last_import_pos = new_content.rfind('import ')
        if last_import_pos != -1:
            end_of_line = new_content.find('\n', last_import_pos)
            new_content = new_content[:end_of_line+1] + import_stmt + new_content[end_of_line+1:]
        else:
            new_content = import_stmt + new_content

    # Optional: cleanup unused useAppSelector import if it was only used for this
    # but we'll leave it since TS will complain and we can fix it later, or it might be used for other slices.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated: {filepath}")

def main():
    skip_dirs = ['__tests__', 'redux', 'utils', 'types']
    count = 0
    for root, dirs, files in os.walk(FRONTEND_DIR):
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith('.')]
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                process_file(filepath)
                count += 1
    print(f"Scanned {count} files.")

if __name__ == '__main__':
    main()
