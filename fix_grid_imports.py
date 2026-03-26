import os
import re

root_dir = r"c:\Users\leduc\Documents\square-tuyen-dung-1\frontend\src"
pattern = re.compile(r'import Grid from ["\']@mui/material/Grid2["\']')
replacement = 'import { Grid2 as Grid } from "@mui/material"'

fixed_files = []

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            full_path = os.path.join(root, file)
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                if pattern.search(content):
                    new_content = pattern.sub(replacement, content)
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    fixed_files.append(full_path)
            except Exception as e:
                print(f"Error processing {full_path}: {e}")

print(f"Fixed {len(fixed_files)} files:")
for f in fixed_files:
    print(f)
