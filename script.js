// --- 1. Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBx260kRaZe010DhaTxD7vPHER1ZIcQuxI",
  authDomain: "uiu-incognito-chat.firebaseapp.com",
  // I added this URL so the "Red Light" error goes away
  databaseURL: "https://uiu-incognito-chat-default-rtdb.firebaseio.com",
  projectId: "uiu-incognito-chat",
  storageBucket: "uiu-incognito-chat.firebasestorage.app",
  messagingSenderId: "579619680960",
  appId: "1:579619680960:web:11c11c4813eba3422cb325",
  measurementId: "G-B2RGV7N5JX"
};

// --- 2. DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const currentUserDisplay = document.getElementById('current-user-display');
const logoutBtn = document.getElementById('logout-btn');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// --- 3. State & Initialization ---
let username = '';
let database = null;
const MAX_MESSAGES = 500;

function initFirebase() {
    const statusDot = document.getElementById('status-indicator');

    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        alert("Critical Error: Firebase SDK not loaded. Check your internet.");
        if(statusDot) statusDot.className = 'status-disconnected';
        return;
    }

    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        // Connection Status Listener (Green/Red Light)
        const connectedRef = database.ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("Connected to UIU Chat");
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
        console.error("Firebase Init Error:", error);
        alert("Firebase failed to load: " + error.message);
    }
}

// Start App
initFirebase();

// --- 4. Event Listeners ---

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
        location.reload(); // Reloads page to reset state
    });
}

// --- 5. Functions ---

function joinChat() {
    if (!database) {
        alert("Connecting to server... please wait.");
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
                alert("Permission Denied! \nDid you set your Database Rules to 'test mode'?");
            } else {
                alert("Error sending message. Check console.");
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
        if (data && data.username && data.text) {
            displayMessage(data.username, data.text, data.timestamp);
            scrollToBottom();
        }
    });

    // Cleanup logic (runs once on load)
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

    // Format Time (Safe check)
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