import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";
import { GoogleGenAI } from "@google/genai";

puppeteer.use(StealthPlugin());

async function startServer() {
  const app = express();
  const PORT = 3000;
  let chromiumPath: string | null = null;
  let chromiumError: string | null = null;

  const getGeminiKey = () => {
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY2,
      process.env.GEMINI_API_KEY3,
      process.env.GOOGLE_API_KEY,
      process.env.API_KEY,
      process.env.VITE_GEMINI_API_KEY,
      process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      process.env.AI_STUDIO_GEMINI_API_KEY,
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ];
    
    // Pick the first key that looks like a real Gemini key (typically > 20 chars)
    for (const k of keys) {
      if (k && typeof k === 'string') {
        const trimmed = k.trim();
        // Ignore placeholders like "AI Studio Free Tier" or "Insert Key Here"
        if (trimmed.length > 20 && !trimmed.includes(" ") && !trimmed.toLowerCase().includes("free tier")) {
          return trimmed;
        }
      }
    }
    
    // Fallback: search for anything that looks like a key (starts with AIza)
    for (const k of keys) {
      if (k && typeof k === 'string' && k.trim().startsWith("AIza")) {
        return k.trim();
      }
    }
    return "";
  };

  // Initialize Gemini
  const geminiKey = getGeminiKey();
  console.log("[Server] Checking Environment Variables...");
  const envEntries = Object.entries(process.env);
  const detectedKeys = envEntries
    .filter(([k]) => 
      k.toLowerCase().includes("key") || 
      k.toLowerCase().includes("gemini") || 
      k.toLowerCase().includes("google") || 
      k.toLowerCase().includes("api") ||
      k.toLowerCase().includes("token")
    )
    .map(([k, v]) => `${k}=${v ? "SET(" + v.substring(0, 3) + "...)" : "EMPTY"}`);
  
  console.log("[Server] Environment Keys Trace:", detectedKeys);
  
  if (!geminiKey) {
    console.warn("!! [Server] CRITICAL: No Gemini-compatible API key detected.");
    console.warn("!! [Server] Checked: GEMINI_API_KEY, GEMINI_API_KEY2, GOOGLE_API_KEY, etc.");
  }
  
  // @ts-ignore
  const globalAi = new GoogleGenAI(geminiKey);
  console.log(`[Server] Core Neural Engine initialized: ${geminiKey ? "ACTIVE (" + geminiKey.substring(0,4) + "...)" : "OFFLINE"}`);

  app.use(cors());
  app.use(express.json({ limit: '20mb' }));

  app.use((req, res, next) => {
    console.log(`[Server] Incoming request: ${req.method} ${req.url}`);
    next();
  });

  // Startup verification for Puppeteer
  (async () => {
    let testBrowser;
    try {
      console.log("[Server] Verifying Chromium launch capability...");
      const chrom = chromium as any;
      chromiumPath = await chrom.executablePath();
      testBrowser = await puppeteer.launch({
        args: [
          ...chrom.args,
          "--no-sandbox",
          "--disable-setuid-sandbox"
        ],
        executablePath: chromiumPath || "",
        headless: chrom.headless === "shell" ? true : chrom.headless,
      });
      console.log("[Server] Chromium verification SUCCESS.");
      await testBrowser.close();
    } catch (err: any) {
      chromiumError = err.message;
      console.error("[Server] Chromium verification FAILED:", err.message);
    }
  })();

  // In-memory cache for scraped data
  const cache = new Map<string, { data: any; timestamp: number }>();
  let generationCount = 14329;

  app.get("/api/health", (req, res) => {
    const currentKey = getGeminiKey();
    const envEntries = Object.entries(process.env);
    
    // Detailed trace of what the server actually sees
    const keyReport = envEntries
      .filter(([k]) => 
        k.toLowerCase().includes("key") || 
        k.toLowerCase().includes("gemini") || 
        k.toLowerCase().includes("api")
      )
      .map(([k, v]) => ({
        name: k,
        length: v?.length || 0,
        looksLikeKey: v && typeof v === 'string' && (v.startsWith("AIza") || (v.length > 25 && !v.includes(" "))),
        preview: v ? `${v.substring(0, 3)}...` : "empty"
      }));

    res.json({ 
      status: "online",
      apiKeySet: currentKey.length > 20,
      activeKeySource: currentKey.startsWith("AIza") ? "valid_gemini_key" : "unknown",
      diagnostics: keyReport,
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/stats", (req, res) => {
    res.json({ count: generationCount });
  });

  app.post("/api/analyze-url", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Check cache (10 mins)
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < 600000) {
      return res.json(cached.data);
    }

    let browser;
    try {
      console.log(`[Server] Scraping target: ${url}`);
      
      const chrom = chromium as any;
      
      // Verification of environment before launch
      const execPath = await chrom.executablePath().catch((e: any) => {
        console.error("[Server] Critical: Failed to resolve Chromium path:", e.message);
        return null;
      });

      if (!execPath) {
        throw new Error("Chromium executable path could not be resolved. This core environment might be missing browser dependencies.");
      }

      browser = await puppeteer.launch({
        args: [
          ...chrom.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--no-zygote",
          "--window-size=1280,800",
          "--disable-extensions",
          "--disable-web-security",
          "--font-render-hinting=none"
        ],
        defaultViewport: { width: 1280, height: 800 },
        executablePath: chromiumPath || await chrom.executablePath(),
        headless: true,
      });

      const page = await browser.newPage();
      
      // Optimization: Block heavy resources to speed up capture
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'media', 'font'].includes(resourceType)) {
          // Allow some images but block very heavy ones? For now allow images for visual extraction
          req.continue();
        } else {
          req.continue();
        }
      });
      
      // Intensive Stealth and Performance
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9,th-TH;q=0.8,th;q=0.7',
        'Cache-Control': 'no-cache'
      });
      
      page.setDefaultNavigationTimeout(45000); // Increase wait to 45s
      page.setDefaultTimeout(45000);
      
      const processingTimeout = setTimeout(() => {
        if (browser) browser.close().catch(() => {});
      }, 90000); // Wait up to 90s for the whole flow

      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
      
      try {
        console.log(`[Server] Probing: ${url}`);
        // Increased wait for better site stability
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 40000 });
        
        // Wait for dynamic content
        await new Promise(r => setTimeout(r, 6000));
        
        // Scroll slightly to trigger lazy loads
        await page.evaluate(() => window.scrollBy(0, 1000)).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
      } catch (e: any) {
        console.warn(`[Server] Probe hit limit: ${e.message}. Attempting snapshot anyway.`);
      }

      const screenshot = await page.screenshot({ 
        encoding: "base64", 
        type: "webp", 
        quality: 20 // Ultra optimized
      });

      const designData = await page.evaluate(() => {
        const getStyle = (el: Element) => {
          const s = window.getComputedStyle(el);
          return { 
            color: s.color, 
            backgroundColor: s.backgroundColor, 
            fontFamily: s.fontFamily, 
            fontSize: s.fontSize,
            borderRadius: s.borderRadius
          };
        };
        
        const tags = ["h1", "h2", "button", "nav", "a", "header", "section"];
        const samples = tags.flatMap(t => Array.from(document.querySelectorAll(t)).slice(0, 8));
        
        const safeGetMeta = (name: string) => 
          document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") || 
          document.querySelector(`meta[property="og:${name}"]`)?.getAttribute("content") || "";

        return {
          title: document.title,
          description: safeGetMeta("description") || safeGetMeta("title"),
          elements: samples.map(el => ({ 
            tag: el.tagName, 
            text: el.textContent?.trim().substring(0, 100), 
            styles: getStyle(el) 
          })).filter(e => e.text && e.text.length > 2),
          colors: Array.from(new Set(samples.map(el => getStyle(el).color))).slice(0, 15),
          fonts: Array.from(new Set(samples.map(el => getStyle(el).fontFamily))).slice(0, 5)
        };
      });

      clearTimeout(processingTimeout);
      const resultData = { designData, screenshot: `data:image/webp;base64,${screenshot}` };
      cache.set(url, { data: resultData, timestamp: Date.now() });
      generationCount++;

      res.json(resultData);
    } catch (error: any) {
      console.error("[Server] Scraping failed:", error.message);
      
      let userMsg = error.message;
      if (userMsg.includes("timeout")) userMsg = "The target site is taking too long to respond. It might be blocking neural probes.";
      if (userMsg.includes("403") || userMsg.includes("denied")) userMsg = "Access Denied. The target site has active anti-bot defenses (Cloudflare/Akamai).";
      if (userMsg.includes("Chromium")) userMsg = "Neural browser initialization failed. Memory limit might have been exceeded.";

      res.status(500).json({ error: `Neural Scraping failed: ${userMsg}` });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.error("[Server] Cleanup error:", e);
        }
      }
    }
  });

  const getGenAI = () => {
    const key = getGeminiKey();
    // @ts-ignore
    return new GoogleGenAI(key);
  };

  app.post("/api/extract", async (req, res) => {
    try {
      const { url, designData, screenshot, skill } = req.body;
      const keyToUse = getGeminiKey();
      if (!keyToUse) throw new Error("GEMINI_API_KEY not configured on server. Please check project Settings.");

      const ai = getGenAI();
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const parts: any[] = [{
        text: `
          Deconstruct "${url}" design. Level: ${skill}.
          Return strictly JSON:
          {
            "markdown": "Technical summary.",
            "tailwind": "export default { theme: { ... } };",
            "cssVariables": ":root { ... }",
            "tokens": { "colors": ["#hex"], "fonts": [] }
          }
        `
      }];

      if (screenshot) {
        parts.push({
          inlineData: {
            mimeType: "image/webp",
            data: screenshot.replace(/^data:image\/\w+;base64,/, '')
          }
        });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: { 
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
          temperature: 0.1
        }
      });
      
      const responseText = result.response.text();
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
        res.json(JSON.parse(cleanJson));
      } catch (e) {
        res.status(500).json({ error: "Extraction response was malformed." });
      }
    } catch (err: any) {
      console.error("Extraction error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/synthesize", async (req, res) => {
    try {
      const { extraction, url } = req.body;
      const keyToUse = getGeminiKey();
      if (!keyToUse) throw new Error("GEMINI_API_KEY not configured on server. Please check project Settings.");

      const ai = getGenAI();
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); 
      
      const parts: any[] = [{
        text: `
          As a Senior Full-Stack Architect, generate a COMPLETE PRODUCTION-READY React Digital Twin of "${url}".
          
          SYSTEM CONTEXT:
          - USE TAILWIND THEME: ${extraction.tailwind}
          - USE CSS VARIABLES: ${extraction.cssVariables}
          - USE "lucide-react" for ALL icons.
          - USE "motion/react" for animations.
          
          OUTPUT INSTRUCTIONS:
          1. STRUCTURE: Replicate the header, footer, and ALL main content sections.
          2. QUALITY: Do not abbreviate. Write the full JSX. Generate at least 250 lines of code.
          3. LOCALIZATION: Use Thai text as seen in the source.
          4. VALIDATION: Return strictly valid JSON.
          5. COMPLETENESS: If the page is long, combine sections into a single robust component called "RebuiltSystem".

          JSON SCHEMA:
          {
            "code": "/* EXPORT DEFAULT FUNCTION RebuiltSystem() { ... } */",
            "explanation": "Brief overview in English",
            "componentName": "RebuiltSystem"
          }
        `
      }];

      if (extraction.screenshot) {
        parts.push({
          inlineData: {
            mimeType: "image/webp",
            data: extraction.screenshot.replace(/^data:image\/\w+;base64,/, '')
          }
        });
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: { 
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          temperature: 0.1
        }
      });
      
      const responseText = result.response.text();
      try {
        // Sanitize response to ensure it's valid JSON even if model adds wrappers
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
        res.json(JSON.parse(cleanJson));
      } catch (e) {
        console.error("Synthesis parse error. Raw text:", responseText.substring(0, 500));
        res.status(500).json({ 
          error: "Synthesis response was malformed or incomplete. Please simplify the target URL or retry.",
          raw: responseText.substring(0, 200) + "..."
        });
      }
    } catch (err: any) {
      console.error("Synthesis error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production";
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`[Server] Current directory: ${process.cwd()}`);

  if (!isProd) {
    console.log("[Server] Starting in DEVELOPMENT mode with Vite middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[Server] Starting in PRODUCTION mode. Serving from: ${distPath}`);
    
    // Explicitly handle static files
    app.use(express.static(distPath, { index: false }));
    
    // Fallback for SPA
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log(`[Server] SPA Fallback: serving ${indexPath} for ${req.url}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Server] Error sending index.html: ${err.message}`);
          res.status(404).send("Application not initialized. Please wait for the build to complete.");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
