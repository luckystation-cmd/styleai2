import { Zap, Globe, Info, History, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenInfo: (title: string, content: string) => void;
}

const infoMap: Record<string, string> = {
  'Neural Core': 'The heart of the StyleAI engine. A distributed neural network processing billions of design patterns to identify structural invariants.',
  'Tokenization': 'Advanced logic that converts raw CSS and HTML into a structured design system. Supports Tailwind, CSS Variables, and MDX.',
  'MD Format': 'Extraction protocols optimized for documentation. Generates clean, searchable design hand-off specifications.',
  'API Access': 'Secure gateway for third-party integrations (Coming Soon). Direct neural hooks into the extraction pipeline.',
  'System Status': 'Real-time performance monitoring. Current load: Normal. Neural distribution: Synchronized.',
  'Style Library': 'Access common design patterns extracted from the web. A curated database of symbols and tokens.',
  'MDX Guides': 'Detailed instructions on how to leverage the generated MDX data in your React/Next.js projects.',
  'AI Models': 'The latest Gemini 1.5 and 2.0 experimental architectures powering the neural synthesis engine.',
  'Globe': 'Global network status: ALL NODES OPERATIONAL.',
  'Info': 'System version v4.0.2 - Neural Integrity Verified.',
  'History': 'Extraction logs: 1.4M Successful scans recorded in the last 24 hours.',
  'Terminal': 'Command interface: Active. Ready for extraction sequence.'
};

export function Footer({ onOpenInfo }: FooterProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-bg text-text-main px-8 py-24 mt-32 border-t border-border-main relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 relative z-10"
      >
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-8">
            <motion.img 
              src="/logo.svg"
              alt="StyleAI Logo"
              whileHover={{ scale: 1.05, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-text-main">style<span className="text-electric">AI</span></h1>
          </div>
          <p className="text-text-muted text-sm leading-relaxed mb-8">
            Digital interface anatomy extrusion protocol. Advanced neural analysis for front-end engineering specifications.
          </p>
          <div className="flex gap-4">
            {[
              { Icon: Globe, name: 'Globe', isLink: false },
              { Icon: Info, name: 'Info', isLink: false },
              { Icon: History, name: 'History', isLink: false },
              { Icon: Terminal, name: 'Terminal', isLink: true, to: '/cli' }
            ].map(({ Icon, name, isLink, to }, i) => (
              isLink ? (
                <Link
                  key={i}
                  to={to!}
                  className="w-10 h-10 bg-white/5 border border-border-main flex items-center justify-center hover:bg-electric hover:text-white transition-all cursor-pointer group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
              ) : (
                <button 
                  key={i} 
                  onClick={() => onOpenInfo(name, infoMap[name])}
                  className="w-10 h-10 bg-white/5 border border-border-main flex items-center justify-center hover:bg-electric hover:text-white transition-all cursor-pointer group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              )
            ))}
          </div>
        </motion.div>

        {[
          { title: 'Protocol', links: ['Neural Core', 'Tokenization', 'MD Format', 'API Access'] },
          { title: 'Resources', links: ['System Status', 'Style Library', 'MDX Guides', 'AI Models'] },
        ].map((col, i) => (
          <motion.div variants={itemVariants} key={i}>
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-electric mb-10">{col.title}</h5>
            <ul className="space-y-5 text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
              {col.links.map(link => (
                <li 
                  key={link} 
                  onClick={() => onOpenInfo(link, infoMap[link])}
                  className="hover:text-electric transition-colors cursor-pointer"
                >
                  {link}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <motion.div variants={itemVariants}>
          <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-electric mb-10">Neural Hub Status</h5>
          <div className="bg-white/5 p-8 border border-border-main">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-electric shadow-[0_0_10px_rgba(6,182,212,1)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-main">Interface Synchronized</span>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight">
              Global nodes functional. Logic distribution: 100%. Latency: 4ms. Secure protocol extraction active.
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto mt-24 mb-12 relative px-8"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-electric to-transparent opacity-20" />
        <div className="text-[11px] text-text-muted leading-relaxed max-w-3xl pl-6">
          <strong className="text-electric uppercase tracking-[0.2em] mr-3 font-black">Fair Use Invariant:</strong> 
          This analytical engine processes publicly accessible CSS/HTML data to derive design specifications for educational and professional architectural reference. 
          No proprietary source code is reproduced, cached, or redistributed. All visual assets and brand identifiers remain the exclusive property of their respective legal entities. 
          <button 
            onClick={() => onOpenInfo("Terms of Intelligence", "The StyleAI engine operates under structural fair use guidelines. Users are granted a non-exclusive license to utilize generated design tokens for development prototyping and architectural mapping. Redistribution of bulk datasets is restricted by Core Protocols.")}
            className="text-text-main hover:text-electric ml-2 transition-all cursor-pointer font-bold"
          >
            Protocol 14-B Documentation
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto pt-16 pb-24 border-t border-border-main flex flex-col md:flex-row justify-between items-end gap-12 relative z-10 px-8"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="StyleAI Logo" className="w-5 h-5" />
            <span className="text-lg font-black tracking-tighter text-text-main">STYLE ARCHITECT <span className="text-text-dim uppercase text-[10px] tracking-[0.4em] ml-2 font-light">Intelligence Core</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim max-w-sm leading-loose">
            © 2026 STYLE ARCHITECT. BUILT WITH NEURAL INTELLIGENCE. GLOBAL EXTRACTION PROTOCOL SECURED.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-4 text-[9px] font-black uppercase tracking-[0.3em] text-text-dim">
          <div className="space-y-4">
            <p className="text-text-muted/30 mb-6 font-black tracking-[0.5em]">SYSTEM</p>
            <button onClick={() => onOpenInfo("Encryption Status", "All data transmissions are secured via quantum-resistant AES-256-GCM protocols.")} className="block hover:text-electric transition-colors cursor-pointer text-left">Encryption</button>
            <button onClick={() => onOpenInfo("Security Layers", "Multi-factor authentication required for privileged core access.")} className="block hover:text-electric transition-colors cursor-pointer text-left">Security</button>
          </div>
          <div className="space-y-4">
            <p className="text-text-muted/30 mb-6 font-black tracking-[0.5em]">LEGAL</p>
            <button onClick={() => onOpenInfo("Terms of Service", "By utilizing the StyleAI engine, you agree to adhere to the Open Architectural standard.")} className="block hover:text-electric transition-colors cursor-pointer text-left">Terms</button>
            <button onClick={() => onOpenInfo("Core Protocols", "Analysis priority is determined by token density and architectural complexity.")} className="block hover:text-electric transition-colors cursor-pointer text-left">Protocols</button>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
