export type WisdomType = 'proverb' | 'saying' | 'idiom' | 'parable' | 'maxim';

export const WISDOM_TYPES: readonly WisdomType[] = ['proverb', 'saying', 'idiom', 'parable', 'maxim'];

export interface Wisdom {
  /** Stable id, prefixed with the culture id, e.g. "ru-wolves-forest". */
  id: string;
  culture: string;
  /** The saying in its original script. */
  original: string;
  /** Romanized form. Omitted for Latin-script languages. */
  transliteration?: string;
  /** Overrides the culture's default romanization system (e.g. Ancient Greek). */
  romanization?: string;
  /** Natural English rendering, shown on the main card. */
  translation: string;
  /** What it actually means / how it is used. */
  meaning: string;
  /** Closest English proverb or idiom, if there is a good one. */
  equivalent?: string;
  /** Short cultural or historical context, 1–3 sentences. */
  note: string;
  /** Textual source, when there is a known one. */
  source?: string;
  type: WisdomType;
  /** True when the entry still needs checking by a native speaker. */
  review?: boolean;
}

export interface Culture {
  id: string;
  /** English name, e.g. "Russian". */
  name: string;
  /** Name in the language itself, e.g. "Русский". */
  endonym: string;
  /** BCP 47 tag used for the lang attribute. */
  lang: string;
  dir: 'ltr' | 'rtl';
  /** Font family used for the original text. */
  font: string;
  /** Default romanization system; absent for Latin-script languages. */
  romanization?: string;
  /** Accent hue (0–360) used for small UI touches. */
  hue: number;
}
