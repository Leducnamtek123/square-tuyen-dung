
import os

file_path = r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\chatbot\services.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the specific lines
replacements = {
    'ðŸ ™ï¸  Ä á»‹a chá»‰:': '📍 Địa chỉ:',
    'â˜Žï¸  Hotline:': '📞 Hotline:',
    'âœ‰ï¸  Email:': '✉️ Email:',
    'â ° Giá»  lÃ m viá»‡c:': '🕒 Giờ làm việc:',
}

new_content = content
for old, new in replacements.items():
    new_content = new_content.replace(old, new)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed corrupted characters in services.py")
else:
    print("No changes made. Check if the patterns match.")
