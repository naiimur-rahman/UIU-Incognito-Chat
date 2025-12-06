
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open the local file directly
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # 1. Verify Login Screen Split
        page.screenshot(path="verification/login_screen.png")
        print("Login screen captured.")

        # 2. Simulate Guest Login
        # Check if new elements exist
        try:
            page.wait_for_selector("#guest-username-input", timeout=2000)
            page.wait_for_selector("#guest-join-btn", timeout=2000)
            print("Guest Login elements found.")
        except:
            print("Guest Login elements NOT found.")

        try:
            page.wait_for_selector("#member-username-input", timeout=2000)
            page.wait_for_selector("#member-password-input", timeout=2000)
            print("Member Login elements found.")
        except:
            print("Member Login elements NOT found.")

        browser.close()

if __name__ == "__main__":
    run()
