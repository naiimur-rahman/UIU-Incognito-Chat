// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBx260kRaZe010DhaTxD7vPHER1ZIcQuxI",
    authDomain: "uiu-incognito-chat.firebaseapp.com",
    databaseURL: "https://uiu-incognito-chat-default-rtdb.firebaseio.com",
    projectId: "uiu-incognito-chat",
    storageBucket: "uiu-incognito-chat.firebasestorage.app",
    messagingSenderId: "579619680960",
    appId: "1:579619680960:web:11c11c4813eba3422cb325",
    measurementId: "G-B2RGV7N5JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, database, storage };
