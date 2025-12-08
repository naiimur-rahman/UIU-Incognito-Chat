import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { database } from '../lib/firebase';
import { ref, onChildAdded, onChildChanged, push, serverTimestamp, update, remove, query, limitToLast, onValue, set } from 'firebase/database';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { formatTime } from '../lib/utils';
import { Pin, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const { currentUser, banUser, isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- 1. Load Initial Data ---
  useEffect(() => {
    // Active Users Count
    const activeRef = ref(database, 'active_users');
    const unsubscribeActive = onValue(activeRef, (snapshot) => {
      setActiveCount(snapshot.exists() ? snapshot.numChildren() : 0);
    });

    // Pinned Message
    const pinnedRef = ref(database, 'pinned_message');
    const unsubscribePinned = onValue(pinnedRef, (snapshot) => {
        setPinnedMessage(snapshot.val());
    });

    // Messages (Limit last 60)
    const messagesRef = query(ref(database, 'messages'), limitToLast(60));

    const handleChildAdded = (snapshot) => {
        const data = snapshot.val();
        setMessages(prev => {
            if (prev.find(m => m.id === snapshot.key)) return prev;
            return [...prev, { id: snapshot.key, ...data }];
        });
    };

    const handleChildChanged = (snapshot) => {
        const data = snapshot.val();
        setMessages(prev => prev.map(m => m.id === snapshot.key ? { id: snapshot.key, ...data } : m));
    };

    const unsubscribeAdded = onChildAdded(messagesRef, handleChildAdded);
    const unsubscribeChanged = onChildChanged(messagesRef, handleChildChanged);

    return () => {
        unsubscribeActive();
        unsubscribePinned();
        unsubscribeAdded();
        unsubscribeChanged();
    };
  }, []);

  // --- 2. Actions ---
  const scrollToBottom = () => {
    setIsAtBottom(true);
    // Actually scrolling is handled inside MessageList via ref or props.
    // We'll pass a signal or Ref. But simpler:
    const container = document.getElementById('messages-container');
    if(container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  };

  const sendMessage = async (text, isTemp = false, imageURL = null, triggerAI = false) => {
     if(isTemp) return; // Placeholder logic skipped for simplicity

     const isAiRequest = triggerAI || text?.toLowerCase().startsWith('@ai') || (replyingTo?.username === 'BhodAi 🤖');

     const newMsg = {
         username: currentUser.username,
         senderId: currentUser.uuid, // Using UUID from context
         avatar: currentUser.avatar,
         text: text,
         imageURL: imageURL,
         timestamp: serverTimestamp(),
         isDeleted: false,
         replyTo: replyingTo ? { id: replyingTo.id, username: replyingTo.username, text: replyingTo.text } : null
     };

     await push(ref(database, 'messages'), newMsg);
     setReplyingTo(null);
     scrollToBottom();

     if (isAiRequest && text) {
         // Call Gemini logic here.
         // Since it was inline in index.html, we need to port `askGemini`.
         // For brevity, I'll implement a simplified version or the full one.
         askGemini(text);
     }
  };

  const handleTyping = (isTyping) => {
     const userRef = ref(database, `active_users/${currentUser.userKey}`);
     update(userRef, { isTyping });

     if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
     typingTimeoutRef.current = setTimeout(() => {
         update(userRef, { isTyping: false });
     }, 3000);
  };

  const handleBan = async (msg) => {
      // We need to fetch the user's IP/DeviceID from `active_users` or if we stored it in message.
      // Current message structure in `sendMessage` DOES NOT store IP/DeviceID.
      // WE NEED TO FIX `sendMessage` to include them?
      // OR look up the user in `active_users` (if they are still online).
      // OR store them in the message hidden metadata.

      // OPTION 1: Look up active session (Only works if user is online)
      // OPTION 2: Store minimal metadata in message (Best for offline bans)

      // Let's modify `sendMessage` to include `deviceId` and `ip` (hidden from UI, but in DB).
      // Wait, I can't modify old messages.
      // I will implement lookup first.

      if (!confirm(`Ban ${msg.username} for 1 hour?`)) return;

      // Find user in active_users by matching senderId (uuid) or username
      // Since `senderId` is UUID, we can try to find an active user with that UUID.
      // But `active_users` keys are based on username.
      // Let's iterate active_users (snapshot is needed).
      // For this, we'll do a one-time fetch.

      try {
          // Warning: Inefficient for large users, but we have few.
          const activeSnap = await new Promise(resolve => onValue(ref(database, 'active_users'), resolve, { onlyOnce: true }));
          let foundUser = null;

          if(activeSnap.exists()) {
             activeSnap.forEach(child => {
                 if(child.val().uuid === msg.senderId) foundUser = child.val();
             });
          }

          if (foundUser) {
              await banUser(foundUser.ip, foundUser.deviceId, 1);
              alert(`Banned ${msg.username}.`);
          } else {
              alert("User not found online. Cannot ban (IP/Device missing from message history).");
              // Future improvement: Store IP/Device in message node.
          }
      } catch (e) {
          console.error(e);
          alert("Error banning user.");
      }
  };

  const handleDelete = async (msgId) => {
      if(!isAdmin) return;
      if(confirm("Delete this message?")) {
          await update(ref(database, `messages/${msgId}`), {
              isDeleted: true,
              text: "🚫 Admin deleted message",
              imageURL: null,
              replyTo: null,
              username: "Unknown",
              avatar: null
          });
      }
  };

  const handlePin = async (msg) => {
      if(!isAdmin) return;
      if(confirm("Pin this message?")) {
          await set(ref(database, 'pinned_message'), {
              id: msg.id,
              text: msg.text,
              author: msg.username,
              timestamp: serverTimestamp()
          });
      }
  };

  const handleUnpin = async () => {
      if(!isAdmin) return;
      if(confirm("Unpin message?")) {
          await remove(ref(database, 'pinned_message'));
      }
  };

  // --- Gemini Port ---
  const API_KEY_PARTS = [
    ["AIzaSyC_WOMJ9J_", "mRxWFmGGHyVbR8D8fh72r7d8"],
    ["AIzaSyDSStQu9xs-", "kHkEK1QeT96ONTq4d9kdDp0"],
    ["AIzaSyA__0c2WDC7_", "xeSDWrF5VFLxZCJeiMv4sE"],
    ["AIzaSyAPmYu6PCEy", "pKBI3QGClVH4EQM_XqZAK7c"],
    ["AIzaSyDoVxvtxCGPA", "kr_rTJbLmrmGL3J6u3R9F0"],
    ["AIzaSyCIj8vAM_u7", "UlmV0DkkhOqdDJ1td7sHT5o"],
    ["AIzaSyCgRFOmpCSw", "Jut8YUL-MSqQkN5x39BzegA"],
    ["AIzaSyDdw4sgr9An", "PF1q44FA6qtxUDqcpuMRaNI"],
    ["AIzaSyCOzbUrQFNh", "mbWyCgnMl6RXEjuPyoD7qCI"],
    ["AIzaSyBrlbSS-txX", "lTbzaM0Gde_lIriNpQdThms"]
  ];

  const askGemini = async (queryText) => {
    const BOT_ID = "ai-system-bot-v1";

    let chatHistory = "Recent Chat Context:\n";
    // We can use the 'messages' state directly
    const lastMessages = messages.slice(-10);
    lastMessages.forEach(msg => {
        if(msg.text && !msg.isDeleted) {
            chatHistory += `${msg.username}: ${msg.text}\n`;
        }
    });

    const systemInstruction = `
    Identity: You are 'BhodAi', a witty, a Sarcastic Bangladeshi student. You are a Muslim.

    Current Task: Reply to the "Current User Query" based on the "Recent Chat Context".

    CRITICAL RULES (Strictness Level: MAX):
    1. NEVER repeat the same phrase or roast twice.
    2. Keep replies SHORT (Max 30 words).
    3. Language: Mix of Bangla (English script) and English. Use emojis.
    4. Don't repeat "UIU" again and again.
    5. Use InshaAllah, Alhamdulillah very rarely (only if context strictly requires it).
    6. Specific Triggers:
        - University -> tell about UIU struggle.
        - Love/Relationship -> Roast about being single/engineering student fate.
        - Money/Treat -> When topic about money/friends treat only then, act like have no money.

    EXCEPTIONS:
    - Serious/Sad -> Don't bully, be supportive.
    - Creator -> Naimur Rahman (CSE 242, UIU).
    - If topic is about cgpa/gpa down -> Tell about Naimur Rahman's CGPA Calculator.
        Features-> Calculate trimester GPA and updated CGPA using your course list and grades.
                   Recalculate results for retaken courses by entering old and new grades.
                   Use a Target CGPA Planner to see what GPA you need next trimester to reach a goal CGPA.
                   Track course marks through a Course Grade Calculator.
                   Monitor your completed and remaining credits with a built-in Credit Tracker.

    ${chatHistory}

    Current User Query: ${queryText}
    Your Reply (Be unique, savage, Islamic witty):`;

    let aiResponse = "Matha hang korse mama... Server limit sesh! 😵‍💫 Naimur vai ke janan.";
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = API_KEY_PARTS.length;

    // We can't easily persist rotation index across component re-renders unless in a ref or local storage.
    // Let's use a random start index or a stored index to distribute load.
    let currentKeyIndex = parseInt(localStorage.getItem('gemini_key_index') || '0');

    while (attempts < MAX_ATTEMPTS && !success) {
        try {
            const currentKey = API_KEY_PARTS[currentKeyIndex].join("");
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemInstruction }] }] })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn(`Key #${currentKeyIndex} limit over. Switching...`);
                    currentKeyIndex = (currentKeyIndex + 1) % MAX_ATTEMPTS;
                    localStorage.setItem('gemini_key_index', currentKeyIndex);
                    attempts++; continue;
                } else { break; }
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                aiResponse = data.candidates[0].content.parts[0].text;
                success = true;
            } else {
                attempts++;
                currentKeyIndex = (currentKeyIndex + 1) % MAX_ATTEMPTS;
            }
        } catch (error) {
            console.error("Network Error, trying next key:", error);
            currentKeyIndex = (currentKeyIndex + 1) % MAX_ATTEMPTS;
            attempts++;
        }
    }

    await push(ref(database, 'messages'), {
        username: "BhodAi 🤖", text: aiResponse, senderId: BOT_ID,
        timestamp: serverTimestamp(), isDeleted: false
    });
  };

  return (
    <div className="h-full w-full flex flex-col relative animate-fade-in">
        <ChatHeader activeCount={activeCount} />

        {/* Pinned Banner */}
        {pinnedMessage && (
            <div
                className="bg-[rgba(255,245,230,0.95)] dark:bg-[rgba(45,45,58,0.95)] backdrop-blur-md border-b border-white/60 dark:border-white/10 px-4 py-1.5 flex justify-between items-center shadow-sm z-10 cursor-pointer animate-float-up"
                onClick={() => {
                    const el = document.getElementById(`msg-${pinnedMessage.id}`);
                    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
            >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0">
                        <Pin size={14} className="rotate-45" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wider">Pinned Message</span>
                        <span className="text-sm truncate text-text-color dark:text-white">
                            <span className="font-semibold">{pinnedMessage.author}:</span> {pinnedMessage.text}
                        </span>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); handleUnpin(); }} className="text-gray-500 hover:text-red-500 p-1">
                        <X size={16} />
                    </button>
                )}
            </div>
        )}

        {/* Welcome Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-[85%] pointer-events-none z-0 opacity-70">
             <div className="mb-3 opacity-60 text-gray-500 dark:text-gray-400">
                 <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
             </div>
             <p className="text-base font-medium text-gray-500 dark:text-gray-400 opacity-80">Be kind, stay curious.</p>
             <p className="text-xs mt-2 opacity-60 text-gray-500 dark:text-gray-400">
                Click <b>🤖 Bot Icon</b> for AI Help.<br/>Swipe Right ➡️ to Reply.
             </p>
        </div>

        <MessageList
            messages={messages}
            isAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
            onReply={setReplyingTo}
            onPin={handlePin}
            onBan={handleBan}
            onDelete={handleDelete}
        />

        <ChatInput
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
        />
    </div>
  );
};

export default Chat;
