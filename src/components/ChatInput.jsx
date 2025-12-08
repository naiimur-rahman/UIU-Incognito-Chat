import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Smile, Image as ImageIcon, X } from 'lucide-react';
import { uploadToCloudinary } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import heic2any from 'heic2any';

const EMOJI_LIST = [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇',
    '🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑',
    '🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬',
    '🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵',
    '🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️',
    '😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱',
    '😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿',
    '💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','👋','🤚','🖐',
    '✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕',
    '👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝',
    '🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠',
    '🦷','🦴','👀','👁','👅','👄','💋','🩸'
];

const ChatInput = ({ onSendMessage, onTyping, replyingTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    onTyping(false);
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      let fileToUpload = file;
      let fileName = file.name;

      if(file.name.toLowerCase().endsWith('.heic')) {
          try {
              const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
              fileToUpload = new File([blob], fileName.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
          } catch(err) {
              console.error("HEIC Conversion failed:", err);
          }
      }

      try {
          onSendMessage("📸 Uploading image...", true); // true = temp placeholder flag if I supported it
          const url = await uploadToCloudinary(fileToUpload);
          onSendMessage(null, false, url); // Send actual image
      } catch (err) {
          alert("Upload failed");
      }
    }
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojis(false);
    // trigger typing
    onTyping(true);
  };

  return (
    <div className="glass-bg p-2.5 pb-[max(5px,env(safe-area-inset-bottom))] border-t border-white/60 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex flex-col relative">

      {/* Reply Preview */}
      {replyingTo && (
          <div className="absolute bottom-full left-0 w-full glass-bg border-t border-white/60 dark:border-white/10 p-3 flex justify-between items-center animate-float-up z-10">
              <div className="flex-1 border-l-[3px] border-primary pl-3 overflow-hidden">
                  <span className="text-primary text-xs font-bold block mb-0.5">Replying to {replyingTo.username}</span>
                  <p className="text-sm text-gray-500 truncate">{replyingTo.text}</p>
              </div>
              <button onClick={onCancelReply} className="p-2 text-gray-500 hover:text-red-500">
                  <X size={18} />
              </button>
          </div>
      )}

      {/* Emoji Picker */}
      {showEmojis && (
          <div ref={emojiRef} className="absolute bottom-[90px] left-5 w-[280px] h-[220px] glass-bg rounded-2xl border border-white/60 dark:border-white/10 shadow-xl grid grid-cols-6 p-3 gap-1.5 overflow-y-auto z-50 animate-float-up">
              {EMOJI_LIST.map((e, i) => (
                  <span key={i} onClick={() => addEmoji(e)} className="text-2xl cursor-pointer text-center p-1.5 hover:bg-black/5 rounded-lg transition-colors select-none">
                      {e}
                  </span>
              ))}
          </div>
      )}

      <div className="flex items-center gap-1.5 w-full">
        {/* Bot Trigger */}
        <button
            onClick={() => onSendMessage(text, false, null, true)} // triggerAI = true
            className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center bg-[rgba(108,92,231,0.1)] text-[#007bff] dark:text-[#3eadcf] border border-[rgba(108,92,231,0.2)] hover:bg-[rgba(108,92,231,0.2)] hover:-translate-y-0.5 transition-all"
            title="Ask AI"
        >
            <Bot size={20} />
        </button>

        {/* Emoji Trigger */}
        <button
            onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
            className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/10 text-[#f39c12] border border-black/10 dark:border-white/20 hover:bg-black/10 hover:-translate-y-0.5 transition-all"
        >
            <Smile size={20} />
        </button>

        {/* Image Trigger (Hidden when typing) */}
        {!text && (
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/10 text-text-color dark:text-white border border-black/10 dark:border-white/20 hover:bg-black/10 hover:-translate-y-0.5 transition-all"
            >
                <ImageIcon size={20} />
            </button>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

        {/* Text Input */}
        <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="@ai or (Click 🤖 to ask BhodAi)"
            className="flex-1 min-w-0 w-0 px-4 py-2.5 rounded-[24px] bg-white/60 dark:bg-[#282832]/60 border border-white/10 dark:border-white/20 shadow-inner text-base text-text-color dark:text-white outline-none focus:bg-white/90 dark:focus:bg-white/15 focus:border-primary focus:shadow-md transition-all placeholder:text-gray-500/70"
        />

        {/* Send Button */}
        <button
            onClick={handleSend}
            className={cn("w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-[#ff8c00] text-white shadow-lg hover:scale-105 active:scale-95 transition-all",
                !text && "w-0 h-0 p-0 opacity-0 scale-50 overflow-hidden ml-0"
            )}
        >
            <Send size={20} className="ml-0.5" />
        </button>
      </div>

      <div className="w-full text-center text-[0.65rem] font-medium opacity-50 mt-1 pointer-events-none text-text-color dark:text-white">
          Developed by Naimur Rahman (CSE 242) ❤️
      </div>
    </div>
  );
};

export default ChatInput;
