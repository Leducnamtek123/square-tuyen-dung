import os
import re

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i in range(len(lines) - 1):
        line = lines[i].rstrip()
        if line.endswith('\\'):
            # Check if NEXT non-empty line has more than 0 blank lines in between
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1
            
            if j > i + 1:
                print(f"ISSUE at {filepath}:{i+1} - backslash followed by {j-i-1} blank lines")

def main():
    api_dir = 'api'
    for root, dirs, files in os.walk(api_dir):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                check_file(filepath)

if __name__ == '__main__':
    main()
