import culturesJson from '../data/cultures.json';
import wisdomsJson from '../data/wisdoms.json';
import type { Culture, Wisdom } from './types';

export const cultures = culturesJson as Culture[];
export const wisdoms = wisdomsJson as Wisdom[];

const cultureById = new Map(cultures.map((c) => [c.id, c]));

export function getCulture(id: string): Culture {
  const culture = cultureById.get(id);
  if (!culture) throw new Error(`Unknown culture: ${id}`);
  return culture;
}
