import re
import subprocess
import shutil

conf_path = r"C:\nginx\conf\nginx.conf"
bak_path = r"C:\nginx\conf\nginx.conf.bak"

# 1. Create backup
shutil.copy2(conf_path, bak_path)
print(f"Created backup at {bak_path}")

# 2. Read content
with open(conf_path, "r", encoding="utf-8") as f:
    content = f.read()

# 3. Replace CSP directives
target_old = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://unpkg.com;"
target_new = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://unpkg.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com;"

img_old = "https://cdn.jsdelivr.net;"
img_new = "https://cdn.jsdelivr.net https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com;"

conn_old = "https://*.goong.io;"
conn_new = "https://*.goong.io https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net;"

if target_old not in content:
    print("Warning: target_old not found directly. Checking for existing CSP...")
else:
    content = content.replace(target_old, target_new)
    content = content.replace(img_old, img_new)
    content = content.replace(conn_old, conn_new)

with open(conf_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Saved updated C:\\nginx\\conf\\nginx.conf")

# 4. Test Nginx config
res_test = subprocess.run([r"C:\nginx\nginx.exe", "-t", "-p", r"C:\nginx"], capture_output=True, text=True)
print("nginx -t output:")
print(res_test.stdout)
print(res_test.stderr)

if res_test.returncode == 0:
    # 5. Reload Nginx
    res_reload = subprocess.run([r"C:\nginx\nginx.exe", "-s", "reload", "-p", r"C:\nginx"], capture_output=True, text=True)
    print("nginx -s reload output:")
    print(res_reload.stdout)
    print(res_reload.stderr)
    print("Nginx reloaded successfully!")
else:
    print("Nginx syntax test failed. Restoring backup...")
    shutil.copy2(bak_path, conf_path)
