/** Behaviour for the Ibaan field guide. Every feature has a no-script fallback. */

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  section: string;
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/* ------------------------------------------------------------------ theme --- */
const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeMeta = document.querySelector<HTMLMetaElement>('[data-theme-color]');

function setTheme(theme: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = theme;
  themeToggle?.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  if (themeMeta) themeMeta.content = theme === 'dark' ? '#0a0f17' : '#fbfbfa';
}

const currentTheme = document.documentElement.dataset.theme;
if (currentTheme === 'dark' || currentTheme === 'light') setTheme(currentTheme);

themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try {
    localStorage.setItem('bi-theme', next);
  } catch {
    /* Private browsing can deny storage; the theme still works for this visit. */
  }
});

/* ------------------------------------------------------------------- menu --- */
const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const primaryNav = document.querySelector<HTMLElement>('#primary-nav');

function closeMenu(): void {
  menuToggle?.setAttribute('aria-expanded', 'false');
  primaryNav?.classList.remove('open');
}

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  primaryNav?.classList.toggle('open', !open);
});

primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav?.classList.contains('open')) {
    closeMenu();
    menuToggle?.focus();
  }
});

/* ---------------------------------------------------------- header on scroll --- */
const header = document.querySelector<HTMLElement>('[data-header]');
const setHeaderState = (): void => {
  header?.classList.toggle('is-scrolled', window.scrollY > 6);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

/* ----------------------------------------------------------------- search --- */
const searchDialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
const searchResults = document.querySelector<HTMLUListElement>('[data-search-results]');
const searchHint = document.querySelector<HTMLElement>('[data-search-hint]');

let searchData: SearchEntry[] | null = null;

async function loadSearchData(): Promise<SearchEntry[]> {
  if (!searchData) {
    const response = await fetch('/search.json');
    if (!response.ok) throw new Error(`Search data returned ${response.status}`);
    searchData = (await response.json()) as SearchEntry[];
  }
  return searchData;
}

function resultNode(entry: SearchEntry): HTMLLIElement {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = entry.href;

  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = entry.title;

  const meta = document.createElement('span');
  meta.className = 'search-result-meta';
  meta.textContent = `${entry.section} · ${entry.description}`;

  link.append(title, meta);
  link.addEventListener('click', () => searchDialog?.close());
  item.append(link);
  return item;
}

function defaultResults(entries: SearchEntry[]): HTMLLIElement[] {
  return entries
    .filter((entry) => entry.section !== 'Barangay')
    .slice(0, 5)
    .map(resultNode);
}

async function renderSearch(query: string): Promise<void> {
  if (!searchResults) return;
  const q = normalize(query);
  searchResults.replaceChildren();

  try {
    const all = await loadSearchData();

    if (!q) {
      searchResults.append(...defaultResults(all));
      if (searchHint) {
        searchHint.textContent = 'Pages first. Type a barangay name to search the 26.';
      }
      return;
    }

    const matches = all
      .filter((entry) =>
        normalize(`${entry.title} ${entry.description} ${entry.section}`).includes(q),
      )
      .sort((a, b) => {
        const aTitle = normalize(a.title);
        const bTitle = normalize(b.title);
        const aStart = aTitle.startsWith(q) ? 0 : 1;
        const bStart = bTitle.startsWith(q) ? 0 : 1;
        return aStart - bStart || aTitle.localeCompare(bTitle);
      })
      .slice(0, 8);

    if (!matches.length) {
      const empty = document.createElement('li');
      empty.className = 'search-empty';
      empty.textContent = 'No page or barangay matches that name.';
      searchResults.append(empty);
      if (searchHint) searchHint.textContent = 'Try a shorter name, or browse the geography page.';
      return;
    }

    searchResults.append(...matches.map(resultNode));
    if (searchHint) {
      searchHint.textContent = `${matches.length} ${matches.length === 1 ? 'result' : 'results'} in this guide.`;
    }
  } catch {
    const error = document.createElement('li');
    error.className = 'search-empty';
    error.textContent = 'Search is unavailable. Use the geography page instead.';
    searchResults.append(error);
    if (searchHint) searchHint.textContent = 'Search could not load.';
  }
}

function openSearch(): void {
  if (!searchDialog) return;
  if (!searchDialog.open) searchDialog.showModal();
  document.body.classList.add('search-open');
  searchInput?.focus();
  void renderSearch(searchInput?.value ?? '');
}

function closeSearch(): void {
  searchDialog?.close();
}

document.querySelectorAll<HTMLElement>('[data-open-search]').forEach((button) => {
  button.addEventListener('click', openSearch);
});
document.querySelector<HTMLElement>('[data-close-search]')?.addEventListener('click', closeSearch);

searchDialog?.addEventListener('close', () => {
  document.body.classList.remove('search-open');
});
searchDialog?.addEventListener('click', (event) => {
  if (event.target === searchDialog) closeSearch();
});
searchInput?.addEventListener('input', () => void renderSearch(searchInput.value));
searchInput?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const first = searchResults?.querySelector<HTMLAnchorElement>('a');
  if (!first) return;
  event.preventDefault();
  first.click();
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
  }
});

// The barangay map's own behaviour is in scripts/barangay-map.ts, loaded only by
// the pages that show it. Here it only takes part in the page's reveal motion.
const mapBoards = [...document.querySelectorAll<HTMLElement>('[data-map-board]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------- reveal/motion --- */
if (!reducedMotion) {
  document.documentElement.classList.add('js-motion');

  const heroTitle = document.querySelector<HTMLElement>('.hero-title');
  if (heroTitle) {
    heroTitle.querySelectorAll<HTMLElement>(':scope > span').forEach((span, index) => {
      span.style.setProperty('--i', String(index));
    });
  }

  requestAnimationFrame(() => {
    document.documentElement.classList.add('is-loaded');
  });

  const revealSelectors = [
    'main .hero-foot',
    'main .hero-facts',
    'main .section-head',
    'main .page-head-inner',
    'main .heritage-feature-grid',
    'main .heritage-grid',
    'main .context-grid > *',
    'main .photo-strip figure',
    'main .record-panel',
    'main .prose-wide > *',
    'main .characteristics > li',
    'main .conservation-grid > *',
    'main .source-groups > section',
    'main .credit-list li',
    'main .stats-grid',
    'main .figure-notes > *',
    'main .note-panel',
    'main .table-head',
    'main .table-wrap',
    'main .not-found-actions',
    'main .heritage-dark-grid > *',
  ];
  const revealItems = [...document.querySelectorAll<HTMLElement>(revealSelectors.join(','))];
  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${(index % 4) * 60}ms`);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    const mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          mapObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    mapBoards.forEach((board) => mapObserver.observe(board));
  } else {
    revealItems.forEach((item) => item.classList.add('in'));
    mapBoards.forEach((board) => board.classList.add('is-in'));
  }
}

if (reducedMotion) mapBoards.forEach((board) => board.classList.add('is-in'));
