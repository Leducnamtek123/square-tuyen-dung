import sys

file_path = r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\apps\jobs\views\web_views.py'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'def list(self, request, *args, **kwargs):' in line and i > 440 and i < 460:
        indent = line[:line.find('def')]
        new_lines.append(f"{indent}    # 🚀 Cache check\n")
        new_lines.append(f"{indent}    from shared.helpers.redis_service import RedisService\n")
        new_lines.append(f"{indent}    redis_obj = RedisService()\n")
        new_lines.append(f"{indent}    query_str = request.GET.urlencode()\n")
        new_lines.append(f"{indent}    cache_key = f'job_list_{{hash(query_str)}}_{{request.user.id if request.user.is_authenticated else 0}}'\n")
        new_lines.append(f"{indent}    cached_res = redis_obj.get_json(cache_key)\n")
        new_lines.append(f"{indent}    if cached_res: return Response(cached_res)\n")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Updated successfully")
