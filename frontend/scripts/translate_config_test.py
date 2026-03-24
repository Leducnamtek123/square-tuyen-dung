import os
import re

# We will match anything that looks like allConfig.somethingDict[...]
# allowing for optional chaining `?.`, parens `(...)`, and `as any` casting.
PATTERN = re.compile(r'(\(allConfig[^)]*\)\??\.|allConfig\??\.)([a-zA-Z]+Dict)(?:\s*as\s*any)?\??\.?\[([^\]]+)\]')

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                if 'tConfig.ts' in filepath:
                    continue
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                matches = PATTERN.findall(content)
                if matches:
                    print(f"\n--- MATCHES IN {filepath} ---")
                    for m in matches:
                        original = f"{m[0]}{m[1]}...[{m[2]}]" # simplified for display
                        print(f"  FOUND: {original}")

if __name__ == '__main__':
    process_directory('c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src')
