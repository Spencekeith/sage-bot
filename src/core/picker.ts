import type { Wisdom } from './types';

/**
 * Hands out wisdoms in a shuffled order without repeats until the pool is
 * exhausted, then reshuffles (never repeating the last one back-to-back).
 */
export class Picker {
  private pool: Wisdom[] = [];
  private queue: Wisdom[] = [];
  private current: Wisdom | null = null;
  private filter: string | null = null;

  constructor(
    private readonly all: readonly Wisdom[],
    private readonly random: () => number = Math.random,
  ) {
    this.setFilter(null);
  }

  /** Restrict to one culture id, or null for all cultures. */
  setFilter(cultureId: string | null): void {
    const pool = cultureId ? this.all.filter((w) => w.culture === cultureId) : [...this.all];
    this.filter = pool.length > 0 ? cultureId : null;
    this.pool = pool.length > 0 ? pool : [...this.all];
    this.queue = [];
  }

  getFilter(): string | null {
    return this.filter;
  }

  byId(id: string): Wisdom | undefined {
    return this.all.find((w) => w.id === id);
  }

  /** Mark a wisdom as shown (e.g. from a deep link) so it isn't dealt again this round. */
  show(wisdom: Wisdom): Wisdom {
    this.current = wisdom;
    this.queue = this.queue.filter((w) => w.id !== wisdom.id);
    return wisdom;
  }

  next(): Wisdom {
    if (this.queue.length === 0) this.refill();
    return this.show(this.queue.shift()!);
  }

  private refill(): void {
    // The wisdom on screen goes to the back of the new round, so it is never
    // dealt back-to-back and a deep-linked one isn't repeated early.
    const current = this.current;
    const deck = shuffle(this.pool, this.random);
    const rest = deck.filter((w) => w.id !== current?.id);
    this.queue = rest.length > 0 && rest.length < deck.length ? [...rest, current!] : deck;
  }
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
