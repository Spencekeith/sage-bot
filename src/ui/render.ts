import type { Culture, Wisdom } from '../core/types';
import { ensureFont } from './fonts';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const el = {
  wisdom: $('wisdom'),
  eyebrow: $('eyebrow'),
  original: $('original'),
  transliteration: $('transliteration'),
  translation: $('translation'),
  panelEyebrow: $('panel-eyebrow'),
  panelFacts: $<HTMLDListElement>('panel-facts'),
  panelNote: $('panel-note'),
  panelMeta: $('panel-meta'),
};

const FADE_MS = 280;
let renderToken = 0;

/** Fade the current wisdom out, wait for its font, then fade the new one in. */
export async function renderWisdom(wisdom: Wisdom, culture: Culture): Promise<void> {
  const token = ++renderToken;
  const hasContent = el.original.textContent !== '';
  el.wisdom.classList.add('is-leaving');

  await Promise.all([
    ensureFont(culture.font, wisdom.original),
    hasContent ? wait(FADE_MS) : Promise.resolve(),
  ]);
  if (token !== renderToken) return; // a newer render started meanwhile

  fillCard(wisdom, culture);
  fillPanel(wisdom, culture);
  el.wisdom.classList.remove('is-leaving');
}

function fillCard(wisdom: Wisdom, culture: Culture): void {
  document.documentElement.style.setProperty('--hue', String(culture.hue));
  el.wisdom.dataset.culture = culture.id;

  el.eyebrow.textContent = `${culture.name} · `;
  el.eyebrow.append(localized(culture.endonym, culture));

  el.original.textContent = wisdom.original;
  el.original.lang = culture.lang;
  el.original.dir = culture.dir;
  el.original.style.fontFamily = `"${culture.font}", "Source Serif 4", "Noto Serif", serif`;
  el.original.dataset.length = lengthClass(wisdom.original, culture);

  el.transliteration.textContent = wisdom.transliteration ?? '';
  el.transliteration.hidden = !wisdom.transliteration;
  el.transliteration.lang = wisdom.transliteration ? `${culture.lang.split('-')[0]}-Latn` : '';

  el.translation.textContent = wisdom.translation;
}

function fillPanel(wisdom: Wisdom, culture: Culture): void {
  el.panelEyebrow.textContent = `${capitalize(wisdom.type)} · ${culture.name} `;
  el.panelEyebrow.append(localized(`(${culture.endonym})`, culture));

  el.panelFacts.replaceChildren(
    ...fact('Meaning', wisdom.meaning),
    ...(wisdom.equivalent ? fact('Closest in English', wisdom.equivalent) : []),
  );
  el.panelNote.textContent = wisdom.note;

  const meta: string[] = [];
  if (wisdom.source) meta.push(`Source: ${wisdom.source}`);
  const romanization = wisdom.romanization ?? culture.romanization;
  if (wisdom.transliteration && romanization) meta.push(`Romanization: ${romanization}`);
  if (wisdom.review) meta.push('Awaiting native-speaker review');
  el.panelMeta.textContent = meta.join(' · ');
  el.panelMeta.hidden = meta.length === 0;
}

function fact(term: string, detail: string): HTMLElement[] {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = detail;
  return [dt, dd];
}

function localized(text: string, culture: Culture): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = text;
  span.lang = culture.lang;
  span.dir = culture.dir;
  return span;
}

/** Bucket by visual length so long sayings get a smaller size. CJK glyphs count double. */
function lengthClass(text: string, culture: Culture): 'short' | 'medium' | 'long' {
  const wide = ['ja', 'zh', 'ko'].includes(culture.id) ? 2 : 1;
  const units = [...text].length * wide;
  if (units <= 26) return 'short';
  if (units <= 44) return 'medium';
  return 'long';
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
