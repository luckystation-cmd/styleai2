#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import open from 'open';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';

// Polyfill for chalk if using older version
const logMessage = (msg: string) => console.log(msg);

const program = new Command();
const CONFIG_FILE = path.join(process.env.HOME || process.env.USERPROFILE || '', '.styleai', 'config.json');

const API_BASE_URL = 'https://api.styleai.app'; // Replace with actual backend endpoint

function getConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  }
  return null;
}

function saveConfig(config: any) {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

program
  .name('styleai')
  .description('Style AI Command Line Interface')
  .version('1.0.0');

// Login Command
program
  .command('login')
  .description('Authenticate with Style AI via browser')
  .action(async () => {
    const spinner = ora('Starting authentication...').start();
    try {
      // Mock OAuth Flow for local server
      const port = 3456;
      const proxyServer = http.createServer((req, res) => {
        const urlParams = new URLSearchParams(req.url?.split('?')[1]);
        const testToken = urlParams.get('token') || 'test-token-123';
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication Successful</h1><p>You can close this window and return to your terminal.</p>');
        proxyServer.close();

        saveConfig({ token: testToken, email: 'user@example.com' });
        spinner.succeed(`Successfully logged in. Session authorized.`);
        process.exit(0);
      });
      proxyServer.listen(port);
      
      const loginUrl = `${API_BASE_URL}/auth/cli?port=${port}`;
      // Fallback if not using a real endpoint:
      const mockLoginUrl = `http://localhost:${port}/callback?token=mock_oauth_token_789`;
      
      spinner.text = 'Opening browser to authenticate...';
      await open(mockLoginUrl);

    } catch (error: any) {
      spinner.fail(`Authentication failed: ${error.message}`);
    }
  });

program
  .command('logout')
  .description('Clear authenticated session')
  .action(() => {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      logMessage(chalk.green('✓ Logged out successfully.'));
    } else {
      logMessage(chalk.yellow('Already logged out.'));
    }
  });

program
  .command('whoami')
  .description('Check currently authenticated user')
  .action(() => {
    const config = getConfig();
    if (config && config.token) {
      logMessage(chalk.cyan(`Logged in as: ${config.email || 'Authorized User'}`));
      logMessage(chalk.gray(`Token footprint: ${config.token.substring(0, 8)}...`));
    } else {
      logMessage(chalk.red('Not logged in. Use `styleai login` to authenticate.'));
    }
  });

program
  .command('usage')
  .description('Check neural extraction credits')
  .action(async () => {
    const config = getConfig();
    if (!config) return logMessage(chalk.red('Please login first.'));
    const spinner = ora('Checking core status...').start();
    // Fake API call for demonstration
    setTimeout(() => {
      spinner.succeed('Status synchronized');
      logMessage(chalk.blue('Credits remaining: ') + chalk.bold.green('42'));
      logMessage(chalk.gray('Refills in 14 hours'));
    }, 1000);
  });

// Generate Command
program
  .command('generate')
  .description('Neural scrape a URL into a Design System')
  .argument('<url>', 'URL to process')
  .option('-l, --level <type>', 'Extraction intensity: basic | detailed | rebuild', 'rebuild')
  .option('-s, --synthesis', 'Trigger AI framework synthesis', false)
  .option('-o, --output <path>', 'Output directory', './styleai-export')
  .option('-f, --format <fmt>', 'Specific config format (markdown|tailwind|css|tokens)', 'all')
  .action(async (url, options) => {
    const config = getConfig();
    if (!config) return logMessage(chalk.red('Authentication required. Run `styleai login`.'));
    
    // Setup directory
    const outDir = path.resolve(process.cwd(), options.output);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const spinner = ora(`Analyzing ${url} [${options.level}]...`).start();
    
    try {
      // Logic for integration with the app's real API goes here
      // For demonstration, simulating network latency:
      await new Promise(r => setTimeout(r, 2000));
      spinner.text = 'Extracting typography and spatial parameters...';
      await new Promise(r => setTimeout(r, 1500));
      
      if (options.synthesis) {
        spinner.text = 'Synthesizing React abstractions...';
        await new Promise(r => setTimeout(r, 2000));
      }

      // Creating mock outputs
      if (options.format === 'all' || options.format === 'tailwind') {
        fs.writeFileSync(path.join(outDir, 'tailwind.config.js'), '// Synthesized Tailwind Config');
      }
      if (options.format === 'all' || options.format === 'css') {
        fs.writeFileSync(path.join(outDir, 'globals.css'), ':root { /* Neural Variables */ }');
      }

      spinner.succeed(`Extraction complete. Artifacts written to ${options.output}/`);

    } catch (err: any) {
      spinner.fail(`Extraction failed: ${err.message}`);
    }
  });

// Default behavior when typing `styleai [url]` without generate keyword
program
  .argument('[url]', 'Shorthand for generate')
  .action((url) => {
    if (url) {
      logMessage(chalk.gray(`> Redirecting to generate command for ${url}...`));
    } else {
      program.help();
    }
  });

program.parse(process.argv);
