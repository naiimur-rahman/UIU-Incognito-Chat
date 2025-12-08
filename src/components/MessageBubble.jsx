import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn, formatTime } from '../lib/utils';
import { User, Check, X } from 'lucide-react';
import { database } from '../lib/firebase';
import { ref, update } from 'firebase/database';

const MessageBubble = ({
    msg,
    isMyMessage,
    onReply,
    onDelete,
    onBan,
    onPin,
    onReact
}) => {
  const { theme, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const bubbleRef = useRef(null);

  // Constants
  const isBot = msg.senderId === 'ai-system-bot-v1';
  const isDeleted = msg.isDeleted;
  const isNaimur = msg.username?.toLowerCase().includes('naimur rahman');

  // Clean Data
  const cleanUser = isDeleted ? "Unknown" : (msg.username || "Anonymous");
  const cleanText = isDeleted ? "🚫 Admin deleted message" : msg.text;
  const cleanAvatar = isDeleted ? null : msg.avatar;

  const touchTimer = useRef(null);

  const handleTouchStart = () => {
    touchTimer.current = setTimeout(() => {
        if(navigator.vibrate) navigator.vibrate(50);
        setShowMenu(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
        clearTimeout(touchTimer.current);
        touchTimer.current = null;
    }
  };

  return (
    <div
        className={cn("w-full flex flex-col relative mb-1.5 px-1.5",
            isMyMessage ? "items-end" : "items-start"
        )}
        id={`msg-${msg.id}`}
    >
      <div className={cn("flex items-end gap-2 max-w-full", isMyMessage ? "flex-row-reverse" : "flex-row")}>

        {/* Avatar (Only for others) */}
        {!isMyMessage && (
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-1 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                {isBot ? (
                    <div className="w-full h-full bg-[#6c5ce7] flex items-center justify-center text-lg">🤖</div>
                ) : cleanAvatar ? (
                    <img src={cleanAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <User size={16} />
                )}
            </div>
        )}

        {/* Message Content Container */}
        <div className="flex flex-col relative max-w-[70%] min-w-0">

            {/* The Bubble */}
            <div
                ref={bubbleRef}
                className={cn(
                    "relative px-3 py-2 rounded-[20px] text-[0.95rem] leading-[1.4] min-w-[80px] break-words shadow-sm z-10 select-text cursor-auto",
                    isMyMessage
                        ? "bg-gradient-to-br from-primary to-[#ff8c00] text-white rounded-br-md"
                        : "bg-[#f0f2f5] dark:bg-[#262626] text-[#050505] dark:text-[#e4e6eb] rounded-bl-md",
                    isBot && "bg-bot-gradient text-white border-none",
                    isDeleted && "flex flex-col gap-0.5 whitespace-nowrap italic !bg-[rgba(0,0,0,0.06)] !text-[rgba(0,0,0,0.6)] dark:!bg-[rgba(255,255,255,0.08)] dark:!text-[#aaa]",
                    isNaimur && !isBot && !isDeleted && "border border-[#ffd700]"
                )}
                onDoubleClick={() => setShowMenu(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd} // Cancel on scroll
            >
                {/* Header Inside Bubble */}
                <div className={cn("flex items-center gap-1.5 text-[0.7rem] font-semibold mb-1 opacity-70 whitespace-nowrap",
                    isMyMessage ? "justify-end" : ""
                )}>
                    {!isMyMessage && (
                        <>
                            {cleanUser}
                            {isNaimur && !isDeleted && <span className="text-verified-blue">✔</span>}
                            <span>&bull;</span>
                        </>
                    )}
                    {formatTime(msg.timestamp)}
                </div>

                {/* Reply Quote Block */}
                {msg.replyTo && !isDeleted && (
                    <div
                        className={cn("mb-1.5 p-1.5 rounded-md border-l-[3px] opacity-90 text-xs flex flex-col cursor-pointer max-w-full",
                            isMyMessage ? "bg-white/20 border-white text-white" : "bg-black/5 dark:bg-white/10 border-primary text-text-color dark:text-gray-200"
                        )}
                        onClick={() => {
                            const original = document.getElementById(`msg-${msg.replyTo.id}`);
                            if(original) original.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                    >
                        <span className="font-bold mb-0.5">{msg.replyTo.username}</span>
                        <span className="truncate line-clamp-1">{msg.replyTo.text}</span>
                    </div>
                )}

                {/* Image */}
                {msg.imageURL && !isDeleted && (
                    <div className="mb-2">
                        <img
                            src={msg.imageURL}
                            alt="Sent"
                            className="block rounded-xl cursor-pointer object-cover w-full h-auto max-h-[350px]"
                            onClick={() => window.open(msg.imageURL, '_blank')}
                        />
                    </div>
                )}

                {/* Text */}
                <div className="text-inherit">{cleanText}</div>

                {/* Admin Delete Button */}
                {isAdmin && !isDeleted && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }}
                        className="absolute -top-[5px] w-[18px] h-[18px] flex items-center justify-center bg-[#ff4757] text-white rounded-full text-xs shadow-md z-[15] hover:scale-110 transition-transform"
                        style={{ right: isMyMessage ? '10px' : '-10px' }}
                    >
                        ×
                    </button>
                )}

            </div>

            {/* Reactions Display */}
            {msg.reactions && (
                <div className="absolute -bottom-3 right-0 bg-white dark:bg-[#3a3a4a] border-2 border-white/50 dark:border-[#0f0c29] rounded-xl px-1.5 py-[2px] text-[0.7rem] shadow-sm flex gap-0.5 items-center z-12 min-w-[20px] justify-center">
                    {Object.entries(
                        Object.values(msg.reactions).reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {})
                    ).sort((a,b) => b[1] - a[1]).map(([emoji, count]) => (
                        <span key={emoji}>{emoji}{count > 1 ? count : ''}</span>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Reaction Menu Overlay */}
      {showMenu && (
        <>
            <div className="fixed inset-0 z-[90]" onClick={() => setShowMenu(false)}></div>
            <div className="absolute top-[-50px] left-0 right-0 mx-auto w-fit z-[100] animate-float-up">
                <div className="glass-bg rounded-[50px] px-3 py-1.5 shadow-lg flex items-center gap-2 border border-white/60 dark:border-white/10">
                    <button onClick={() => { onReply(msg); setShowMenu(false); }} className="text-text-color dark:text-white p-1 hover:scale-110 transition-transform">
                        Reply
                    </button>
                    {isAdmin && (
                        <>
                            <div className="w-[1px] h-4 bg-gray-400 mx-1"></div>
                            <button onClick={() => { onPin(msg); setShowMenu(false); }} className="text-text-color dark:text-white p-1 hover:scale-110 transition-transform">
                                Pin
                            </button>
                            <button onClick={() => { onBan(msg); setShowMenu(false); }} className="text-red-500 font-bold p-1 text-xs hover:scale-110 transition-transform">
                                BAN
                            </button>
                        </>
                    )}
                    <div className="w-[1px] h-4 bg-gray-400 mx-1"></div>
                    {['❤️', '😂', '😮', '😢', '😡', '👍'].map(emoji => (
                        <span
                            key={emoji}
                            onClick={() => {
                                if(onReact) onReact(msg.id, emoji);
                                setShowMenu(false);
                            }}
                            className="text-xl cursor-pointer hover:scale-125 transition-transform"
                        >
                            {emoji}
                        </span>
                    ))}
                </div>
            </div>
        </>
      )}

    </div>
  );
};

export default MessageBubble;
