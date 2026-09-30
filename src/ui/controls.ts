import type { Culture } from '../core/types';

const select = document.getElementById('culture') as HTMLSelectElement;
const nextButton = document.getElementById('next') as HTMLButtonElement;
const learnToggle = document.getElementById('learn-toggle') as HTMLButtonElement;
const learnPanel = document.getElementById('learn-panel') as HTMLElement;
const learnRoot = learnToggle.parentElement as HTMLElement;

export interface ControlHandlers {
  onNext: () => void;
  onCultureChange: (cultureId: string | null) => void;
}

export function initControls(cultures: readonly Culture[], selected: string | null, handlers: ControlHandlers): void {
  const all = new Option('All cultures', '');
  const options = [...cultures]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => new Option(`${c.name} · ${c.endonym}`, c.id));
  select.replaceChildren(all, ...options);
  select.value = selected ?? '';
  select.addEventListener('change', () => {
    select.blur();
    handlers.onCultureChange(select.value || null);
  });

  nextButton.addEventListener('click', () => handlers.onNext());
  learnToggle.addEventListener('click', () => setLearnOpen(learnPanel.hidden));

  document.addEventListener('click', (event) => {
    if (!learnPanel.hidden && !learnRoot.contains(event.target as Node)) setLearnOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.closest('select, input, textarea')) return;

    if (event.key === ' ' || event.key === 'ArrowRight') {
      // Let Space activate a focused button normally, except the next button itself.
      if (event.key === ' ' && target instanceof HTMLButtonElement && target !== nextButton) return;
      event.preventDefault();
      handlers.onNext();
    } else if (event.key === 'i' || event.key === 'I') {
      setLearnOpen(learnPanel.hidden);
    } else if (event.key === 'Escape') {
      setLearnOpen(false);
    }
  });
}

export function setLearnOpen(open: boolean): void {
  learnPanel.hidden = !open;
  learnToggle.setAttribute('aria-expanded', String(open));
  learnRoot.classList.toggle('is-open', open);
}
