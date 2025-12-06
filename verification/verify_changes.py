from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate iPhone 12 to test mobile view and meta tag
        iphone_12 = p.devices['iPhone 12']
        context = browser.new_context(**iphone_12)
        page = context.new_page()

        # Load the local index.html
        import os
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # 1. Verify Welcome Message Style (we can't easily see the message as it requires login,
        # but we can check if the class exists in CSS or try to simulate the flow).
        # Actually, let's just check the Login UI changes first.

        # 2. Verify Mobile Login Selection
        # On iPhone 12, #mobile-login-selection should be visible
        sel = page.locator("#mobile-login-selection")
        if sel.is_visible():
            print("PASS: Mobile selection screen is visible on mobile.")
        else:
            print("FAIL: Mobile selection screen is NOT visible on mobile.")
            # Take debug screenshot
            page.screenshot(path="verification/fail_mobile_selection.png")

        # 3. Verify Theme Meta Tag (Default Light)
        meta_color = page.locator('meta[name="theme-color"]').get_attribute("content")
        print(f"Meta theme-color (Light): {meta_color}")
        if meta_color == "#ff9966":
             print("PASS: Default meta theme-color is correct.")
        else:
             print("FAIL: Default meta theme-color is incorrect.")

        # 4. Verify Interaction: Click "Guest Login"
        page.locator(".mobile-select-btn").first.click() # Guest is first

        # Now #mobile-login-selection should be hidden, and #panel-guest visible
        if not sel.is_visible() and page.locator("#panel-guest").is_visible():
            print("PASS: Guest panel shown after click.")
        else:
            print("FAIL: Interaction to show Guest panel failed.")

        # 5. Verify Back Button
        page.locator("#panel-guest .back-to-select-btn").click()
        if sel.is_visible() and not page.locator("#panel-guest").is_visible():
             print("PASS: Back button works.")
        else:
             print("FAIL: Back button failed.")

        # 6. Verify Dark Mode Toggle and Meta Tag
        # Click the theme toggle on login screen
        page.locator("#theme-toggle-login").click()
        page.wait_for_timeout(500) # Wait for transition

        meta_color_dark = page.locator('meta[name="theme-color"]').get_attribute("content")
        print(f"Meta theme-color (Dark): {meta_color_dark}")
        if meta_color_dark == "#0f0c29":
             print("PASS: Dark mode meta theme-color is correct.")
        else:
             print("FAIL: Dark mode meta theme-color is incorrect.")

        # Screenshot of Dark Mode Mobile Selection
        page.screenshot(path="verification/mobile_dark_selection.png")
        print("Screenshot saved to verification/mobile_dark_selection.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
