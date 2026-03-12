import os
import re

def find_missing_i18n(directory):
    results = []
    
    # Regex to find text between JSX tags, e.g., >Hello World<
    # This is a simple heuristic and might catch some false positives, but it's good for finding candidates.
    jsx_text_pattern = re.compile(r'>\s*([A-Za-z][A-Za-z0-9\s\.,!\?]+)\s*<')
    
    # Regex to find common props with hardcoded English strings
    prop_pattern = re.compile(r'(label|title|placeholder|text|emptyMessage)=["\']([A-Za-z][A-Za-z0-9\s\.,!\?]+)["\']')

    for root, dirs, files in os.walk(directory):
        if 'locales' in root or 'i18n' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                
                if any(x in filepath for x in ['locales', 'i18n', 'configs', 'utils', 'assets', 'node_modules']):
                    continue
                    
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Skip files that already use translation
                    # Or maybe just flag the hardcoded strings even if they use translation elsewhere
                    if 'useTranslation' in content:
                        has_translation = True
                    else:
                        has_translation = False
                        
                    # Find matches
                    text_matches = jsx_text_pattern.findall(content)
                    prop_matches = prop_pattern.findall(content)
                    
                    # Filter out short or likely programmatic strings
                    valid_texts = [m.strip() for m in text_matches if len(m.strip()) > 3 and not m.strip().isupper()]
                    valid_props = [m[1].strip() for m in prop_matches if len(m[1].strip()) > 3 and not m[1].strip().isupper()]
                    
                    all_matches = valid_texts + valid_props
                    
                    if all_matches:
                        # Only show top 5 unique to avoid spam
                        unique_matches = list(set(all_matches))
                        results.append({
                            'file': os.path.relpath(filepath, directory),
                            'has_translation': has_translation,
                            'matches': unique_matches[:10]
                        })
                except Exception as e:
                    pass
    return results

if __name__ == "__main__":
    directory = r"c:\Users\leduc\Documents\square-tuyen-dung\frontend\src"
    res = find_missing_i18n(directory)
    
    # Sort: files without useTranslation first, then by number of matches
    res.sort(key=lambda x: (x['has_translation'], -len(x['matches'])))
    
    with open("en_out.txt", "w", encoding="utf-8") as out:
        out.write(f"Found {len(res)} JSX files with potential hardcoded English text.\n\n")
        
        for item in res:
            status = "Has useTranslation (but missed some)" if item['has_translation'] else "NO useTranslation"
            out.write(f"--- File: {item['file']} [{status}] ---\n")
            for m in item['matches']:
                out.write(f"  - {m}\n")
            out.write("\n")
