// --- 1. Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBx260kRaZe010DhaTxD7vPHER1ZIcQuxI",
  authDomain: "uiu-incognito-chat.firebaseapp.com",
  // This was missing before, which caused the Red Light!
  databaseURL: "https://uiu-incognito-chat-default-rtdb.firebaseio.com",
  projectId: "uiu-incognito-chat",
  storageBucket: "uiu-incognito-chat.firebasestorage.app",
  messagingSenderId: "579619680960",
  appId: "1:579619680960:web:11c11c4813eba3422cb325",
  measurementId: "G-B2RGV7N5JX"
};

// --- 2. Initialize Firebase ---
let database = null;

function initFirebase() {
    const statusDot = document.getElementById('status-indicator');

    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        // Connection Listener (Controls the Red/Green Light)
        const connectedRef = database.ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("Connected");
                if (statusDot) {
                    statusDot.className = 'status-connected';
                    statusDot.title = "Online";
                }
            } else {
                console.log("Disconnected");
                if (statusDot) {
                    statusDot.className = 'status-disconnected';
                    statusDot.title = "Offline";
                }
            }
        });

    } catch (error) {
        console.error("Firebase Error:", error);
        if (statusDot) statusDot.className = 'status-disconnected';
    }
}

// Start Firebase immediately
initFirebase();

// --- 3. DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const currentUserDisplay = document.getElementById('current-user-display');
const logoutBtn = document.getElementById('logout-btn');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// --- 4. State ---
let username = '';
const MAX_MESSAGES = 500;

// --- 5. Event Listeners ---
if (joinBtn) joinBtn.addEventListener('click', joinChat);
if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinChat();
    });
}
if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        location.reload();
    });
}

// --- 6. Functions ---

function joinChat() {
    // Check if database is ready
    if (!database) {
        alert("Connecting to server... please wait a moment.");
        return;
    }

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
        messagesRef.push({
            username: username,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        messageInput.value = '';
    }
}

function loadMessages() {
    if (!database) return;
    const messagesRef = database.ref('messages');
    
    // Listen for new messages
    messagesRef.limitToLast(MAX_MESSAGES).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            displayMessage(data.username, data.text, data.timestamp);
            scrollToBottom();
        }
    });
}

function displayMessage(user, text, timestamp) {
    const messageDiv = document.createElement('div');
    const isMyMessage = user === username;

    messageDiv.classList.add('message');
    messageDiv.classList.add(isMyMessage ? 'my-message' : 'other-message');

    let timeStr = "";
    if (timestamp) {
        const date = new Date(timestamp);
        timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

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