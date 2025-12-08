import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun } from 'lucide-react';

const Layout = ({ children }) => {
  const { theme, toggleTheme, currentUser } = useAuth();

  return (
    <>
      {/* Background Shapes */}
      <div className={`fixed rounded-full blur-[80px] -z-10 opacity-60 pointer-events-none w-[300px] h-[300px] -top-[50px] -left-[50px] transition-colors duration-500
        ${theme === 'dark' ? 'bg-[#4e54c8] opacity-20' : 'bg-[#ffe259]'}`}></div>
      <div className={`fixed rounded-full blur-[80px] -z-10 opacity-60 pointer-events-none w-[400px] h-[400px] -bottom-[100px] -right-[100px] transition-colors duration-500
        ${theme === 'dark' ? 'bg-[#8f94fb] opacity-20' : 'bg-[#ffa751]'}`}></div>

      {/* Login Screen Theme Toggle (Chat has it in header) */}
      {!currentUser && (
        <div className="absolute top-5 right-5 z-50">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-color hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      )}

      {children}
    </>
  );
};

export default Layout;
