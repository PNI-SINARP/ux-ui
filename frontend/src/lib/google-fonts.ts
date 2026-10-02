/**
 * Descarga archivos .woff2 reales de Google Fonts — misma lógica que ya se
 * usó en el pipeline de export-design-tokens.mjs del geovisor (ver
 * geovisor-dinarp-app), adaptada a TypeScript/Route Handler. Server-only.
 */

const WEIGHTS = [400, 500, 600, 700];

export interface FontFile {
  weight: number;
  filename: string;
  buffer: Buffer;
}

/** Consulta la API css2 de Google Fonts y devuelve peso -> URL del .woff2 (subset "latin"). */
async function fetchFontUrls(family: string, weights: number[]): Promise<Map<number, string>> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`;
  // User-Agent moderno: sin esto Google devuelve woff/ttf en vez de woff2.
  const res = await fetch(cssUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`Google Fonts respondió ${res.status} para ${family}`);
  const css = await res.text();

  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  const urls = new Map<number, string>();
  for (const block of blocks) {
    // Subset "latin" estándar (unicode-range U+0000-00FF) — cubre español.
    if (!/unicode-range:\s*U\+0000-00FF/.test(block)) continue;
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const urlMatch = block.match(/url\(([^)]+)\)\s*format\('woff2'\)/);
    if (weightMatch && urlMatch) urls.set(Number(weightMatch[1]), urlMatch[1]);
  }
  return urls;
}

/** Descarga los .woff2 (pesos 400/500/600/700) de una familia tipográfica. */
export async function downloadGoogleFont(family: string): Promise<FontFile[]> {
  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const urls = await fetchFontUrls(family, WEIGHTS);

  const files: FontFile[] = [];
  for (const weight of WEIGHTS) {
    const url = urls.get(weight);
    if (!url) continue;
    const res = await fetch(url);
    if (!res.ok) continue;
    const buffer = Buffer.from(await res.arrayBuffer());
    files.push({ weight, filename: `${slug}-${weight}.woff2`, buffer });
  }
  if (files.length === 0) throw new Error(`No se pudo descargar ningún peso para "${family}"`);
  return files;
}
