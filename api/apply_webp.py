import sys

file_path = r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\shared\helpers\cloudinary_service.py'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
imported_pil = False
added_process = False

for i, line in enumerate(lines):
    # Add Pillow import
    if 'import httpx' in line and not imported_pil:
        new_lines.append("from PIL import Image\n")
        imported_pil = True
    
    # Add _process_image method inside class
    if 'class CloudinaryService:' in line and not added_process:
        new_lines.append(line)
        new_lines.append("    @staticmethod\n")
        new_lines.append("    def _process_image(file_obj):\n")
        new_lines.append("        try:\n")
        new_lines.append("            img = Image.open(file_obj)\n")
        new_lines.append("            if img.mode in ('RGBA', 'P'):\n")
        new_lines.append("                img = img.convert('RGB')\n")
        new_lines.append("            MAX_SIZE = (1200, 1200)\n")
        new_lines.append("            img.thumbnail(MAX_SIZE, Image.LANCZOS)\n")
        new_lines.append("            output = io.BytesIO()\n")
        new_lines.append("            img.save(output, format='WEBP', quality=85, method=6)\n")
        new_lines.append("            output.seek(0)\n")
        new_lines.append("            return output, output.getbuffer().nbytes, 'image/webp', 'webp'\n")
        new_lines.append("        except Exception: return None, None, None, None\n\n")
        added_process = True
        continue
        
    # Inject processing into upload_image
    if 'ext, resource_type = CloudinaryService._detect_format_and_type(filename, content_type)' in line:
        new_lines.append(line)
        new_lines.append("            # 🎨 Auto-Optimization for Images\n")
        new_lines.append("            if resource_type == 'image' and ext.lower() not in ['gif', 'svg']:\n")
        new_lines.append("                opt_file, opt_size, opt_ct, opt_ext = CloudinaryService._process_image(file_obj)\n")
        new_lines.append("                if opt_file:\n")
        new_lines.append("                    file_obj, size, content_type, ext = opt_file, opt_size, opt_ct, opt_ext\n")
        continue

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Updated CloudinaryService with WebP optimization successfully")
