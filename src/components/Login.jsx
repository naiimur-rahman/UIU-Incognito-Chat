import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, ArrowLeft, MessageCircle, Calculator, UserCheck, Lock, LogIn, Camera, ArrowRight } from 'lucide-react';
import { uploadToCloudinary } from '../lib/utils'; // We'll need to move this utility function

const Login = () => {
  const { loginAsGuest, loginAsMember } = useAuth();
  const [view, setView] = useState('selection'); // selection, guest, member
  const [guestName, setGuestName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Utility for Cloudinary Upload (Need to implement in utils.js or here) ---
  const handleAvatarSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleGuestJoin = async () => {
    if (!guestName.trim()) return alert("Please enter a name.");
    if (/[.#$\[\]]/.test(guestName)) return alert("Name cannot contain special characters.");

    setLoading(true);
    try {
      await loginAsGuest(guestName.trim());
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberLogin = async () => {
    if (!username.trim() || !password.trim()) return alert("Enter username and password.");

    setLoading(true);
    try {
      let avatarUrl = null;
      if (avatarFile) {
        // We need the cloud config. For now assuming utils has it or we implement it.
        // Let's implement a quick upload helper here or assume global availability
        // For standard React, better to put in utils. I will add it to utils.js next step.
        // For now, I'll assume uploadToCloudinary exists in utils.
        avatarUrl = await uploadToCloudinary(avatarFile);
      }
      await loginAsMember(username.trim(), password.trim(), avatarUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col justify-center items-center relative overflow-hidden p-5">

      <div className="w-full max-w-[900px] z-10 animate-pop-up">

        {/* Logo Area */}
        <div className="mb-5 flex flex-col items-center relative z-[2]">
          <div className="w-12 h-12 text-white bg-primary rounded-2xl shadow-[0_8px_20px_rgba(255,102,0,0.4)] flex items-center justify-center mb-3 animate-float-logo">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">Incognito Chat</h1>
        </div>

        {/* Mobile Selection Screen */}
        <div className={`flex flex-col gap-4 w-full max-w-[400px] mx-auto z-20 md:hidden ${view !== 'selection' ? 'hidden' : 'flex'}`}>
          <div onClick={() => setView('guest')} className="bg-white/80 dark:bg-[#1e1e28]/80 backdrop-blur-md border border-white/50 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform">
            <User size={32} className="text-primary" />
            <h3 className="text-lg font-bold text-primary dark:text-white">Guest Login</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Anonymous • Quick Access</p>
          </div>
          <div onClick={() => setView('member')} className="bg-white/80 dark:bg-[#1e1e28]/80 backdrop-blur-md border border-white/50 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform">
            <ShieldCheck size={32} className="text-status-green" />
            <h3 className="text-lg font-bold text-status-green dark:text-white">Member Login</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Secure • Save History</p>
          </div>
        </div>

        {/* Split Login Card */}
        <div className={`glass-bg rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 animate-shine
          ${view === 'selection' ? 'hidden md:flex' : 'flex flex-col md:flex-row'}`}>

          {/* Guest Panel */}
          <div className={`flex-1 p-10 flex flex-col items-center justify-center text-center relative z-[2]
            ${view === 'member' ? 'hidden md:flex' : 'flex'}`}>

            <button onClick={() => setView('selection')} className="md:hidden self-start flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 hover:text-primary">
              <ArrowLeft size={16} /> Back
            </button>

            <h2 className="text-2xl font-bold mb-1">Quick Join</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Enter a secret name to join anonymously</p>

            <div className="relative w-full mb-5">
              <input
                type="text"
                placeholder="Secret Name..."
                maxLength={15}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuestJoin()}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent bg-white/80 dark:bg-black/30 text-sm font-medium focus:bg-white dark:focus:bg-black/50 focus:border-primary focus:shadow-[0_8px_25px_rgba(255,102,0,0.15)] outline-none transition-all dark:text-white"
              />
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            </div>

            <button onClick={handleGuestJoin} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#ff8c00] text-white font-semibold flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(255,102,0,0.4)] hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70">
              {loading ? 'Joining...' : <>Join as Guest <ArrowRight size={18} /></>}
            </button>

            <div className="flex items-center gap-3 w-full my-6 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-60">
              <div className="h-[1px] bg-current flex-1 opacity-30"></div>
              USEFUL LINKS
              <div className="h-[1px] bg-current flex-1 opacity-30"></div>
            </div>

            <a href="https://naiimur-rahman.github.io/UIU-CGPA-Calculator/" target="_blank" rel="noreferrer" className="w-full py-2.5 rounded-xl border-2 border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm font-semibold flex justify-center items-center gap-2 hover:border-primary hover:text-primary hover:bg-white dark:hover:bg-white/10 hover:-translate-y-1 transition-all">
              <Calculator size={18} /> CGPA Calculator
            </a>
          </div>

          <div className="w-[1px] bg-black/10 dark:bg-white/10 my-5 hidden md:block"></div>

          {/* Member Panel */}
          <div className={`flex-1 p-10 flex flex-col items-center justify-center text-center relative z-[2]
            ${view === 'guest' ? 'hidden md:flex' : 'flex'}`}>

            <button onClick={() => setView('selection')} className="md:hidden self-start flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 hover:text-primary">
              <ArrowLeft size={16} /> Back
            </button>

            <h2 className="text-2xl font-bold mb-1">Member Login</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Secure your identity & save history</p>

            <div className="relative w-full mb-5">
              <input
                type="text"
                placeholder="Username"
                maxLength={15}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('pass-input').focus()}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent bg-white/80 dark:bg-black/30 text-sm font-medium focus:bg-white dark:focus:bg-black/50 focus:border-primary focus:shadow-[0_8px_25px_rgba(255,102,0,0.15)] outline-none transition-all dark:text-white"
              />
              <UserCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            </div>

            <div className="relative w-full mb-5">
              <input
                id="pass-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMemberLogin()}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent bg-white/80 dark:bg-black/30 text-sm font-medium focus:bg-white dark:focus:bg-black/50 focus:border-primary focus:shadow-[0_8px_25px_rgba(255,102,0,0.15)] outline-none transition-all dark:text-white"
              />
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            </div>

            <div className="w-full mb-5">
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarSelect} />
              <label htmlFor="avatar-upload" className="w-full py-2.5 rounded-xl border-2 border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm font-semibold flex justify-center items-center gap-2 cursor-pointer hover:border-primary hover:text-primary hover:bg-white dark:hover:bg-white/10 hover:-translate-y-1 transition-all">
                <Camera size={18} /> {avatarFile ? 'Avatar Selected!' : 'Upload Avatar'}
              </label>
              {avatarFile && <p className="text-xs text-primary mt-1">{avatarFile.name}</p>}
            </div>

            <button onClick={handleMemberLogin} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#ff8c00] text-white font-semibold flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(255,102,0,0.4)] hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70">
              {loading ? 'Processing...' : <>Login / Register <LogIn size={18} /></>}
            </button>

          </div>

        </div>

      </div>

      <div className="absolute bottom-5 text-center text-xs font-medium opacity-80 pointer-events-none">
        Developed by <a href="https://www.facebook.com/naiimurr/" target="_blank" rel="noreferrer" className="font-bold pointer-events-auto hover:text-primary transition-colors">Naimur Rahman</a> (CSE 242) ❤️️
      </div>

    </div>
  );
};

export default Login;
