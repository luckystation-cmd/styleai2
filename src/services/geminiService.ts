export interface ExtractionResult {
  markdown: string;
  tailwind: string;
  cssVariables: string;
  tokens: any;
  screenshot?: string | null;
}

export interface SynthesisResult {
  code: string;
  explanation: string;
  componentName: string;
}

export async function synthesizeUI(
  extraction: ExtractionResult,
  url: string
): Promise<SynthesisResult> {
  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraction, url }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'UI Synthesis failed' }));
    throw new Error(errData.error || 'UI Synthesis failed');
  }

  return response.json();
}

export async function extractDesignSystem(
  url: string,
  designData: any,
  screenshot: string | null,
  skill: string
): Promise<ExtractionResult> {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, designData, screenshot, skill }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Design Extraction failed' }));
    throw new Error(errData.error || 'System Extraction failed');
  }

  const result = await response.json();
  
  if (screenshot) {
    result.screenshot = screenshot;
  }

  if (screenshot && result.markdown) {
    result.markdown = result.markdown.replace(/\{\{SCREENSHOT_URL\}\}/g, screenshot);
  }

  return result;
}
