import os
import re

dir_to_scan = r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src'
extensions = ('.js', '.jsx', '.ts', '.tsx')

# Regex for Vietnamese characters and corrupted characters (like ? in words)
vn_chars = 'áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ'
vn_chars_upper = vn_chars.upper()
all_vn = vn_chars + vn_chars_upper

# Corrupted pattern: a letter followed by ? then a letter, or multi-?
# For example: B?n, l?u, ?ng
corrupted_pattern = re.compile(r'[a-zA-Z]*\?[a-zA-Z\?]*')
vn_pattern = re.compile(f'[{all_vn}]')

results = []

for root, dirs, files in os.walk(dir_to_scan):
    for file in files:
        if file.endswith(extensions):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    found_corrupted = corrupted_pattern.findall(content)
                    # Filter found_corrupted to only those that look like words (not just ternary ?)
                    # Actually, better to look for ? in the middle of a string.
                    # Let's use string-based search
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        # Search for ? inside quotes or between letters
                        if '?' in line:
                            # Simple heuristic: if '?' is not followed by ':' (ternary) or ' ' or '.' or end of line
                            # or if it's inside a string
                            if re.search(r'["\'][^"\']*?\?[^"\']*?["\']', line) or re.search(r'[a-zA-Z]\?[a-zA-Z]', line):
                                results.append(f"{path}:{i+1}: {line.strip()}")
                        elif vn_pattern.search(line):
                            results.append(f"{path}:{i+1}: {line.strip()}")
            except Exception as e:
                # results.append(f"Error reading {path}: {e}")
                pass

with open(r'c:\Users\leduc\Documents\square-tuyen-dung\scan_results.txt', 'w', encoding='utf-8') as f:
    for res in results:
        f.write(res + '\n')

print(f"Scan complete. Found {len(results)} occurrences.")
