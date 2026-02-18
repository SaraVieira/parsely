const PLUS_RE = /\+/g;
const SLASH_RE = /\//g;
const PAD_RE = /=+$/;
const DASH_RE = /-/g;
const UNDERSCORE_RE = /_/g;

async function compressToBase64(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const stream = new Blob([encoder.encode(input)])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const compressed = await new Response(stream).arrayBuffer();
  const bytes = new Uint8Array(compressed);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary)
    .replace(PLUS_RE, '-')
    .replace(SLASH_RE, '_')
    .replace(PAD_RE, '');
}

async function decompressFromBase64(encoded: string): Promise<string> {
  const padded = encoded.replace(DASH_RE, '+').replace(UNDERSCORE_RE, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

function applySharePayload(payload: {
  j?: string;
  t?: string;
  r?: string;
}): void {
  if (payload.j || payload.t) {
    const state: Record<string, string> = {};
    if (payload.j) {
      JSON.parse(payload.j);
      state.jsonInput = payload.j;
    }
    if (payload.t) {
      state.transformCode = payload.t;
    }
    if (payload.r) {
      state.rootName = payload.r;
    }
    localStorage.setItem(
      'parsley-store',
      JSON.stringify({ state, version: 0 }),
    );
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Hydrate localStorage from a share URL hash before store initialization.
 * Supports both legacy (#share=) and compressed (#sharev2=) formats.
 */
export async function hydrateFromShareUrl(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const hash = window.location.hash;

  try {
    if (hash.startsWith('#sharev2=')) {
      const encoded = hash.slice(9);
      const json = await decompressFromBase64(encoded);
      const payload = JSON.parse(json);
      applySharePayload(payload);
    } else if (hash.startsWith('#share=')) {
      const encoded = hash.slice(7);
      const payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      applySharePayload(payload);
    }
  } catch {
    // Invalid share link, ignore
  }
}

/**
 * Encode the current JSON input and transform code into a compressed shareable URL.
 */
export async function createShareUrl(
  jsonInput: string,
  transformCode: string,
  rootName?: string,
): Promise<string> {
  const data: Record<string, string> = { j: jsonInput, t: transformCode };
  if (rootName && rootName !== 'Root') {
    data.r = rootName;
  }
  const payload = JSON.stringify(data);
  const encoded = await compressToBase64(payload);
  return `${window.location.origin}${window.location.pathname}#sharev2=${encoded}`;
}
