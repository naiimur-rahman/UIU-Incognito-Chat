import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, set, onValue, update, remove, serverTimestamp, child, get, onDisconnect } from 'firebase/database';
import { getIP, getDeviceId } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [myAvatar, setMyAvatar] = useState(localStorage.getItem('myAvatar') || null);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-mode' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const checkBan = async () => {
    const ip = await getIP();
    const deviceId = getDeviceId();
    const now = Date.now();

    const bansRef = ref(database, 'bans');

    // Check IP Ban
    if (ip) {
      const ipBanKey = ip.replace(/\./g, '_');
      const ipBanSnapshot = await get(child(bansRef, ipBanKey));
      if (ipBanSnapshot.exists()) {
        const banData = ipBanSnapshot.val();
        if (banData.bannedUntil > now) {
          return `You are banned until ${new Date(banData.bannedUntil).toLocaleTimeString()}`;
        }
      }
    }

    // Check Device Ban
    const deviceBanSnapshot = await get(child(bansRef, deviceId));
    if (deviceBanSnapshot.exists()) {
      const banData = deviceBanSnapshot.val();
      if (banData.bannedUntil > now) {
        return `You are banned until ${new Date(banData.bannedUntil).toLocaleTimeString()}`;
      }
    }

    return null;
  };

  const loginAsGuest = async (username) => {
    const banMessage = await checkBan();
    if (banMessage) throw new Error(banMessage);

    const userKey = username.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Check reservation (legacy logic support)
    const registeredRef = ref(database, `registered_users/${userKey}`);
    const registeredSnap = await get(registeredRef);
    if (registeredSnap.exists()) {
      const data = registeredSnap.val();
      if (data.reservedUntil && data.reservedUntil > Date.now()) {
        throw new Error(`The name "${username}" is reserved.`);
      }
    }

    await completeLogin(username, userKey, "guest");
  };

  const loginAsMember = async (username, password, newAvatar = null) => {
    const banMessage = await checkBan();
    if (banMessage) throw new Error(banMessage);

    const userKey = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const userRef = ref(database, `registered_users/${userKey}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.password === password) {
        // Update avatar if provided (or use existing)
        const finalAvatar = newAvatar || data.avatar || null;
        if (finalAvatar) {
            setMyAvatar(finalAvatar);
            localStorage.setItem('myAvatar', finalAvatar);
        }

        // Extend reservation
        await update(userRef, {
            reservedUntil: Date.now() + (7 * 24 * 60 * 60 * 1000),
            lastSeen: serverTimestamp(),
            ...(newAvatar ? { avatar: newAvatar } : {})
        });

        await completeLogin(username, userKey, "member");
      } else {
        throw new Error("Incorrect Password!");
      }
    } else {
      // Register New User
      const shouldRegister = confirm(`Username "${username}" not found. Create new account?`);
      if (shouldRegister) {
        const newData = {
            originalName: username,
            password: password,
            avatar: newAvatar,
            createdAt: serverTimestamp(),
            reservedUntil: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };
        await set(userRef, newData);
        if (newAvatar) {
            setMyAvatar(newAvatar);
            localStorage.setItem('myAvatar', newAvatar);
        }
        await completeLogin(username, userKey, "member");
      }
    }
  };

  const completeLogin = async (username, userKey, type) => {
    // Check if already online
    const activeRef = ref(database, `active_users/${userKey}`);
    const activeSnap = await get(activeRef);
    if (activeSnap.exists()) {
        throw new Error("User already online in another session.");
    }

    const myUUID = uuidv4();
    const deviceId = getDeviceId();
    const ip = await getIP();

    const userData = {
        username,
        userKey,
        uuid: myUUID,
        type,
        avatar: myAvatar,
        deviceId,
        ip
    };

    // Set Active User
    await set(activeRef, {
        originalName: username,
        status: "online",
        avatar: myAvatar,
        timestamp: serverTimestamp(),
        isTyping: false,
        deviceId,
        ip
    });

    // Handle Disconnect
    onDisconnect(activeRef).remove();

    setCurrentUser(userData);
  };

  const logout = async () => {
    if (currentUser) {
        const activeRef = ref(database, `active_users/${currentUser.userKey}`);
        await remove(activeRef);
    }
    setCurrentUser(null);
  };

  const banUser = async (targetIp, targetDeviceId, durationHours = 1) => {
      const bannedUntil = Date.now() + (durationHours * 60 * 60 * 1000);
      const updates = {};

      if (targetIp) {
          const ipKey = targetIp.replace(/\./g, '_');
          updates[`bans/${ipKey}`] = { bannedUntil, reason: "Violating rules" };
      }
      if (targetDeviceId) {
          updates[`bans/${targetDeviceId}`] = { bannedUntil, reason: "Violating rules" };
      }

      await update(ref(database), updates);
  };

  const value = {
    currentUser,
    loginAsGuest,
    loginAsMember,
    logout,
    theme,
    toggleTheme,
    myAvatar,
    setMyAvatar,
    banUser,
    isAdmin: currentUser?.username?.toLowerCase().includes('naimur rahman')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
