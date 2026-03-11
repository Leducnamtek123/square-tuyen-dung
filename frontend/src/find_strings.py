import os
import re
import json

def extract_strings(directory):
    hardcoded_patterns = [
        r'label=["\'](.*?)["\']',
        r'placeholder=["\'](.*?)["\']',
        r'title=["\'](.*?)["\']',
        r'helperText=["\'](.*?)["\']',
        r'toastMessages\.(success|error|info|warning)\(["\'](.*?)["\']\)',
        r'confirmModal\(.*?, ["\'](.*?)["\']',
        r'>([^<{}]*?)<', # Text between tags
    ]
    
    results = {}
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Skip files already using useTranslation extensively or standard boilerplate
                    if 'useTranslation' in content and content.count('t(') > 5:
                        continue
                        
                    file_strings = []
                    for pattern in hardcoded_patterns:
                        matches = re.findall(pattern, content)
                        for match in matches:
                            if isinstance(match, tuple):
                                text = match[1].strip()
                            else:
                                text = match.strip()
                            
                            if text and len(text) > 2 and not text.isnumeric() and not text.startswith(('http', '/', '.', '@')):
                                if text not in file_strings:
                                    file_strings.append(text)
                    
                    if file_strings:
                        results[path] = file_strings
    
    return results

if __name__ == "__main__":
    src_dir = r"c:\Users\leduc\Documents\square-tuyen-dung\frontend\src"
    all_strings = extract_strings(src_dir)
    with open("hardcoded_strings.json", "w", encoding="utf-8") as f:
        json.dump(all_strings, f, ensure_ascii=False, indent=2)
    print(f"Found hardcoded strings in {len(all_strings)} files.")
