
import os

file_path = r'c:\Users\leduc\Documents\TuyenDungSquare\project-web-app\src\utils\transformers.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix jobName mapping
old_line = "jobName: session.job_post_name || session.job_post_dict?.jobName || session.jobPostDict?.jobName || '',"
new_line = "jobName: session.job_name || session.job_post_name || session.job_post_dict?.jobName || session.jobPostDict?.jobName || '',"

new_content = content.replace(old_line, new_line)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated transformers.js")
else:
    print("Failed to find jobName pattern in transformers.js")
