## 🚀 Setup Instructions

To get this chat app working, you need to link it to a free Firebase database. Follow these steps carefully:

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and log in with your Google account.
2. Click **"Add project"** or **"Create a project"**.
3. Name it (e.g., `uiu-chat`) and follow the steps (you can disable Google Analytics for simplicity).
4. Once created, click **"Continue"**.

### Step 2: Create a Realtime Database
1. In the left sidebar of your project dashboard, click **"Build"** -> **"Realtime Database"**.
2. Click **"Create Database"**.
3. Choose a location (e.g., United States) and click **Next**.
4. **Important:** Select **"Start in test mode"**. This allows anyone with the code to read/write without complex authentication setups initially.
   - *Note: Test mode rules expire after 30 days. For long-term use, you will need to update the Rules tab to `".read": true, ".write": true` (Use with caution as this is public).*

### Step 3: Get Configuration Keys
1. Click the **Project Settings** gear icon (top left, next to "Project Overview").
2. Scroll down to the **"Your apps"** section.
3. Click the **Web icon `</>`** to create a web app.
4. Give it a name (e.g., "Web Chat") and click **"Register app"**.
5. You will see a code block with `const firebaseConfig = { ... };`.

### Step 4: Add Keys to Your Code
1. Copy the content inside the `firebaseConfig` object from the Firebase console. It looks like this:
   ```javascript
   apiKey: "AIzaSy...",
   authDomain: "...",
   databaseURL: "...",
   projectId: "...",
   // ... etc
   ```
2. Open the `script.js` file in this repository.
3. Replace the placeholder values at the top of the file with your actual keys.

### Step 5: Deploy to GitHub Pages
1. Go to your GitHub repository settings.
2. Click **"Pages"** in the sidebar.
3. Under "Source", select **"Deploy from a branch"**.
4. Select `main` (or `master`) branch and `/ (root)` folder.
5. Click **Save**.
6. Wait a minute, and GitHub will give you a link to your live site!

## ⚠️ Notes
- **Message Limit:** The chat is designed to show the last 500 messages.
- **Privacy:** Since this is a public chat without password authentication, anyone with the link can join.
