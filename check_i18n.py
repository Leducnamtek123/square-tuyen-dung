import os
import re
import json

def find_hardcoded_strings(directories):
    # Regex to find text between tags: >Text<
    # Regex to find props: label="Text", placeholder="Text", etc.
    patterns = [
        # (pattern, group_index, description)
        (r'>([^<{}\[\]\n]*[a-zA-Zàáảãạăắằẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ][^<{}\(]*?)<', 0, "JSX Text"),
        (r'label=["\'](.*?)["\']', 1, "label prop"),
        (r'placeholder=["\'](.*?)["\']', 1, "placeholder prop"),
        (r'title=["\'](.*?)["\']', 1, "title prop"),
        (r'helperText=["\'](.*?)["\']', 1, "helperText prop"),
        (r'text=["\'](.*?)["\']', 1, "text prop"),
    ]
    
    results = {}
    
    for directory in directories:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(('.jsx', '.js')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                            # Skip if file seems to be mostly translated already
                            # But we want to be thorough, so maybe don't skip entirely
                            # Instead, we'll check if the match is wrapped in t()
                            
                            file_findings = []
                            for pattern, group, desc in patterns:
                                matches = re.finditer(pattern, content)
                                for match in matches:
                                    text = match.group(group).strip()
                                    if group == 0: # JSX text might have > and <
                                        text = text.lstrip('>').rstrip('<').strip()
                                    
                                    # Basic filters
                                    if not text or len(text) < 2: continue
                                    if text.isnumeric(): continue
                                    if text.startswith(('http', '/', '.', '@', 'icon-', '{', '}', '[', ']')): continue
                                    
                                    # Check if the surrounding context has t(
                                    # This is a bit naive but helps
                                    start = match.start()
                                    context = content[max(0, start-10):start]
                                    if 't(' in context: continue
                                    
                                    # If it's JSX text, check if it's inside a {t('...')}
                                    # (This is harder with regex but we can look for { and } )
                                    
                                    if text not in [f['text'] for f in file_findings]:
                                        file_findings.append({"text": text, "type": desc, "line": content.count('\n', 0, match.start()) + 1})
                            
                            if file_findings:
                                results[path] = file_findings
                    except Exception as e:
                        print(f"Error reading {path}: {e}")
    
    return results

if __name__ == "__main__":
    base_path = r"c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\pages"
    target_dirs = [
        os.path.join(base_path, "adminPages"),
        os.path.join(base_path, "employerPages"),
        os.path.join(base_path, "jobSeekerPages"),
        os.path.join(base_path, "candidatePages"),
        r"c:\Users\leduc\Documents\square-tuyen-dung\frontend\src\components"
    ]
    
    findings = find_hardcoded_strings(target_dirs)
    
    with os.fdopen(os.open("i18n_scan_results.json", os.O_WRONLY | os.O_CREAT | os.O_TRUNC), 'w', encoding='utf-8') as f:
        json.dump(findings, f, ensure_ascii=False, indent=2)
    
    print(f"Scanned {len(target_dirs)} directories and found potential issues in {len(findings)} files.")
