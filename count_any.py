import subprocess
import os

def count_any():
    out = subprocess.check_output(['git', 'grep', '-c', r'\bany\b', 'frontend/src']).decode()
    parsed = []
    for line in out.strip().split('\n'):
        if ':' in line:
            parts = line.split(':')
            parsed.append((parts[0], int(parts[1])))
            
    parsed.sort(key=lambda x: x[1], reverse=True)
    
    total = sum(x[1] for x in parsed)
    print(f"Total occurrences of 'any': {total}")
    print("\nTop 30 files with most 'any':")
    for k, v in parsed[:30]:
        print(f"{v:4} - {k}")

if __name__ == '__main__':
    count_any()
