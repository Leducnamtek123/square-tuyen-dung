import os
import re
import glob

def extract_frontend_urls(src_dir):
    urls = []
    service_files = glob.glob(os.path.join(src_dir, 'services', '*.ts'))
    
    # Regex for strings like 'job/web/statistics/' or "auth/login"
    url_pattern = re.compile(r"['\"]([a-zA-Z0-9\-/]+/)['\"]")
    
    for file_path in service_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            matches = url_pattern.findall(content)
            for match in matches:
                # Basic filtering for likely API paths
                if '/' in match and len(match) > 3:
                     urls.append({'url': match, 'file': os.path.basename(file_path)})
    return urls

def extract_backend_urls(api_dir):
    backend_patterns = []
    # Search in all apps/*/urls.py
    url_files = glob.glob(os.path.join(api_dir, 'apps', '*', 'urls.py'))
    url_files.append(os.path.join(api_dir, 'config', 'urls.py'))
    
    # Simple regex for path('something/', ...)
    path_pattern = re.compile(r"path\(['\"]([a-zA-Z0-9\-/]+/)['\"]")
    
    for file_path in url_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            matches = path_pattern.findall(content)
            for match in matches:
                backend_patterns.append(match)
    return set(backend_patterns)

def audit():
    repo_root = os.getcwd()
    frontend_src = os.path.join(repo_root, 'frontend', 'src')
    backend_root = os.path.join(repo_root, 'api')
    
    print(f"Auditing API consistency...")
    frontend_urls = extract_frontend_urls(frontend_src)
    backend_routes = extract_backend_urls(backend_root)
    
    print(f"Found {len(frontend_urls)} potential URLs in frontend services.")
    print(f"Found {len(backend_routes)} unique routes in backend.")
    print("-" * 40)
    
    mismatches = []
    for item in frontend_urls:
        url = item['url']
        found = False
        # Check for direct match or prefix match
        for route in backend_routes:
            if url.startswith(route) or route.startswith(url):
                found = True
                break
        
        if not found:
            mismatches.append(item)
            
    if not mismatches:
        print("✅ No major URL mismatches found (prefix match).")
    else:
        print(f"⚠️ Found {len(mismatches)} potential mismatches in frontend:")
        for item in mismatches:
            print(f"  - {item['url']} (in {item['file']})")
    
    print("-" * 40)
    print("Audit complete.")

if __name__ == "__main__":
    audit()
