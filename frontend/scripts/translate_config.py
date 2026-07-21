import os
import re

# Match `allConfig...Dict...[...]`
PATTERN = re.compile(r'((?:\(allConfig[^)]*\)|allConfig)\??\.)([a-zA-Z]+Dict)((?:\s*as\s*any)?\??\.?\[[^\]]+\])')

def process_directory(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')) and 'tConfig.ts' not in file:
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if PATTERN.search(content):
                    new_content = PATTERN.sub(r'tConfig(\g<1>\g<2>\g<3>)', content)
                    
                    if "tConfig" in new_content and "import { tConfig }" not in new_content:
                        # compute relative path from current file to c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/utils/tConfig
                        src_dir = 'c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src'
                        utils_path = os.path.join(src_dir, 'utils')
                        rel_dir = os.path.relpath(utils_path, start=os.path.dirname(filepath))
                        rel_dir = rel_dir.replace('\\', '/')
                        if not rel_dir.startswith('.'):
                            rel_dir = './' + rel_dir
                        
                        import_stmt = f"import {{ tConfig }} from '{rel_dir}/tConfig';\n"
                        
                        import_idx = new_content.rfind('import ')
                        if import_idx != -1:
                            eol = new_content.find('\n', import_idx)
                            new_content = new_content[:eol+1] + import_stmt + new_content[eol+1:]
                        else:
                            new_content = import_stmt + new_content

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
                    count += 1
    print(f"Successfully processed {count} files.")

if __name__ == '__main__':
    process_directory('c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src')
