import { useState, useEffect, RefObject } from 'react';
import { motion } from 'motion/react';
import { Camera, Cpu, Palette, Terminal, Eye, Box, Hash, Copy, Check, Download, Share2, Code, Info, FileArchive, Database, Figma } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ExtractionResult, SynthesisResult } from '../services/geminiService';
import { cn } from '../lib/utils';

type OutputFormat = 'markdown' | 'tailwind' | 'css' | 'synthesis' | 'tokens';

interface ResultDisplayProps {
  url: string;
  result: ExtractionResult | null;
  synthesis: SynthesisResult | null;
  isAnalyzing: boolean;
  activeFormat: OutputFormat;
  setActiveFormat: (format: OutputFormat) => void;
  extractedColors: string[];
  logs: string[];
  logEndRef: RefObject<HTMLDivElement | null>;
  copying: boolean;
  handleCopy: () => void;
  handleDownload: () => void;
  handleExportZip: () => void;
  handleExportFigma: () => void;
}

export function ResultDisplay({
  url,
  result,
  synthesis,
  isAnalyzing,
  activeFormat,
  setActiveFormat,
  extractedColors,
  logs,
  logEndRef,
  copying,
  handleCopy,
  handleDownload,
  handleExportZip,
  handleExportFigma
}: ResultDisplayProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state when result changes
  useEffect(() => {
    setImgError(false);
  }, [result]);

  if (!result && !isAnalyzing) return null;

  return (
    <div className="w-full px-8 pb-32 z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[95vw] mx-auto">
        
        {/* Left Column: Media & Assets */}
        <div className="lg:col-span-4 space-y-8">
          {/* Screenshots Container */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-electric to-neural opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
            <div className="relative glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-electric" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    Visual_Capture // {url.replace('https://', '').toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-electric/40" />
                  <div className="w-1 h-1 rounded-full bg-electric/40" />
                </div>
              </div>
              <div className="p-4 relative">
                <div className="relative aspect-video bg-black/60 overflow-hidden border border-border-main">
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-electric shadow-[0_0_15px_rgba(6,182,212,1)] z-20"
                  />
                  
                  {isAnalyzing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/50 backdrop-blur-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Cpu className="w-10 h-10 text-electric opacity-50" />
                      </motion.div>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-electric animate-pulse">Scanning_Pixels...</span>
                    </div>
                  ) : (
                    (result?.screenshot && !imgError) ? (
                      <img 
                        src={result.screenshot} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-1000"
                        alt="Layout Capture"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                      />
                    ) : (url && url.trim() !== "") ? (
                      <img 
                        src={`https://image.thum.io/get/width/1200/crop/800/${url.startsWith('http') ? url : 'https://' + url}`} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-1000"
                        alt="Layout Capture Fallback"
                        referrerPolicy="no-referrer"
                      />
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Extracted Colors */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 group"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-electric" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Atmospheric_Spectrum</h3>
              </div>
              <span className="text-[8px] font-mono text-text-dim/40 italic">Extracted_DNA</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {extractedColors.length > 0 ? (
                extractedColors.map((color, i) => (
                  <motion.div 
                    whileHover={{ x: 5, scale: 1.02 }}
                    key={i} 
                    className="flex items-center gap-3 group/item cursor-pointer p-2 rounded-sm hover:bg-white/[0.03] border border-transparent hover:border-border-main transition-all"
                    onClick={() => {
                      navigator.clipboard.writeText(color);
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-sm border border-border-main shadow-inner relative overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <code className="text-[11px] font-black text-text-main font-mono tracking-tight group-hover/item:text-electric transition-colors truncate">{color.toUpperCase()}</code>
                      <span className="text-[7px] uppercase font-black tracking-widest text-text-muted opacity-50">NODE_ {i+1}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-white/5 rounded-sm" />
                    <div className="space-y-1">
                      <div className="h-3 w-16 bg-white/5 rounded-sm" />
                      <div className="h-2 w-10 bg-white/5 rounded-sm opacity-50" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Logs Console */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card overflow-hidden group"
          >
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-electric" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  System_Journal // v4.0.1
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-electric animate-pulse" />
            </div>
            <div className="p-5 bg-black/40 font-mono text-[9px] h-[220px] overflow-y-auto custom-scrollbar space-y-1.5">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 group/log opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-electric/40 select-none shrink-0">{">"}</span>
                  <span className="text-text-dim group-hover/log:text-text-main leading-relaxed">{log}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Specification */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card h-full flex flex-col relative overflow-hidden min-h-[700px] group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-electric/10 transition-colors" />
            
            {/* Tabs & Actions Header */}
            <div className="px-8 py-4 border-b border-border-main flex items-center justify-between bg-white/[0.03] flex-wrap gap-4 z-10">
              <div className="flex bg-surface border border-border-main p-1 rounded-sm flex-wrap">
                {(['synthesis', 'markdown', 'tailwind', 'css', 'tokens'] as OutputFormat[]).map((format) => {
                  if (format === 'synthesis' && !synthesis) return null;
                  return (
                    <button 
                      key={format}
                      onClick={() => setActiveFormat(format)}
                      className={cn(
                        "px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-2.5",
                        activeFormat === format ? "bg-electric text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      {format === 'synthesis' && <Code className="w-3.5 h-3.5" />}
                      {format === 'markdown' && <Eye className="w-3.5 h-3.5" />}
                      {format === 'tailwind' && <Box className="w-3.5 h-3.5" />}
                      {format === 'css' && <Hash className="w-3.5 h-3.5" />}
                      {format === 'tokens' && <Database className="w-3.5 h-3.5" />}
                      {format.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="p-2.5 bg-surface border border-border-main hover:border-electric/50 rounded-sm transition-all text-text-muted hover:text-electric"
                  title="Copy to Clipboard"
                >
                  {copying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="p-2.5 bg-surface border border-border-main hover:border-electric/50 rounded-sm transition-all text-text-muted hover:text-electric" 
                  title="Download Document"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportFigma}
                  className="p-2.5 bg-surface border border-border-main hover:border-electric/50 rounded-sm transition-all text-text-muted hover:text-[#0acf83]" 
                  title="Export to Figma (Tokens Studio)"
                >
                  <Figma className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportZip}
                  className="px-4 py-2.5 bg-electric text-white font-black uppercase text-[9px] tracking-widest rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2 group/zip"
                  title="Export All Assets as ZIP"
                >
                  <FileArchive className="w-4 h-4 group-hover/zip:rotate-12 transition-transform" />
                  <span>Export ZIP</span>
                </motion.button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative">
              <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
              
              <div className="relative z-10">
                {(result || synthesis) ? (
                  activeFormat === 'synthesis' && synthesis ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6 p-8 bg-electric/[0.03] border border-electric/20 rounded-sm relative overflow-hidden group/synth">
                        <div className="absolute inset-0 bg-gradient-to-r from-electric/5 to-transparent opacity-0 group-hover/synth:opacity-100 transition-opacity" />
                        <div className="w-14 h-14 flex-shrink-0 bg-electric/10 flex items-center justify-center border border-electric/20 transform -skew-x-12">
                          <Code className="w-7 h-7 text-electric skew-x-12" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 bg-electric/10 text-electric text-[8px] font-black uppercase tracking-widest rounded-sm border border-electric/20">Synthesized_Active</span>
                            <h4 className="text-sm font-black uppercase tracking-[0.1em] text-text-main">{synthesis.componentName}</h4>
                          </div>
                          <p className="text-xs text-text-muted font-medium italic opacity-70 leading-relaxed">"{synthesis.explanation}"</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-electric rounded-full animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Neural_Output_Stream</span>
                           </div>
                           <span className="text-[8px] font-mono text-text-dim/40 uppercase tracking-widest">TSX / Tailwind / Motion</span>
                        </div>
                        <div className="relative">
                          <div className="absolute top-4 right-4 flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-red-500/20" />
                             <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                             <div className="w-2 h-2 rounded-full bg-green-500/20" />
                          </div>
                          <pre className="font-mono text-[11px] text-text-main leading-relaxed bg-black/50 p-8 border border-border-main overflow-x-auto whitespace-pre custom-scrollbar rounded-sm shadow-2xl">
                            <code className="text-text-main">{synthesis.code}</code>
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  ) : activeFormat === 'markdown' && result ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-sm prose-invert max-w-none prose-headings:tracking-tighter prose-h1:text-4xl prose-h1:font-black prose-h2:uppercase prose-h2:tracking-[0.3em] prose-h2:text-[11px] prose-p:text-text-muted prose-p:leading-relaxed prose-li:text-text-muted prose-strong:text-electric"
                    >
                       <ReactMarkdown 
                        components={{
                          h1: ({children}) => <h1 className="flex items-center gap-4 mb-12"><span className="w-10 h-1 bg-electric" />{children}</h1>,
                          h2: ({children}) => <h2 className="mt-20 mb-8 border-l-4 border-electric/30 pl-6 bg-white/[0.02] py-4">{children}</h2>,
                          ul: ({children}) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 list-none p-0">{children}</ul>,
                          li: ({children}) => (
                            <li className="flex items-center gap-4 p-4 bg-white/[0.02] border border-border-main group hover:border-electric/30 transition-colors">
                              <div className="w-1.5 h-1.5 bg-electric/20 group-hover:bg-electric transition-colors" />
                              <span className="text-[11px] font-medium uppercase tracking-wider">{children}</span>
                            </li>
                          ),
                          img: ({src, alt}) => src && src.trim() !== "" ? (
                            <div className="my-12 relative group/img">
                              <div className="absolute -inset-1 bg-electric/10 blur opacity-0 group-hover/img:opacity-100 transition-opacity" />
                              <img src={src} alt={alt} className="relative max-w-full h-auto rounded-sm border border-border-main grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                            </div>
                          ) : null,
                          code: ({children}) => <code className="bg-electric/10 text-electric px-2 py-0.5 font-mono text-[10px] border border-electric/20 rounded-sm">{children}</code>
                        }}
                      >
                        {result.markdown}
                      </ReactMarkdown>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-border-main pb-4">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-electric">{activeFormat.toUpperCase()}_CONFIGURATION</span>
                         <span className="text-[8px] font-mono text-text-dim/30">READ_ONLY_PROTOCOL</span>
                      </div>
                      <pre className="font-mono text-[11px] text-text-dim/80 leading-relaxed bg-black/30 p-8 border border-white/5 overflow-x-auto whitespace-pre-wrap custom-scrollbar rounded-sm">
                        <code>{activeFormat === 'tailwind' ? result.tailwind : activeFormat === 'css' ? result.cssVariables : JSON.stringify(result.tokens, null, 2)}</code>
                      </pre>
                    </motion.div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-10">
                    <div className="relative">
                      <Cpu className="w-20 h-20 text-electric/5 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-px bg-electric/10 animate-ping" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[12px] font-black uppercase tracking-[0.6em] text-electric">Awaiting_Neural_Sequence</p>
                      <p className="max-w-xs mx-auto text-[10px] text-text-dim/60 font-black uppercase tracking-widest leading-relaxed">
                        Input valid URL target to initialize architectural probe and synthesis protocols.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
