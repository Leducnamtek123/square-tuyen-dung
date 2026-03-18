
import re

file_path = r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\apps\interviews\views.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the role logic using regex to handle potential whitespace variations
pattern = r"role = getattr\(user\.role, 'name', None\) if hasattr\(user, 'role'\) and user\.role else None"
replacement = "role = getattr(user, 'role_name', None)"

new_content = re.sub(pattern, replacement, content)

# Check if any replacement occurred
if new_content == content:
    print("No matches found with standard regex. Trying more flexible pattern.")
    # More flexible pattern for whitespace
    pattern_flex = r"role\s*=\s*getattr\(\s*user\.role\s*,\s*'name'\s*,\s*None\s*\)\s*if\s*hasattr\(\s*user\s*,\s*'role'\s*\)\s*and\s*user\.role\s*else\s*None"
    new_content = re.sub(pattern_flex, replacement, content)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated views.py")
else:
    print("Failed to find any matches to replace.")
