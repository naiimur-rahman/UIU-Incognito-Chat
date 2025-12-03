// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx260kRaZe010DhaTxD7vPHER1ZIcQuxI",
  authDomain: "uiu-incognito-chat.firebaseapp.com",
  projectId: "uiu-incognito-chat",
  storageBucket: "uiu-incognito-chat.firebasestorage.app",
  messagingSenderId: "579619680960",
  appId: "1:579619680960:web:11c11c4813eba3422cb325",
  measurementId: "G-B2RGV7N5JX"
};

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
let database = null;
const MAX_MESSAGES = 500;

// Initialize Firebase
function initFirebase() {
    const statusDot = document.getElementById('status-indicator');

    // 1. Check for placeholders
    if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.databaseURL.includes("YOUR_PROJECT_ID")) {
        alert("CRITICAL ERROR:\n\nYou have not updated the 'firebaseConfig' in script.js!\n\nPlease open script.js and replace the placeholder keys with your actual Firebase details from the console.");
        statusDot.className = 'status-disconnected';
        return;
    }

    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        // Test connection
        const connectedRef = database.ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("Firebase Connected!");
                statusDot.className = 'status-connected';
                statusDot.title = "Connected to Firebase";
            } else {
                console.log("Firebase Disconnected/Connecting...");
                statusDot.className = 'status-disconnected';
                statusDot.title = "Disconnected";
            }
        });

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        alert("Firebase failed to load. See console for details.");
    }
}

// Run Init
initFirebase();

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
    location.reload();
});

// --- Functions ---

function joinChat() {
    if (!database) {
        alert("Cannot join: Firebase is not connected. Did you update the config?");
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

    if (!database) {
        alert("Error: Database not connected.");
        return;
    }

    if (text) {
        const messagesRef = database.ref('messages');
        const newMessageRef = messagesRef.push();

        newMessageRef.set({
            username: username,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            messageInput.value = '';
        }).catch(error => {
            console.error("Error sending message:", error);
            if (error.code === "PERMISSION_DENIED") {
                alert("Permission Denied! \nDid you set your Database Rules to 'test mode' (public)?");
            } else {
                alert("Error sending message: " + error.message);
            }
        });
    }
}

function loadMessages() {
    if (!database) return;

    const messagesRef = database.ref('messages');

    // Load last 500 messages
    messagesRef.limitToLast(MAX_MESSAGES).on('child_added', (snapshot) => {
        const data = snapshot.val();
        // Handle potential null/bad data
        if (data && data.username && data.text) {
            displayMessage(data.username, data.text, data.timestamp);
            scrollToBottom();
        }
    });

    // Cleanup logic (runs once)
    messagesRef.once('value', (snapshot) => {
        const count = snapshot.numChildren();
        if (count > MAX_MESSAGES + 50) {
             const toDelete = count - MAX_MESSAGES;
             let i = 0;
             snapshot.forEach((child) => {
                 if (i < toDelete) {
                     child.ref.remove().catch(err => console.log("Cleanup error", err));
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
