import re

scan_results = r'c:\Users\leduc\Documents\square-tuyen-dung\scan_results.txt'
unique_strings = set()

# Regex to find strings in quotes
string_pattern = re.compile(r'["\']([^"\']*[áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ?][^"\']*)["\']')
jsx_text_pattern = re.compile(r'>([^<]*[áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ?][^<]*)<')

with open(scan_results, 'r', encoding='utf-8') as f:
    for line in f:
        # The line is in format path:line_num: content
        parts = line.split(': ', 1)
        if len(parts) < 2: continue
        content = parts[1]
        
        matches = string_pattern.findall(content)
        for m in matches:
            unique_strings.add(m.strip())
            
        matches = jsx_text_pattern.findall(content)
        for m in matches:
            if m.strip():
                unique_strings.add(m.strip())

with open(r'c:\Users\leduc\Documents\square-tuyen-dung\unique_strings.txt', 'w', encoding='utf-8') as f:
    for s in sorted(list(unique_strings)):
        f.write(s + '\n')

print(f"Extracted {len(unique_strings)} unique strings.")
