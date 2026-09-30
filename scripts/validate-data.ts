import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Picker } from '../src/core/picker';
import { WISDOM_TYPES, type Culture, type Wisdom } from '../src/core/types';

const read = <T>(name: string): T =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../src/data/${name}`, import.meta.url)), 'utf8'));

const cultures = read<Culture[]>('cultures.json');
const wisdoms = read<Wisdom[]>('wisdoms.json');
const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

const cultureIds = new Set<string>();
for (const c of cultures) {
  if (cultureIds.has(c.id)) fail(`duplicate culture id "${c.id}"`);
  cultureIds.add(c.id);
  for (const key of ['name', 'endonym', 'lang', 'font'] as const) {
    if (!c[key]?.trim()) fail(`culture ${c.id}: missing ${key}`);
  }
  if (c.dir !== 'ltr' && c.dir !== 'rtl') fail(`culture ${c.id}: dir must be ltr or rtl`);
  if (!(c.hue >= 0 && c.hue <= 360)) fail(`culture ${c.id}: hue must be 0–360`);
}

const REQUIRED = ['id', 'culture', 'original', 'translation', 'meaning', 'note'] as const;
const OPTIONAL = ['transliteration', 'romanization', 'equivalent', 'source'] as const;
const KNOWN = new Set<string>([...REQUIRED, ...OPTIONAL, 'type', 'review']);
const ids = new Set<string>();
const perCulture = new Map<string, number>();

for (const w of wisdoms) {
  const label = w.id ?? JSON.stringify(w.original);
  for (const key of REQUIRED) {
    if (typeof w[key] !== 'string' || !w[key].trim()) fail(`${label}: missing ${key}`);
  }
  for (const key of OPTIONAL) {
    if (key in w && (typeof w[key] !== 'string' || !w[key]!.trim())) fail(`${label}: empty ${key}`);
  }
  for (const key of Object.keys(w)) {
    if (!KNOWN.has(key)) fail(`${label}: unknown field "${key}"`);
  }
  if (!WISDOM_TYPES.includes(w.type)) fail(`${label}: type must be one of ${WISDOM_TYPES.join(', ')}`);
  if (ids.has(w.id)) fail(`${label}: duplicate id`);
  ids.add(w.id);
  if (!/^[a-z]{2}-[a-z0-9]+(-[a-z0-9]+)*$/.test(w.id)) fail(`${label}: id must look like "xx-some-words"`);
  if (!cultureIds.has(w.culture)) {
    fail(`${label}: unknown culture "${w.culture}"`);
    continue;
  }
  if (!w.id.startsWith(`${w.culture}-`)) fail(`${label}: id must start with "${w.culture}-"`);
  const culture = cultures.find((c) => c.id === w.culture)!;
  if (culture.romanization && !w.transliteration) fail(`${label}: ${culture.name} entries need a transliteration`);
  if (!culture.romanization && w.transliteration) fail(`${label}: ${culture.name} is Latin-script, drop the transliteration`);
  perCulture.set(w.culture, (perCulture.get(w.culture) ?? 0) + 1);
}

for (const id of cultureIds) {
  if (!perCulture.get(id)) fail(`culture ${id} has no wisdoms`);
}

// Smoke-test the picker: a full round visits every entry exactly once.
const picker = new Picker(wisdoms);
const seen = new Set(Array.from({ length: wisdoms.length }, () => picker.next().id));
if (seen.size !== wisdoms.length) fail(`picker repeated entries within one round (${seen.size}/${wisdoms.length})`);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
const flagged = wisdoms.filter((w) => w.review).length;
console.log(
  `✓ ${wisdoms.length} wisdoms across ${cultures.length} cultures` +
    (flagged ? ` (${flagged} flagged for native-speaker review)` : ''),
);
