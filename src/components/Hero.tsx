import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, RefreshCw, Zap, ExternalLink, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Probe } from '../types';

function ProbeImage({ probe, setUrl }: { probe: Probe, setUrl: (u: string) => void }) {
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = `https://image.thum.io/get/width/1200/crop/800/${probe.url.startsWith('http') ? probe.url : 'https://' + probe.url}`;

  return (
    <div 
      className="aspect-video w-full bg-bg relative overflow-hidden mb-4 cursor-pointer"
      onClick={() => setUrl(probe.url)}
    >
      {(probe.screenshotUrl && !imgError) ? (
        <img 
          src={probe.screenshotUrl} 
          alt={probe.siteName} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <img 
          src={fallbackUrl} 
          alt={probe.siteName} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 bg-electric/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="px-4 py-2 bg-white text-bg text-[10px] font-black uppercase tracking-widest transform -skew-x-12">
          RE_PROBE
        </div>
      </div>
    </div>
  );
}

type Skill = 'basic' | 'detailed' | 'rebuild';

interface HeroProps {
  url: string;
  setUrl: (url: string) => void;
  skill: Skill;
  setSkill: (skill: Skill) => void;
  shouldSynthesize: boolean;
  setShouldSynthesize: (val: boolean) => void;
  isAnalyzing: boolean;
  handleGenerate: (e: React.FormEvent) => void;
  recentProbes: Probe[];
}

export function Hero({ 
  url, 
  setUrl, 
  skill, 
  setSkill, 
  shouldSynthesize,
  setShouldSynthesize,
  isAnalyzing, 
  handleGenerate,
  recentProbes
}: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  const titleText = "Neural Design Probe";
  const titleWords = titleText.split(" ");
  
  const charVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full relative px-6 pt-32 pb-24 text-center z-10 flex flex-col items-center"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8 font-mono text-[10px] text-electric flex items-center gap-2 px-3 py-1 bg-electric/5 border border-electric/20 rounded-sm"
      >
        <div className="w-1.5 h-1.5 bg-electric rounded-full animate-pulse" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          READY_FOR_EXTRACTION_SEQUENCE
        </motion.span>
      </motion.div>

      <motion.h2 
        className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 text-text-main flex flex-wrap justify-center gap-x-4"
        variants={itemVariants}
      >
        {titleWords.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={charVariants}
                className={cn(
                  "inline-block",
                  word === "Design" && "text-electric"
                )}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h2>

      <motion.p variants={itemVariants} className="text-text-muted font-medium text-lg mb-12 tracking-wide max-w-2xl text-center leading-relaxed">
        { "Initialize neural scan — extract structural".split(" ").map((word, i) => (
          <motion.span 
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + (i * 0.05) }}
            className="inline-block mr-1.5"
          >
            {word}
          </motion.span>
        ))}
        <span className="text-text-main font-bold border-b border-electric/40 px-1">SYMBOLS</span>, 
        <span className="text-text-main font-bold border-b border-electric/40 px-1 ml-1">TOKENS</span>, and 
        <span className="text-text-main font-bold border-b border-electric/40 px-1 ml-1">PATTERNS</span> from any digital plane.
      </motion.p>

      <motion.form 
        variants={itemVariants}
        onSubmit={handleGenerate} 
        className="w-full max-w-2xl mx-auto mb-16"
      >
        <div className="relative group mb-8">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-electric z-20">
            <Globe className="w-5 h-5" />
          </div>
          <input 
            type="url" 
            required
            placeholder="PROBE_URL://"
            className="input-cyber pr-40 font-mono pl-14"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            id="probe-url-input"
          />
          <div className="absolute inset-y-2.5 right-2.5">
            <button 
              type="submit"
              disabled={isAnalyzing}
              className="btn-cyber h-11 px-8"
              id="execute-scan-button"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Execute Scan <Zap className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex justify-center gap-4">
            {(['basic', 'detailed', 'rebuild'] as Skill[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSkill(s)}
                className={cn(
                  "px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] border transition-all rounded-sm",
                  skill === s 
                    ? "bg-electric/20 border-electric text-electric shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                    : "border-border-main text-text-muted hover:border-electric/30"
                )}
                id={`skill-level-${s}`}
              >
                {s}_LEVEL
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border-main hidden md:block" />

          <label className="flex items-center gap-4 cursor-pointer group px-4 py-2 hover:bg-white/5 rounded-sm transition-colors border border-transparent hover:border-white/5">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={shouldSynthesize}
                onChange={(e) => setShouldSynthesize(e.target.checked)}
              />
              <div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full peer peer-checked:bg-electric/20 peer-checked:border-electric transition-all shadow-inner"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-text-dim rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-electric shadow-sm"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-electric transition-colors">
              Neural_Synthesis
            </span>
          </label>
        </div>
      </motion.form>

      <motion.div variants={itemVariants} className="w-full max-w-4xl px-8 mt-12">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-px bg-border-main flex-1" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted">Training_Nodes</span>
          <div className="h-px bg-border-main flex-1" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { id: 'apple', url: 'apple.com', img: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=300' },
            { id: 'stripe', url: 'stripe.com', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=300' },
            { id: 'linear', url: 'linear.app', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300' },
            { id: 'github', url: 'github.com', img: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=300' },
            { id: 'airbnb', url: 'airbnb.com', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=300' }
          ].map(site => (
            <motion.button 
              key={site.id} 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUrl(`https://${site.url}`)}
              className="group relative flex flex-col items-center gap-3 p-3 bg-white/5 border border-border-main rounded-sm hover:border-electric/50 transition-all overflow-hidden"
            >
              <div className="w-full aspect-[4/3] overflow-hidden bg-bg rounded-sm mb-1 relative">
                <img 
                  src={site.img} 
                  alt={site.url} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-electric/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-text-main transition-colors font-mono">
                {site.url.toUpperCase()}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {recentProbes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mt-32 px-8"
          >
            <div className="flex items-center justify-between mb-12 border-b border-border-main pb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-electric" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-text-main">
                  Recent_Probes
                </h3>
              </div>
              <div className="text-[9px] font-bold text-text-muted/50 uppercase tracking-widest">
                Nodes active in history
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {recentProbes.map((probe, i) => (
                <motion.div
                  key={probe.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-surface border border-border-main p-1 overflow-hidden"
                >
                  <ProbeImage probe={probe} setUrl={setUrl} />

                  <div className="p-4 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-black tracking-tighter uppercase text-text-main group-hover:text-electric transition-colors">
                        {probe.siteName}
                      </h4>
                      <button 
                        onClick={() => window.open(probe.url, '_blank')}
                        className="text-text-muted hover:text-electric transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-text-muted truncate mb-4 opacity-50">
                      {probe.url}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border-main">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-electric rounded-full animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-electric">Node_Live</span>
                      </div>
                      <span className="text-[8px] font-bold text-text-muted/40 font-mono">
                        {probe.timestamp ? (
                          typeof probe.timestamp.toDate === 'function' 
                            ? probe.timestamp.toDate().toLocaleDateString()
                            : new Date(probe.timestamp).toLocaleDateString()
                        ) : 'NA'}
                      </span>
                    </div>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-electric transform rotate-45 translate-x-1 translate-y-1 group-hover:scale-150 transition-transform" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
