import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import { ArrowDown } from 'lucide-react';
import { update, ref } from 'firebase/database';
import { database } from '../lib/firebase';

const MessageList = ({ messages, isAtBottom, scrollToBottom, onReply, onPin, onBan, onDelete }) => {
  const { currentUser, isAdmin } = useAuth();
  const containerRef = useRef(null);
  const endRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isAtBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Pass a reactor function down? Or context?
  // Bubble needs to know "myUUID". currentUser has it.

  const handleReact = (msgId, emoji) => {
      if(currentUser && currentUser.uuid) {
          update(ref(database, `messages/${msgId}/reactions/${currentUser.uuid}`), emoji);
      }
  };

  // Hack: passing handleReact via onReply object extension or just props drilling in bubble?
  // Let's modify MessageBubble to accept onReact prop. I'll update the previous file.

  return (
    <div
        id="messages-container"
        ref={containerRef}
        className="flex-1 overflow-y-auto px-2.5 pt-2 flex flex-col gap-0.5 z-10 scroll-smooth relative"
        onScroll={(e) => {
            // Logic to determine if at bottom is handled in parent Chat.jsx usually,
            // but let's see if we can just use the prop passed down.
            // Actually parent needs to know scroll state.
            // We'll trust parent 'scrollToBottom' function but we need to notify parent of scroll events if we want to toggle the button visibility.
            // For now, let's just render.
        }}
    >
      {messages.map((msg) => (
        <MessageBubble
            key={msg.id}
            msg={msg}
            isMyMessage={currentUser && (msg.senderId === currentUser.uuid || msg.username === currentUser.username)}
            onReply={onReply}
            onDelete={onDelete}
            onBan={onBan}
            onPin={onPin}
            // Passing the reactor
            onReact={handleReact}
        />
      ))}

      {/* Dummy div for scrolling */}
      <div ref={endRef} />

      {/* Scroll Button */}
      {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-5 right-5 w-10 h-10 rounded-full glass-bg text-primary flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform animate-float-up z-50"
          >
            <ArrowDown size={20} />
          </button>
      )}
    </div>
  );
};

export default MessageList;
