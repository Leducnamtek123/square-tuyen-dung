import os
import re

# Vietnamese character range
vn_chars = 'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ'
pattern = re.compile(f'["\']([^"\']*[ {vn_chars}][^"\']*)["\']')

root_dir = r'c:\Users\leduc\Documents\square-tuyen-dung\frontend\src'

results = {}

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = pattern.findall(content)
                    if matches:
                        results[file_path] = matches
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

with open(r'c:\Users\leduc\Documents\square-tuyen-dung\vietnamese_strings.txt', 'w', encoding='utf-8') as f:
    for path, strings in results.items():
        f.write(f"FILE: {path}\n")
        for s in strings:
            f.write(f"  - {s}\n")
        f.write("\n")

print(f"Scan complete. Found strings in {len(results)} files.")
