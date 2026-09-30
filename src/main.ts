import './styles.css';
import { cultures, getCulture, wisdoms } from './core/data';
import { Picker } from './core/picker';
import type { Wisdom } from './core/types';
import { initControls, setLearnOpen } from './ui/controls';
import { renderWisdom } from './ui/render';

const FILTER_KEY = 'sage:culture';

const picker = new Picker(wisdoms);
picker.setFilter(loadFilter());

function display(wisdom: Wisdom): void {
  const url = new URL(location.href);
  url.searchParams.set('w', wisdom.id);
  history.replaceState(null, '', url);
  setLearnOpen(false);
  void renderWisdom(wisdom, getCulture(wisdom.culture));
}

initControls(cultures, picker.getFilter(), {
  onNext: () => display(picker.next()),
  onCultureChange: (cultureId) => {
    picker.setFilter(cultureId);
    saveFilter(cultureId);
    display(picker.next());
  },
});

const linked = new URLSearchParams(location.search).get('w');
const initial = linked ? picker.byId(linked) : undefined;
display(initial ? picker.show(initial) : picker.next());

function loadFilter(): string | null {
  try {
    const id = localStorage.getItem(FILTER_KEY);
    return id && cultures.some((c) => c.id === id) ? id : null;
  } catch {
    return null;
  }
}

function saveFilter(cultureId: string | null): void {
  try {
    if (cultureId) localStorage.setItem(FILTER_KEY, cultureId);
    else localStorage.removeItem(FILTER_KEY);
  } catch {
    // Storage unavailable (private mode etc.) — the filter just won't persist.
  }
}
