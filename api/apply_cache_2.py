import sys

file_path = r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\apps\jobs\views\web_views.py'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'return self.get_paginated_response(serializer.data)' in line and i > 470 and i < 490:
        indent = line[:line.find('return')]
        new_lines.append(f"{indent}paginated_response = self.get_paginated_response(serializer.data)\n")
        new_lines.append(f"{indent}redis_obj.set_json(cache_key, paginated_response.data, 300)\n")
        new_lines.append(f"{indent}return paginated_response\n")
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Updated part 2 successfully")
