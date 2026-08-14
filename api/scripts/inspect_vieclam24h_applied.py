import json
import logging
import time
from playwright.sync_api import sync_playwright

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inspect_v24h")

USERNAME = "hr@square.vn"
PASSWORD = "SQlonlen@1234"

def inspect():
    captured_requests = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        )
        page = browser.new_page(viewport={"width": 1440, "height": 1600})
        
        def handle_response(response):
            url = response.url
            if any(k in url.lower() for k in ["applied", "resume", "seeker", "job", "nha-tuyen-dung"]):
                try:
                    ct = response.headers.get("content-type", "")
                    if "application/json" in ct:
                        body = response.json()
                        captured_requests.append({"url": url, "status": response.status, "body": body})
                        logger.info("Captured JSON from URL: %s", url)
                except Exception as e:
                    pass

        page.on("response", handle_response)
        
        logger.info("Navigating to login page...")
        page.goto("https://ntd.vieclam24h.vn/account/login", wait_until="networkidle", timeout=60000)
        
        # Fill login credentials
        page.fill('input[name="username"], input[type="text"], input[name="email"]', USERNAME)
        page.fill('input[name="password"], input[type="password"]', PASSWORD)
        
        # Click login button
        page.click('button[type="submit"], form button')
        page.wait_for_timeout(4000)
        
        logger.info("Current URL after login: %s", page.url)
        
        # Navigate to Applied CVs page
        applied_url = "https://ntd.vieclam24h.vn/nha-tuyen-dung/quan-tri/ntd-trang-quan-tri-ho-so-ung-tuyen.html"
        logger.info("Navigating to Applied CVs page: %s", applied_url)
        page.goto(applied_url, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(5000)
        
        logger.info("Page title: %s", page.title())
        
        # Take screenshot of applied page
        page.screenshot(path="/app/applied_cvs_screenshot.png")
        logger.info("Saved screenshot to /app/applied_cvs_screenshot.png")
        
        # Write captured JSON APIs to file
        with open("/app/captured_applied_apis.json", "w", encoding="utf-8") as f:
            json.dump(captured_requests, f, ensure_ascii=False, indent=2)
            
        logger.info("Captured %d JSON responses", len(captured_requests))
        browser.close()

if __name__ == "__main__":
    inspect()
