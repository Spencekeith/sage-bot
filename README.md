# sage

Short wisdoms from around the world, shown in the original script, then
transliterated, then translated.

```
Волков бояться — в лес не ходить.
Volkov boyat'sya — v les ne khodit'.
If you're afraid of wolves, don't go into the forest.
```

- **↻ / Space / →**: another wisdom (no repeats until you've seen them all)
- **ⓘ / I**: learn more (meaning, closest English equivalent, cultural note)
- **Culture picker** (top right): limit to one culture; remembered between visits
- **`?w=<id>`**: every wisdom has its own shareable link

## Development

```sh
npm install
npm run dev        # local dev server
npm run validate   # check the data files
npm run build      # validate + typecheck + production build into dist/
```

It's a static site (Vite + plain TypeScript). Deploying to Vercel needs no
configuration: import the repo, and Vercel detects Vite.

## Layout

```
src/data/wisdoms.json   the content: one entry per saying
src/data/cultures.json  per-culture name, endonym, lang/dir, font, romanization system, accent hue
src/core/               data + picker logic, no DOM (reusable for an extension / app later)
src/ui/                 rendering, controls, lazy font loading
scripts/validate-data.ts
```

## Adding a wisdom

Add an object to `src/data/wisdoms.json`:

| field             | required | notes |
| ----------------- | -------- | ----- |
| `id`              | yes      | `<culture>-<short-slug>`, e.g. `ru-wolves-forest` |
| `culture`         | yes      | an id from `cultures.json` |
| `original`        | yes      | in the original script |
| `transliteration` | non-Latin scripts only | use the culture's romanization system |
| `translation`     | yes      | natural English rendering, shown on the card |
| `meaning`         | yes      | what it actually means |
| `equivalent`      | no       | closest English proverb, if there's a good one |
| `note`            | yes      | 1–3 sentences of context |
| `source`          | no       | e.g. `Analects 7.22` |
| `romanization`    | no       | overrides the culture default (e.g. Ancient Greek) |
| `type`            | yes      | `proverb`, `saying`, `idiom`, `parable` or `maxim` |
| `review`          | no       | `true` if a native speaker should check it |

Only add sayings that are genuinely used in the culture. Skip anything that
exists only as an English "ancient proverb" attribution. `npm run validate`
catches structural mistakes; accuracy needs a human.
