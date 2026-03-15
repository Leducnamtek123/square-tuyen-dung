
import os
import re

file_path = r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\chatbot\services.py'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'COMPANY_INFO.get("ADDRESS"' in line:
        indent = re.match(r'^\s*', line).group(0)
        new_lines.append(f'{indent}f\'📍 Địa chỉ: {{var_sys.COMPANY_INFO.get("ADDRESS", "")}}\',\n')
    elif 'COMPANY_INFO.get("PHONE"' in line:
        indent = re.match(r'^\s*', line).group(0)
        new_lines.append(f'{indent}f\'📞 Hotline: {{var_sys.COMPANY_INFO.get("PHONE", "")}}\',\n')
    elif 'COMPANY_INFO.get("EMAIL"' in line:
        indent = re.match(r'^\s*', line).group(0)
        new_lines.append(f'{indent}f\'✉️ Email: {{var_sys.COMPANY_INFO.get("EMAIL", "")}}\',\n')
    elif 'COMPANY_INFO.get("WORK_TIME"' in line:
        indent = re.match(r'^\s*', line).group(0)
        new_lines.append(f'{indent}f\'🕒 Giờ làm việc: {{var_sys.COMPANY_INFO.get("WORK_TIME", "")}}\',\n')
    else:
        new_lines.append(line)

if new_lines != lines:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed corrupted characters in services.py successfully")
else:
    print("No changes were made. Patterns not found.")
