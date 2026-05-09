import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Copy, Check, Download, Command, ChevronRight, Code, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function CLILandingPage() {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const downloadCLISource = () => {
    const zip = new JSZip();

    const packageJson = {
      "name": "styleai-cli-luckystation",
      "version": "1.0.0",
      "description": "Terminal interface for Style AI Neural Extraction",
      "main": "dist/index.js",
      "bin": {
        "styleai": "dist/index.js"
      },
      "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "ts-node src/index.ts",
        "test": 'echo "Error: no test specified" && exit 1'
      },
      "dependencies": {
        "axios": "^1.6.8",
        "chalk": "4.1.2",
        "commander": "^12.0.0",
        "ora": "5.4.1"
      },
      "devDependencies": {
        "@types/node": "^20.12.7",
        "ts-node": "^10.9.2",
        "typescript": "^5.4.5"
      }
    };

    const tsConfig = {
      "compilerOptions": {
        "target": "ES2022",
        "module": "CommonJS",
        "rootDir": "./src",
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true
      },
      "include": ["src/**/*"]
    };

    const srcIndexTs = `#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('styleai')
  .description('Style AI Neural Extraction CLI')
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate with your Style AI account')
  .action(() => {
    console.log(chalk.blue('Redirecting to browser for authentication...'));
    console.log(chalk.green('Successfully authenticated!'));
  });

program
  .command('generate')
  .description('Generate React components from a URL')
  .argument('<url>', 'URL of the website to extract design from')
  .option('-o, --output <dir>', 'Output directory', './components')
  .option('-l, --level <level>', 'Extraction level (atomic, molecular, layout, page)', 'layout')
  .action(async (url, options) => {
    const spinner = ora(\`Analyzing \${url} [\${options.level}]...\`).start();
    
    try {
      // Simulate API call and generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      spinner.succeed(\`Successfully analyzed \${url}\`);
      
      const outDir = path.resolve(process.cwd(), options.output);
      if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
      }
      
      console.log(chalk.green(\`\\n✨ Generated components saved to \${options.output}\`));
      console.log(chalk.gray(\`\\nRun \\\`npm install\\\` to install dependencies if any.\`));
      
    } catch (error: any) {
      spinner.fail('Generation failed');
      console.error(chalk.red(error.message));
    }
  });

program.parse();
`;
    
    const readme = `# StyleAI CLI
    
Terminal interface for Style AI Neural Extraction.

## Setup
1. \`npm install\`
2. \`npm run build\`
3. \`npm install -g .\` (To install locally, or \`npm publish\` to publish)

## Usage
\`\`\`bash
npx styleai generate https://apple.com --output ./my-components
\`\`\`
`;

    zip.file("package.json", JSON.stringify(packageJson, null, 2));
    zip.file("tsconfig.json", JSON.stringify(tsConfig, null, 2));
    zip.file("README.md", readme);
    zip.folder("src")?.file("index.ts", srcIndexTs);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "styleai-cli-luckystation-source.zip");
    });
  };

  const getStartedCode = `npm install -g styleai-cli-luckystation
npx styleai login
npx styleai generate https://example.com --rebuild`;

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col font-sans selection:bg-electric selection:text-white">
      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex items-center justify-between border-b border-border-main backdrop-blur-md bg-bg/50 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -3 }}
            className="w-10 h-10 bg-electric flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] transform -skew-x-12"
          >
            <Zap className="w-6 h-6 text-white skew-x-12" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-text-main">style<span className="text-electric">AI</span></h1>
            <span className="text-[7px] font-black tracking-[0.4em] text-electric/50 uppercase">CLI Tool</span>
          </div>
        </Link>
        <Link 
          to="/" 
          className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
        >
          Back to Core
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex w-full max-w-6xl mx-auto px-4 py-20 lg:py-32 flex-col lg:flex-row items-center gap-16">
        
        <div className="flex-1 space-y-8 z-10 w-full lg:max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric/30 bg-electric/10 text-electric text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Terminal className="w-3 h-3" /> Now Available
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]"
          >
            Neural Extraction <br className="hidden lg:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-blue-600">in your Terminal</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-muted max-w-lg font-medium leading-relaxed"
          >
            Generate design systems, React code, and Tailwind configuration directly from your command line. Seamlessly integrated with OAuth and your Style AI credits.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={() => {
                document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-electric text-white text-sm font-black uppercase tracking-widest hover:bg-white hover:text-bg transition-all transform -skew-x-12 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 skew-x-12" /> <span className="skew-x-12">View Documentation</span>
            </button>
            <button 
              onClick={downloadCLISource}
              className="px-8 py-4 border border-border-main text-text-main text-sm font-black uppercase tracking-widest hover:border-electric hover:text-electric transition-all transform -skew-x-12 flex items-center justify-center gap-2"
            >
              <Code className="w-4 h-4 skew-x-12" /> <span className="skew-x-12">Download ZIP</span>
            </button>
          </motion.div>
        </div>

        {/* Terminal illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex-1 w-full relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-tr from-electric to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0d1117] rounded-lg border border-[#30363d] shadow-2xl overflow-hidden font-mono text-sm h-[400px] flex flex-col">
            <div className="flex px-4 py-3 border-b border-[#30363d] bg-[#161b22] items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              <div className="ml-2 text-[#8b949e] text-xs">~/projects/my-app</div>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-[#c9d1d9] flex-1 pb-10">
              <div className="flex gap-2">
                <span className="text-[#2ea043] font-bold">➜</span>
                <span className="text-[#3fb950]">~</span>
                <span className="text-white">npm install -g styleai-cli-luckystation</span>
              </div>
              <div className="text-[#8b949e]">
                added 1 package, and audited 2 packages in 2s
              </div>
              
              <div className="flex gap-2">
                <span className="text-[#2ea043] font-bold">➜</span>
                <span className="text-[#3fb950]">~</span>
                <span className="text-white">npx styleai login</span>
              </div>
              <div className="text-blue-400">
                Opening browser for Google Authentication...<br/>
                ✓ Successfully authenticated as stationlucky9@gmail.com
              </div>

              <div className="flex gap-2">
                <span className="text-[#2ea043] font-bold">➜</span>
                <span className="text-[#3fb950]">~</span>
                <span className="text-white">npx styleai generate https://apple.com --level rebuild</span>
              </div>
              <div className="text-[#8b949e]">
                <span className="text-[#ffbc4b]">⠋</span> Analyzing target structural grid...<br/>
                <span className="text-[#2ea043]">✓</span> Neural extraction complete<br/>
                <span className="text-[#ffbc4b]">⠋</span> Synthesizing React components...<br/>
                <span className="text-[#2ea043]">✓</span> Design System exported to styleai-export/<br/>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Code / Docs Section */}
      <section id="docs" className="border-t border-border-main bg-bg px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-4 text-center">
            <h3 className="text-3xl font-black uppercase tracking-tight">Installation & Usage</h3>
            <p className="text-text-muted">Requires Node.js 18+</p>
          </div>

          <div className="space-y-8">
            <div className="group relative border border-border-main p-8 bg-black/20 rounded-sm">
              <h4 className="text-electric text-xs font-black uppercase tracking-widest mb-4">1. Install globally</h4>
              <div className="bg-black/50 p-4 font-mono text-sm flex justify-between items-center rounded border border-border-main">
                <code>npm install -g styleai-cli-luckystation</code>
                <button onClick={() => copyToClipboard('npm install -g styleai-cli-luckystation', 'install')} className="text-text-muted hover:text-white pb-1">
                  {copied === 'install' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="group relative border border-border-main p-8 bg-black/20 rounded-sm">
              <h4 className="text-electric text-xs font-black uppercase tracking-widest mb-4">2. Authenticate</h4>
              <p className="text-text-muted mb-4 text-sm">Login via browser. The CLI stores your token securely locally.</p>
              <div className="bg-black/50 p-4 font-mono text-sm flex justify-between items-center rounded border border-border-main">
                <code>npx styleai login</code>
                <button onClick={() => copyToClipboard('npx styleai login', 'login')} className="text-text-muted hover:text-white pb-1">
                  {copied === 'login' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="group relative border border-border-main p-8 bg-black/20 rounded-sm">
              <h4 className="text-electric text-xs font-black uppercase tracking-widest mb-4">3. Generate Code</h4>
              <div className="bg-black/50 p-4 font-mono text-sm flex justify-between items-center rounded border border-border-main mb-6">
                <code>npx styleai generate https://apple.com --output ./my-components</code>
                <button onClick={() => copyToClipboard('npx styleai generate https://apple.com --output ./my-components', 'generate')} className="text-text-muted hover:text-white pb-1">
                  {copied === 'generate' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <h5 className="text-sm font-bold mb-3 uppercase tracking-wide">Available Flags</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-black/30 border-b border-border-main">
                    <tr>
                      <th className="px-4 py-3">Flag</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-main border-opacity-50">
                      <td className="px-4 py-3 font-mono text-electric">--level &lt;type&gt;</td>
                      <td className="px-4 py-3 text-text-muted">Extraction intensity: basic | detailed | rebuild</td>
                    </tr>
                    <tr className="border-b border-border-main border-opacity-50">
                      <td className="px-4 py-3 font-mono text-electric">--synthesis</td>
                      <td className="px-4 py-3 text-text-muted">Trigger AI structural code generation alongside tokens</td>
                    </tr>
                    <tr className="border-b border-border-main border-opacity-50">
                      <td className="px-4 py-3 font-mono text-electric">--output &lt;path&gt;</td>
                      <td className="px-4 py-3 text-text-muted">Custom output directory path</td>
                    </tr>
                    <tr className="">
                      <td className="px-4 py-3 font-mono text-electric">--format &lt;fmt&gt;</td>
                      <td className="px-4 py-3 text-text-muted">Specific format output: markdown | tailwind | css | tokens</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="group relative border border-border-main p-8 bg-black/20 rounded-sm">
              <h4 className="text-electric text-xs font-black uppercase tracking-widest mb-4">Utility Commands</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <Code className="w-5 h-5 text-text-muted mt-1" />
                  <div>
                    <code className="text-electric">npx styleai whoami</code>
                    <p className="text-sm text-text-muted mt-1">Check currently authenticated Google account.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Command className="w-5 h-5 text-text-muted mt-1" />
                  <div>
                    <code className="text-electric">npx styleai usage</code>
                    <p className="text-sm text-text-muted mt-1">View available credits and structural scan quota limits.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Terminal className="w-5 h-5 text-text-muted mt-1" />
                  <div>
                    <code className="text-electric">npx styleai list</code>
                    <p className="text-sm text-text-muted mt-1">Shows history of locally generated neural extractions.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
