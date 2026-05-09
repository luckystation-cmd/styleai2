import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';
import { useUser } from './hooks/useUser';
import { extractDesignSystem, synthesizeUI, ExtractionResult, SynthesisResult } from './services/geminiService';
import { playSound } from './lib/audio';
import { exportToFigmaTokens } from './lib/figma';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { motion, AnimatePresence } from "motion/react";
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ResultDisplay } from './components/ResultDisplay';
import { Footer } from './components/Footer';
import { InfoModal, RechargeModal } from './components/Modals';
import { Probe, OperationType } from './types';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { CLILandingPage } from './components/CLILandingPage';

type Skill = 'basic' | 'detailed' | 'rebuild';
type OutputFormat = 'markdown' | 'tailwind' | 'css' | 'synthesis' | 'tokens';

function MainApp() {
  const { 
    user, 
    credits, 
    isLoading: isAuthLoading, 
    error: authError,
    signIn, 
    signOut: handleLogout, 
    deductCredit, 
    rechargeCredits 
  } = useUser();

  const [url, setUrl] = useState('');
  const [skill, setSkill] = useState<Skill>('rebuild');
  const [shouldSynthesize, setShouldSynthesize] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [activeFormat, setActiveFormat] = useState<OutputFormat>('markdown');
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [stats, setStats] = useState(14329);
  const [copying, setCopying] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<{ title: string; content: string } | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);
  const [recentProbes, setRecentProbes] = useState<Probe[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('style-ai-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setSelectedInfo({
          title: "Environment Configuration Issue",
          content: "Firebase does not trust this domain yet. Please go to your Firebase Console -> Authentication -> Settings -> Authorized domains and add: ais-dev-3kdxrf7m5sy4wb7ca6tqie-391864878616.asia-southeast1.run.app and ais-pre-3kdxrf7m5sy4wb7ca6tqie-391864878616.asia-southeast1.run.app"
        });
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // user closed popup, ignore
      } else {
        setSelectedInfo({
          title: "Authentication Error",
          content: err.message || "Sign-in could not be completed."
        });
      }
    }
  };
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authError) {
      setSelectedInfo({
        title: "Authentication Error",
        content: authError
      });
    }
  }, [authError]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
    localStorage.setItem('style-ai-theme', theme);
  }, [theme]);

  // Fetch recent probes when user changes
  useEffect(() => {
    if (!user) {
      setRecentProbes([]);
      return;
    }

    const fetchProbes = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'probes'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(6)
        );
        
        const querySnapshot = await getDocs(q);
        const probes: Probe[] = [];
        querySnapshot.forEach((doc) => {
          probes.push({ id: doc.id, ...doc.data() } as Probe);
        });
        setRecentProbes(probes);
      } catch (error) {
        console.warn("Failed to fetch probes:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, 'probes');
        } catch (e) {
          // Silent catch to follow instructions of throwing but not crashing UI
        }
      }
    };

    fetchProbes();
  }, [user]);

  const [systemHealth, setSystemHealth] = useState<{ status: string; apiKeySet: boolean } | null>(null);

  useEffect(() => {
    const checkHealth = () => {
      fetch(`/api/health?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          setSystemHealth(data);
          if (!data.apiKeySet) {
            console.error("AI Configuration Missing: GEMINI_API_KEY is not set on the server.");
          }
        })
        .catch(err => {
          console.error("System health check failed:", err);
          setSystemHealth({ status: "offline", apiKeySet: false });
        });
    };

    checkHealth();
    
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data.count))
      .catch(() => {});

    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const handleTopUpSubmit = async () => {
    setIsSubmittingTopUp(true);
    const success = await rechargeCredits();
    if (success) {
      setIsTopUpOpen(false);
      setSelectedInfo({
        title: "Energy Reflected",
        content: "Neural allocation synchronized. +10 credits have been added to your core balance."
      });
    }
    setIsSubmittingTopUp(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!user) {
      setSelectedInfo({
        title: "Authorization Required",
        content: "Please log in with your Google account to access the neural extraction core."
      });
      return;
    }

    if (credits !== null && credits <= 0) {
      setSelectedInfo({
        title: "Credit Depleted",
        content: "Your neural allocation has been exhausted. Please reconnect later for re-synchronization."
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setSynthesis(null);
    setLogs(['Initializing analysis engine...']);
    playSound('scan');

    try {
      addLog(`Connecting to extraction server...`);
      
      // Check health before starting
      if (systemHealth && !systemHealth.apiKeySet) {
        throw new Error("Neural AI Core is not configured (API Key Missing). Please check server environment.");
      }

      const success = await deductCredit();
      if (!success) throw new Error("Neural allocation exhausted. Please recharge.");
      
      addLog(`Scraping target: ${url}...`);
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        console.error("Analysis API failed:", response.status, errData);
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const { designData, screenshot } = await response.json();
      if (screenshot) {
        addLog('Visual signature captured.');
      } else {
        addLog('Warning: Snapshot failed. Using structural data.');
      }
      
      addLog(`Initializing AI engine for ${skill.toUpperCase()} scan...`);
      const extraction = await extractDesignSystem(url, designData, screenshot, skill);
      
      addLog('Design tokens extracted successfully.');
      extraction.tokens = {
        ...extraction.tokens,
        ...designData
      };
      
      setResult(extraction);
      setExtractedColors(extraction.tokens.colors || []);
      
      // Save history
      try {
        addLog('Updating neural history...');
        let siteNameRaw = "NEURAL_NODE";
        const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
        if (domainMatch && domainMatch[1]) {
          siteNameRaw = domainMatch[1].split('.')[0].toUpperCase();
        }

        const newProbeData = {
          userId: user.uid,
          url: url,
          siteName: siteNameRaw,
          timestamp: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'probes'), newProbeData);
        const optimisticProbe = { 
          id: docRef.id, 
          ...newProbeData,
          screenshotUrl: screenshot,
          timestamp: { toDate: () => new Date() } 
        } as unknown as Probe;
        setRecentProbes(prev => [optimisticProbe, ...prev].slice(0, 6));
      } catch (err) {
        console.warn("History save failed:", err);
      }
      
      if (shouldSynthesize || skill === 'rebuild') {
        addLog('Synthesizing Visual Rebuild (Neural Twin)...');
        const synResult = await synthesizeUI(extraction, url);
        setSynthesis(synResult);
        setActiveFormat('synthesis');
        addLog('Visual Rebuild complete.');
      } else {
        addLog('Extraction complete.');
      }
      
      playSound('success');
      setStats(prev => prev + 1);

    } catch (err: any) {
      console.error("Extraction process failed:", err);
      addLog(`Critical Failure: ${err.message}`);
      playSound('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!result && !synthesis) return;
    let content = "";
    if (activeFormat === 'synthesis' && synthesis) {
      content = synthesis.code;
    } else if (result) {
      if (activeFormat === 'markdown') content = result.markdown;
      else if (activeFormat === 'tailwind') content = result.tailwind;
      else if (activeFormat === 'css') content = result.cssVariables;
      else if (activeFormat === 'tokens') content = JSON.stringify(result.tokens, null, 2);
    }
    if (!content) return;
    playSound('click');
    navigator.clipboard.writeText(content);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleDownload = () => {
    if (!result && !synthesis) return;
    let content = "";
    let ext = "";

    if (activeFormat === 'synthesis' && synthesis) {
      content = synthesis.code;
      ext = "tsx";
    } else if (result) {
      if (activeFormat === 'markdown') { content = result.markdown; ext = 'md'; }
      else if (activeFormat === 'tailwind') { content = result.tailwind; ext = 'ts'; }
      else if (activeFormat === 'css') { content = result.cssVariables; ext = 'css'; }
      else if (activeFormat === 'tokens') { content = JSON.stringify(result.tokens, null, 2); ext = 'json'; }
    }

    if (!content) return;
    playSound('click');
    const blob = new Blob([content], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `DESIGN_SYSTEM_${activeFormat.toUpperCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleExportFigma = () => {
    if (!result || !result.tokens) return;
    playSound('click');
    
    addLog('Generating Tokens Studio format for Figma...');
    const figmaJson = exportToFigmaTokens(result.tokens);
    const blob = new Blob([figmaJson], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `figma-tokens.json`;
    a.click();
    URL.revokeObjectURL(blobUrl);
    addLog('Exported to Figma (Tokens Studio) successfully.');
  };

  const handleExportZip = async () => {
    if (!result) return;
    playSound('click');
    
    addLog('Generating complete neural project structure...');
    const zip = new JSZip();
    const siteName = url.replace(/^https?:\/\//, '').split('/')[0].toUpperCase() || 'STYLE_AI';
    const folderName = `style-ai-rebuild-${siteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const project = zip.folder(folderName);
    
    if (project) {
      // 1. Root Boilerplate
      project.file(".gitignore", `node_modules
dist
.env
.DS_Store`);

      project.file("tsconfig.json", JSON.stringify({
        compilerOptions: {
          target: "ESNext",
          useDefineForClassFields: true,
          lib: ["DOM", "DOM.Iterable", "ESNext"],
          allowJs: false,
          skipLibCheck: true,
          esModuleInterop: false,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: "ESNext",
          moduleResolution: "Node",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx"
        },
        include: ["src"]
      }, null, 2));

      project.file("package.json", JSON.stringify({
        name: folderName,
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.344.0",
          "motion": "^12.0.0",
          "clsx": "^2.1.0",
          "tailwind-merge": "^2.2.1"
        },
        devDependencies: {
          "@types/react": "^18.2.66",
          "@types/react-dom": "^18.2.22",
          "@vitejs/plugin-react": "^4.2.1",
          "autoprefixer": "^10.4.18",
          "postcss": "^8.4.35",
          "tailwindcss": "^3.4.1",
          "typescript": "^5.2.2",
          "vite": "^5.2.2"
        }
      }, null, 2));

      project.file("vite.config.ts", `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`);

      project.file("index.html", `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Style AI - ${siteName} Rebuild</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

      project.file("postcss.config.js", `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

      let tailwindConfigString = result.tailwind;
      if (!tailwindConfigString.includes('content:')) {
        tailwindConfigString = tailwindConfigString.replace(/(module\.exports\s*=\s*{|export\s+default\s*{)/, (match) => `${match}\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],`);
      }
      project.file("tailwind.config.js", tailwindConfigString);
      project.file("design-tokens.json", JSON.stringify(result.tokens, null, 2));

      // 2. Source Code
      const src = project.folder("src");
      if (src) {
        src.file("main.tsx", `import React from 'react'
import ReactDom from 'react-dom/client'
import App from './App'
import './index.css'

ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

        src.file("index.css", `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
${result.cssVariables}
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
`);

        src.file("App.tsx", `import VisualRebuild from './components/VisualRebuild';

function App() {
  return (
    <div className="min-h-screen">
      <VisualRebuild />
    </div>
  );
}

export default App;`);

        src.file("lib/utils.ts", `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`);

        const components = src.folder("components");
        if (components) {
          components.file("VisualRebuild.tsx", synthesis ? synthesis.code : `export default function VisualRebuild() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Neural Extraction Complete</h1>
        <p className="text-gray-400">The design tokens, tailwind config, and CSS variables were extracted successfully.</p>
        <p className="text-gray-400 mt-2">Visual Rebuild synthesis was skipped for this scan.</p>
      </div>
    </div>
  );
}`);
        }
      }

      // 3. Documentation
      project.file("DESIGN_SYSTEM.md", result.markdown);
      project.file("README.md", `# Style AI Export: ${siteName}

This project was generated by **Style AI**. It is a neural reconstruction of ${url}.

## Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open the app**:
   Navigate to the local URL provided by Vite (usually \`http://localhost:5173\`).

## Structure

- \`src/components/VisualRebuild.tsx\`: The primary synthesized component.
- \`tailwind.config.js\`: Extracted design system tokens.
- \`src/index.css\`: Extracted global CSS variables.
- \`DESIGN_SYSTEM.md\`: Technical documentation of the extracted site.
`);
      
      const content = await zip.generateAsync({ type: "blob" });
      FileSaver.saveAs(content, `${folderName}.zip`);
      addLog('Neural project archive transmitted and ready for deployment.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col font-sans selection:bg-electric selection:text-white overflow-x-hidden">
      <Header 
        user={user} 
        credits={credits} 
        theme={theme} 
        setTheme={setTheme} 
        handleLogin={handleLogin} 
        handleLogout={handleLogout}
        openTopUp={() => setIsTopUpOpen(true)}
        systemHealth={systemHealth}
      />

      {systemHealth && !systemHealth.apiKeySet && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-500/10 border-b border-red-500/30 py-2 px-4 flex items-center justify-center gap-3 z-40"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Critical: Neural API Key Missing. Please add GEMINI_API_KEY in Settings & Restart Server.
          </span>
        </motion.div>
      )}

      <main className="flex-1 flex flex-col items-center">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-electric/5 blur-[150px] rounded-full" />
        </div>

        <Hero 
          url={url} 
          setUrl={setUrl} 
          skill={skill} 
          setSkill={setSkill} 
          shouldSynthesize={shouldSynthesize}
          setShouldSynthesize={setShouldSynthesize}
          isAnalyzing={isAnalyzing} 
          handleGenerate={handleGenerate} 
          recentProbes={recentProbes}
        />

        <ResultDisplay 
          url={url}
          result={result}
          synthesis={synthesis}
          isAnalyzing={isAnalyzing}
          activeFormat={activeFormat}
          setActiveFormat={setActiveFormat}
          extractedColors={extractedColors}
          logs={logs}
          logEndRef={logEndRef}
          copying={copying}
          handleCopy={handleCopy}
          handleDownload={handleDownload}
          handleExportZip={handleExportZip}
          handleExportFigma={handleExportFigma}
        />
      </main>

      <Footer onOpenInfo={(title, content) => setSelectedInfo({ title, content })} />

      <InfoModal 
        info={selectedInfo} 
        isAuthenticated={!!user} 
        onClose={() => setSelectedInfo(null)} 
        onLogin={handleLogin}
      />

      <RechargeModal 
        isOpen={isTopUpOpen} 
        isSubmitting={isSubmittingTopUp} 
        onClose={() => setIsTopUpOpen(false)} 
        onSubmit={handleTopUpSubmit} 
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/cli" element={<CLILandingPage />} />
      </Routes>
    </Router>
  );
}

