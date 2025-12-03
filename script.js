// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
// Note: We use try/catch to handle cases where config is invalid initially
let database;
try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
} catch (error) {
    console.error("Firebase initialization failed. Make sure to update the config object.", error);
}

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const currentUserDisplay = document.getElementById('current-user-display');
const logoutBtn = document.getElementById('logout-btn');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// State
let username = '';
const MAX_MESSAGES = 500;

// --- Event Listeners ---

// Join Chat
joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
});

// Send Message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Logout
logoutBtn.addEventListener('click', () => {
    location.reload(); // Simple reload to reset state
});

// --- Functions ---

function joinChat() {
    const name = usernameInput.value.trim();
    if (name) {
        username = name;
        loginScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        currentUserDisplay.textContent = `Logged in as: ${username}`;
        loadMessages();
    } else {
        alert("Please enter your name.");
    }
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (text && database) {
        const messagesRef = database.ref('messages');
        const newMessageRef = messagesRef.push();

        newMessageRef.set({
            username: username,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            messageInput.value = '';
            // Optional: cleanup logic could go here, but listener handles view
        }).catch(error => {
            console.error("Error sending message:", error);
            alert("Error sending message. Check console/config.");
        });
    }
}

function loadMessages() {
    if (!database) return;

    const messagesRef = database.ref('messages');

    // Load last 500 messages
    messagesRef.limitToLast(MAX_MESSAGES).on('child_added', (snapshot) => {
        const data = snapshot.val();
        displayMessage(data.username, data.text, data.timestamp);
        scrollToBottom();
    });

    // Optional: Prune old messages logic
    // This runs ONCE when loading to clean up DB if it gets too huge
    // Note: In a real "secure" app, this would be a Cloud Function.
    // Here we do a client-side "best effort" cleanup.
    messagesRef.once('value', (snapshot) => {
        const count = snapshot.numChildren();
        if (count > MAX_MESSAGES + 50) { // Buffer of 50
             const toDelete = count - MAX_MESSAGES;
             let i = 0;
             snapshot.forEach((child) => {
                 if (i < toDelete) {
                     child.ref.remove();
                 }
                 i++;
             });
        }
    });
}

function displayMessage(user, text, timestamp) {
    const messageDiv = document.createElement('div');
    const isMyMessage = user === username;

    messageDiv.classList.add('message');
    messageDiv.classList.add(isMyMessage ? 'my-message' : 'other-message');

    // Format Time
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const metaDiv = document.createElement('div');
    metaDiv.classList.add('meta');
    metaDiv.textContent = isMyMessage ? 'You' : `${user} • ${timeStr}`;

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.textContent = text;

    messageDiv.appendChild(metaDiv);
    messageDiv.appendChild(textDiv);

    messagesContainer.appendChild(messageDiv);
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
