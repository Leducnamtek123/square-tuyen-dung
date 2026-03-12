import os
import re

def contains_vietnamese(text):
    vi_chars = "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ"
    pattern = f"[{vi_chars}]"
    return bool(re.search(pattern, text))

def find_hardcoded_vietnamese(directory):
    results = []
    for root, dirs, files in os.walk(directory):
        if 'locales' in root or 'i18n' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith(('.jsx', '.js')):
                filepath = os.path.join(root, file)
                
                # Exclude locales directory, configs, utils, assets
                if any(x in filepath for x in ['locales', 'i18n', 'configs', 'utils', 'assets', 'node_modules']):
                    continue
                    
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                    file_results = []
                    in_comment = False
                    for i, line in enumerate(lines):
                        stripped = line.strip()
                        if not stripped: continue
                        
                        if stripped.startswith('/*'):
                            in_comment = True
                        if in_comment:
                            if '*/' in stripped:
                                in_comment = False
                            continue
                        if stripped.startswith('//'):
                            continue
                            
                        # Ignore console.log
                        if 'console.log' in stripped or 'console.error' in stripped:
                            continue
                            
                        if contains_vietnamese(line):
                            file_results.append(f"L{i+1}: {stripped}")
                            
                    if file_results:
                        results.append((filepath, file_results))
                except Exception as e:
                    pass
    return results

if __name__ == "__main__":
    directory = r"c:\Users\leduc\Documents\square-tuyen-dung\frontend\src"
    res = find_hardcoded_vietnamese(directory)
    
    with open("vi_out.txt", "w", encoding="utf-8") as out:
        total_files = len(res)
        out.write(f"Found {total_files} files containing Vietnamese characters.\n\n")
        
        for filepath, lines in res:
            out.write(f"File: {os.path.relpath(filepath, directory)}\n")
            if len(lines) > 5:
                out.write(f"  {len(lines)} matches, examples:\n")
            for line in lines[:5]:
                out.write(f"  {line}\n")
            out.write("\n")
