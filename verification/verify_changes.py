from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            viewport={'width': 375, 'height': 812},
            is_mobile=True,
            has_touch=True
        )

        # Load the local index.html file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # On mobile, we first see selection screen. Click Guest Login.
        # The first mobile-select-btn is Guest Login
        page.locator(".mobile-select-btn").first.click()

        # Now input should be visible
        page.wait_for_selector("#guest-username-input", state="visible")

        page.fill("#guest-username-input", "TestUser")
        page.click("#guest-join-btn")

        # Wait for chat screen
        page.wait_for_selector("#chat-screen", state="visible")

        # 1. Verify "Remove Photo" button exists in Avatar Modal
        # Open Avatar Modal by clicking header avatar
        page.click(".header-info .avatar")

        # Check if Remove Photo button is visible
        page.wait_for_selector("#remove-avatar-btn", state="visible")

        # Take screenshot of Avatar Modal
        page.screenshot(path="verification/avatar_modal.png")
        print("Avatar Modal screenshot taken.")

        # Close modal
        page.click("#close-avatar-modal")

        # 2. Verify Typing hides Image button but keeps Emoji button
        # Type in input
        page.fill("#message-input", "Hello")

        # Wait for typing class
        page.wait_for_selector(".input-wrapper.typing")

        # Take screenshot of Input Area while typing
        page.screenshot(path="verification/typing_input.png")
        print("Typing Input screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
