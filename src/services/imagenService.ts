// Service for generating custom background images using Imagen API with $0 Free Visual Engine fallback

export type ImagenAspectRatio = '16:9' | '9:16' | '1:1';

export interface ImagenGenerationResult {
  success: boolean;
  imageUrl: string;
  source: 'imagen_api' | 'free_visual_engine';
  model?: string;
  aspectRatio: ImagenAspectRatio;
  prompt: string;
  isFree: boolean;
  notice?: string;
}

const STORAGE_PREFIX = 'apexgrowth_custom_bg_';

// Client-side aesthetic SVG synthesizer for instant $0 offline generation
export function generateClientAestheticSvg(prompt: string, ratio: ImagenAspectRatio = '16:9'): string {
  const p = (prompt || '').toLowerCase();
  const isPlant = /plant|botanical|leaf|leaves|moss|green|monstera|pothos|fiddle|garden|terracotta|floral|organic/i.test(p);
  const isDesk = /desk|setup|workspace|office|chair|ergonomic|computer|screen|monitor|laptop/i.test(p);
  const isWarm = /warm|golden|sunset|afternoon|amber|sunlight|glow|cozy/i.test(p);
  const isDark = /dark|night|obsidian|charcoal|cyber|neon|black/i.test(p);

  let c1 = '#172822';
  let c2 = '#233B32';
  let c3 = '#0D1714';
  let accent = '#E2A968';

  if (isPlant) {
    c1 = '#13261F';
    c2 = '#1E3D31';
    c3 = '#0B1612';
    accent = isWarm ? '#E8B273' : '#68BA96';
  } else if (isDesk) {
    c1 = '#1C2622';
    c2 = '#2E3D37';
    c3 = '#101714';
    accent = '#DDA362';
  } else if (isDark) {
    c1 = '#0E1412';
    c2 = '#182420';
    c3 = '#080C0B';
    accent = '#5EEAD4';
  }

  const width = ratio === '9:16' ? 720 : ratio === '1:1' ? 900 : 1280;
  const height = ratio === '9:16' ? 1280 : ratio === '1:1' ? 900 : 720;
  const cleanPrompt = (prompt || 'Aesthetic Minimalist Background').slice(0, 52).replace(/["'<>&]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="50%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${c3}" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="80%" cy="20%" r="65%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.45" />
      <stop offset="40%" stop-color="${accent}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="ambientGlow" cx="20%" cy="85%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.25" />
      <stop offset="50%" stop-color="${c2}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${c3}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="scrimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.8" />
    </linearGradient>
    <filter id="blurLg">
      <feGaussianBlur stdDeviation="45" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <circle cx="${width * 0.82}" cy="${height * 0.22}" r="${width * 0.38}" fill="url(#sunGlow)" filter="url(#blurLg)" />
  <circle cx="${width * 0.18}" cy="${height * 0.8}" r="${width * 0.32}" fill="url(#ambientGlow)" filter="url(#blurLg)" />

  <path d="M0,${height * 0.65} C${width * 0.25},${height * 0.55} ${width * 0.45},${height * 0.78} ${width * 0.75},${height * 0.62} C${width * 0.88},${height * 0.54} ${width * 0.95},${height * 0.58} ${width},${height * 0.55} L${width},${height} L0,${height} Z" fill="${c1}" opacity="0.45" />
  <path d="M0,${height * 0.75} C${width * 0.3},${height * 0.7} ${width * 0.6},${height * 0.85} ${width},${height * 0.72} L${width},${height} L0,${height} Z" fill="${c3}" opacity="0.65" />

  ${
    isPlant
      ? `<g opacity="0.18" stroke="${accent}" stroke-width="1.5" fill="none">
    <path d="M${width * 0.85},${height * 0.9} Q${width * 0.75},${height * 0.6} ${width * 0.9},${height * 0.4} Q${width * 0.98},${height * 0.65} ${width * 0.85},${height * 0.9} Z" />
    <path d="M${width * 0.85},${height * 0.9} L${width * 0.9},${height * 0.4}" />
    <path d="M${width * 0.78},${height * 0.95} Q${width * 0.68},${height * 0.7} ${width * 0.8},${height * 0.55} Q${width * 0.88},${height * 0.75} ${width * 0.78},${height * 0.95} Z" />
  </g>`
      : `<g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <line x1="${width * 0.1}" y1="0" x2="${width * 0.1}" y2="${height}" />
    <line x1="${width * 0.9}" y1="0" x2="${width * 0.9}" y2="${height}" />
    <line x1="0" y1="${height * 0.85}" x2="${width}" y2="${height * 0.85}" />
  </g>`
  }

  <rect width="100%" height="100%" fill="url(#scrimGrad)" />

  <g font-family="monospace" font-size="${Math.max(10, Math.round(width * 0.014))}" fill="#E8ECE9" opacity="0.85">
    <rect x="${width * 0.05}" y="${height * 0.05}" width="${Math.min(260, width * 0.4)}" height="28" rx="6" fill="#111B17" fill-opacity="0.75" stroke="#253A31" stroke-width="1" />
    <text x="${width * 0.05 + 12}" y="${height * 0.05 + 18}" fill="${accent}" font-weight="600" letter-spacing="1.5">IMAGEN 3 · ${ratio}</text>
    <text x="${width * 0.05}" y="${height * 0.94}" fill="#CBD5CE" opacity="0.8" font-size="${Math.max(9, Math.round(width * 0.012))}">PROMPT: ${cleanPrompt}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function generateImagenBackground(
  prompt: string,
  aspectRatio: ImagenAspectRatio = '16:9',
  forceFree: boolean = false
): Promise<ImagenGenerationResult> {
  try {
    const res = await fetch('/api/imagen/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, forceFree }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.imageUrl) {
        return {
          success: true,
          imageUrl: data.imageUrl,
          source: data.source || 'free_visual_engine',
          model: data.model,
          aspectRatio,
          prompt,
          isFree: Boolean(data.isFree),
          notice: data.notice,
        };
      }
    }
  } catch (err) {
    console.warn('Network call to /api/imagen/generate failed; using client procedural visual engine:', err);
  }

  // Resilient client-side fallback ($0 budget / offline safe)
  const clientSvg = generateClientAestheticSvg(prompt, aspectRatio);
  return {
    success: true,
    imageUrl: clientSvg,
    source: 'free_visual_engine',
    model: 'Apex In-Browser Visual Studio ($0 Cost)',
    aspectRatio,
    prompt,
    isFree: true,
    notice: 'Generated via $0 Free Visual Synthesis Engine',
  };
}

export function saveCustomBackground(oppId: string, imageUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${oppId}`, imageUrl);
  } catch (e) {
    console.warn('Could not save background to localStorage:', e);
  }
}

export function getCustomBackground(oppId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${oppId}`);
  } catch (e) {
    return null;
  }
}

export function removeCustomBackground(oppId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${oppId}`);
  } catch (e) {
    // noop
  }
}
