import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, LogOut, GraduationCap } from 'lucide-react';

const ChatHeader = ({ activeCount }) => {
  const { theme, toggleTheme, logout, myAvatar } = useAuth();

  return (
    <header className="glass-bg flex justify-between items-center px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 shrink-0 border-b border-white/60 dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff660033] to-[#ff5e6233] text-primary flex items-center justify-center shadow-sm border border-white/20 overflow-hidden cursor-pointer">
          {myAvatar ? (
             <img src={myAvatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             <GraduationCap size={20} />
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">UIU Community</h2>
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-green shadow-[0_0_8px_#2ecc71]"></span>
            {activeCount !== null ? `${activeCount} Online` : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-text-color hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={logout}
          className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
