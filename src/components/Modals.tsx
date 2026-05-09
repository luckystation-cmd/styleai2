import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Zap } from 'lucide-react';

interface InfoModalProps {
  info: { title: string; content: string } | null;
  onClose: () => void;
  onLogin?: () => void;
  isAuthenticated: boolean;
}

export function InfoModal({ info, onClose, onLogin, isAuthenticated }: InfoModalProps) {
  return (
    <AnimatePresence>
      {info && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-bg/80 backdrop-blur-md flex items-center justify-center p-8"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 40, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, y: 40, opacity: 0, rotateX: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-surface border border-border-main p-12 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] perspective-1000"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric to-transparent" 
            />
            
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-text-main uppercase tracking-tighter mb-8 flex items-center gap-4"
            >
              <span className="w-12 h-1 bg-electric" />
              {info.title}
            </motion.h3>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-text-muted font-medium leading-relaxed mb-12 text-sm italic"
            >
              "{info.content}"
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end gap-4"
            >
              {!isAuthenticated && info.title === "Authorization Required" && onLogin && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onLogin();
                    onClose();
                  }}
                  className="px-8 py-3 bg-electric text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neural transition-all shadow-lg"
                >
                  Authenticate
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-3 bg-text-main text-bg text-[10px] font-black uppercase tracking-[0.3em] hover:bg-electric hover:text-white transition-all shadow-lg"
              >
                I Understand
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function RechargeModal({ isOpen, onClose, onSubmit, isSubmitting }: RechargeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface border border-border-main p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric to-neural" />
            
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-text-main uppercase tracking-tighter leading-none mb-2">BUY ME A COFFEE</h3>
                <p className="text-electric text-[9px] font-black uppercase tracking-[0.4em]">Developer Support</p>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                <RefreshCw className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-10">
              <div className="flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="relative bg-white p-4 rounded-sm">
                    <img 
                      src="/qr-code.png" 
                      alt="Bankkok Bank QR" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-text-main tracking-tight mb-1">PromptPay 0942593044</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-electric">Support Coffee // Bangkok Bank</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-border-main text-center">
                <p className="text-xs text-text-muted leading-relaxed font-medium mb-6">
                  Your support fuels the development of this architectural scanning engine. Every coffee counts.
                  <span className="block mt-2 text-text-main font-bold">Appreciation Status: HIGH</span>
                </p>
                
                <button 
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-electric text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-neural transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] group"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                      ALLOCATE +10 NEURAL CREDITS
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
