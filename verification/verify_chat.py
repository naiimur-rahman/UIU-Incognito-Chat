
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # Manually reveal chat screen and hide login
        page.evaluate("document.getElementById(\"login-screen\").classList.add(\"hidden\")")
        page.evaluate("document.getElementById(\"chat-screen\").classList.remove(\"hidden\")")

        # Inject Mock Messages
        # 1. Bot Message (Lavender)
        page.evaluate("""
            const container = document.getElementById("messages-container");
            const wrapper = document.createElement("div");
            wrapper.className = "message-wrapper";
            wrapper.innerHTML = `
                <div class="message-row">
                    <div class="msg-avatar">🤖</div>
                    <div class="msg-content">
                        <div class="message other-message ai-message">
                            <div class="msg-header-inside">BhodAi 🤖 • 12:00</div>
                            <div class="text">Hello I am a Lavender Bot!</div>
                        </div>
                    </div>
                </div>`;
            container.appendChild(wrapper);
        """)

        # 2. Admin Deleted Message (Grey Bubble)
        page.evaluate("""
            const container = document.getElementById("messages-container");
            const wrapper2 = document.createElement("div");
            wrapper2.className = "message-wrapper";
            wrapper2.innerHTML = `
                <div class="message-row">
                    <div class="msg-content">
                        <div class="message deleted-state">
                            <div class="text">🚫 Admin deleted message</div>
                        </div>
                    </div>
                </div>`;
            container.appendChild(wrapper2);
        """)

        page.screenshot(path="verification/chat_styles.png")
        print("Chat styles captured.")
        browser.close()

if __name__ == "__main__":
    run()
