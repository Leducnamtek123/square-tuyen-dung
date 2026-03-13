import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern: a line ending with \ (and maybe spaces), followed by one or more blank lines, 
    # then a line starting with some spaces and a dot or something else that was being continued.
    # We'll just remove blank lines that occur immediately after a backslash.
    
    # This regex finds a backslash at the end of a line, then one or more empty/whitespace-only lines
    new_content = re.sub(r'\\\s*\n\s*\n+', r'\\\n', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    api_dir = 'api'
    fixed_count = 0
    for root, dirs, files in os.walk(api_dir):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    print(f"Fixed: {filepath}")
                    fixed_count += 1
    print(f"Total files fixed: {fixed_count}")

if __name__ == '__main__':
    main()
