/** Google Fonts families that are fetched only when an entry needs them. */
const LAZY_FAMILIES: Record<string, string> = {
  'Noto Serif JP': 'Noto+Serif+JP:wght@400;500',
  'Noto Serif SC': 'Noto+Serif+SC:wght@400;500',
  'Noto Serif KR': 'Noto+Serif+KR:wght@400;500',
  'Noto Naskh Arabic': 'Noto+Naskh+Arabic:wght@400;500',
  'Noto Serif Hebrew': 'Noto+Serif+Hebrew:wght@400;500',
  'Noto Serif Devanagari': 'Noto+Serif+Devanagari:wght@400;500',
};

const stylesheets = new Map<string, Promise<void>>();
const TIMEOUT_MS = 2500;

function loadStylesheet(family: string): Promise<void> {
  let pending = stylesheets.get(family);
  if (!pending) {
    pending = new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${LAZY_FAMILIES[family]}&display=swap`;
      link.onload = link.onerror = () => resolve();
      document.head.append(link);
    });
    stylesheets.set(family, pending);
  }
  return pending;
}

/**
 * Resolve once `family` can render `sample` (or after a timeout, so a slow
 * network never blocks the page — the browser swaps the font in later).
 */
export function ensureFont(family: string, sample: string): Promise<void> {
  const ready = (async () => {
    if (family in LAZY_FAMILIES) await loadStylesheet(family);
    await document.fonts.load(`400 1em "${family}"`, sample);
  })().catch(() => {});
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_MS));
  return Promise.race([ready, timeout]);
}
