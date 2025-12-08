from playwright.sync_api import sync_playwright, expect

def verify_chat_features():
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        # Create a new context with a larger viewport for better screenshots
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            print("Navigating to local server...")
            page.goto("http://localhost:8080")

            # 1. Login as Guest
            print("Logging in as Guest...")
            page.fill("#guest-username-input", "VerificationUser")
            page.click("#guest-join-btn")

            # Wait for Chat Screen
            print("Waiting for chat screen...")
            page.wait_for_selector("#chat-screen:not(.hidden)", timeout=10000)

            # 2. Verify Mute Button
            print("Checking Mute Button...")
            mute_btn = page.locator("#mute-toggle-btn")
            expect(mute_btn).to_be_visible()

            # 3. Verify Inbox Button
            print("Checking Inbox Button...")
            inbox_btn = page.locator("#inbox-btn")
            expect(inbox_btn).to_be_visible()

            # 4. Verify Mentions
            print("Checking Mentions...")
            msg_input = page.locator("#message-input")
            msg_input.click()
            msg_input.type("@")

            # Wait for suggestion box
            suggestion_box = page.locator("#mention-suggestions")
            # Force visibility check or wait
            page.wait_for_selector("#mention-suggestions:not(.hidden)", timeout=3000)
            expect(suggestion_box).to_be_visible()

            # Check for @ai in suggestions (it should be the first one)
            first_item = suggestion_box.locator(".mention-item").first
            expect(first_item).to_contain_text("BhodAi")

            # Take Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_chat_features()
