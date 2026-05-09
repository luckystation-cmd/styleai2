import { Zap, Sun, Moon, User, LogOut, Menu, Terminal, X } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface HeaderProps {
  user: FirebaseUser | null;
  credits: number | null;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  handleLogin: () => void;
  handleLogout: () => void;
  openTopUp: () => void;
  systemHealth: { status: string; apiKeySet: boolean } | null;
}

export function Header({ 
  user, 
  credits, 
  theme, 
  setTheme, 
  handleLogin, 
  handleLogout, 
  openTopUp,
  systemHealth
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full px-8 py-6 flex items-center justify-between relative z-50 border-b border-border-main backdrop-blur-md bg-bg/50"
    >
      <div className="flex items-center gap-3 group cursor-pointer">
        <motion.img 
          src="/logo.svg"
          alt="StyleAI Logo"
          whileHover={{ scale: 1.05, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-text-main">style<span className="text-electric">AI</span></h1>
            <div 
              className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] transition-all duration-500 cursor-help ${
                !systemHealth ? 'bg-yellow-500 shadow-yellow-500 animate-pulse' : 
                (systemHealth.apiKeySet ? 'bg-emerald-500 shadow-emerald-500' : 'bg-red-500 shadow-red-500')
              }`} 
              onClick={() => {
                const status = !systemHealth ? "Connecting to Neural Core..." : 
                              (systemHealth.apiKeySet ? 
                                `Neural Core Active. Detected keys: ${(systemHealth as any).detectedKeys?.join(', ')}` : 
                                `Neural Core Inactive. GEMINI_API_KEY is missing. Detected keys: ${(systemHealth as any).detectedKeys?.join(', ') || 'None'}`);
                alert(`${status}\n\nNote: If you just added a key, please try: Settings -> Restart Server.`);
              }}
              title={!systemHealth ? "Syncing..." : (systemHealth.apiKeySet ? "Neural Core Active" : "AI Key Missing on Server - Click for info")}
            />
          </div>
          <span className="text-[7px] font-black tracking-[0.4em] text-electric/50 uppercase">Neural Interface v4.0</span>
        </div>
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
        <Link to="/cli" className="flex items-center gap-2 hover:text-electric transition-colors group p-2">
          <Terminal className="w-4 h-4" /> <span>CLI Tool</span>
        </Link>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 border border-border-main hover:border-electric/50 hover:bg-electric/5 transition-all text-text-main rounded-sm flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
        
        {user ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 px-3 py-1.5 border border-electric/30 bg-electric/5 rounded-sm h-9">
                <Zap className="w-3.5 h-3.5 text-electric" />
                <span className="text-white font-black tracking-widest leading-none">{credits ?? '...'} CREDITS</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openTopUp}
                className="px-3 h-9 bg-electric text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-bg transition-all rounded-sm flex items-center justify-center shadow-lg shadow-electric/20"
              >
                RECHARGE
              </motion.button>
            </div>
            <div className="flex items-center gap-4 border-l border-border-main pl-6">
              <div className="flex items-center gap-2" id="user-profile">
                {user.photoURL && user.photoURL.trim() !== "" ? (
                  <img src={user.photoURL} className="w-5 h-5 rounded-full border border-electric/40" alt="Avatar" />
                ) : (
                  <User className="w-4 h-4 text-electric" />
                )}
                <div className="flex flex-col text-left">
                  <span className="text-text-main max-w-[120px] truncate leading-none mb-0.5">{user.displayName || user.email?.split('@')[0] || 'Neural Entity'}</span>
                  <span className="text-[7px] text-text-muted truncate opacity-50 uppercase tracking-widest leading-none">{user.email}</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, color: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-2 text-text-muted hover:text-red-400 transition-colors"
                title="Logout"
                id="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="px-6 py-2 bg-text-main text-bg hover:bg-electric hover:text-white transition-all rounded-sm font-black flex items-center gap-2 shadow-lg"
            id="login-button"
          >
            <User className="w-3.5 h-3.5" /> Access Core
          </motion.button>
        )}
      </div>

      {/* Mobile Toggle */}
      <button 
        className="md:hidden p-2 text-text-main"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-surface border-b border-border-main z-40 overflow-hidden md:hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              <Link to="/cli" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-text-main">
                <Terminal className="w-5 h-5 text-electric" /> CLI Tool
              </Link>
              
              <button 
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-text-main"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-electric" /> : <Moon className="w-5 h-5 text-electric" />}
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>

              <div className="h-px bg-border-main w-full" />

              {user ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    {user.photoURL && user.photoURL.trim() !== "" ? (
                      <img src={user.photoURL} className="w-8 h-8 rounded-full border border-electric/40" alt="Avatar" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-electric/40 flex items-center justify-center bg-electric/5 text-electric">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-main">{user.displayName || user.email?.split('@')[0] || 'Neural Entity'}</span>
                      <span className="text-[10px] text-text-muted">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 border border-electric/30 bg-electric/5 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-electric" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{credits ?? '...'} CREDITS</span>
                    </div>
                    <button 
                      onClick={() => {
                        openTopUp();
                        setIsMenuOpen(false);
                      }}
                      className="text-[10px] font-black text-electric uppercase tracking-widest underline underline-offset-4"
                    >
                      RECHARGE
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-red-500"
                  >
                    <LogOut className="w-5 h-5" /> Logout Session
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 bg-electric text-white text-xs font-black uppercase tracking-[0.2em] rounded-sm shadow-lg shadow-electric/20"
                >
                  Access Neutral Core
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
