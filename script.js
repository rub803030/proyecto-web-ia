'use strict';

/* =========================================================
   Explorador Rick & Morty
   Consumo de la API pública: https://rickandmortyapi.com
   ========================================================= */

const API_URL = 'https://rickandmortyapi.com/api/character';
const STORAGE_KEYS = {
  favorites: 'rm-favorites-v1',
  theme: 'rm-theme-v1',
  history: 'rm-history-v1'
};

/* Referencias al DOM (se resuelven una sola vez) */
const ui = {
  themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.getElementById('themeIcon'),
  themeLabel: document.getElementById('themeLabel'),
  form: document.getElementById('searchForm'),
  searchInput: document.getElementById('searchInput'),
  clearSearch: document.getElementById('clearSearch'),
  statusFilter: document.getElementById('statusFilter'),
  speciesFilter: document.getElementById('speciesFilter'),
  genderFilter: document.getElementById('genderFilter'),
  sortFilter: document.getElementById('sortFilter'),
  resetBtn: document.getElementById('resetBtn'),
  history: document.getElementById('history'),
  historyList: document.getElementById('historyList'),
  tabAll: document.getElementById('tabAll'),
  tabFav: document.getElementById('tabFav'),
  favCount: document.getElementById('favCount'),
  resultsInfo: document.getElementById('resultsInfo'),
  clearFavBtn: document.getElementById('clearFavBtn'),
  message: document.getElementById('message'),
  messageIcon: document.getElementById('messageIcon'),
  messageText: document.getElementById('messageText'),
  retryBtn: document.getElementById('retryBtn'),
  skeleton: document.getElementById('skeleton'),
  grid: document.getElementById('grid'),
  pagination: document.getElementById('pagination'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  pageInfo: document.getElementById('pageInfo'),
  modal: document.getElementById('detailModal'),
  modalBody: document.getElementById('modalBody'),
  modalClose: document.getElementById('modalClose')
};

/* Estado central de la aplicación */
const state = {
  page: 1,
  totalPages: 1,
  totalCount: 0,
  items: [],
  view: 'all',
  query: '',
  status: '',
  species: '',
  gender: '',
  sort: ''
};

const STATUS_LABELS = { alive: 'Vivo', dead: 'Muerto', unknown: 'Desconocido' };
const GENDER_LABELS = { Female: 'Femenino', Male: 'Masculino', Genderless: 'Sin género', unknown: 'Desconocido' };

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */

/** Escapa caracteres especiales antes de insertar texto en HTML. */
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Traduce los valores que devuelve la API al español. */
function labelFor(map, value) {
  return map[value] || value || 'Desconocido';
}

/** Construye la URL de la API con la página y los filtros activos. */
function buildUrl(page) {
  const params = new URLSearchParams({ page: String(page) });
  if (state.query) params.set('name', state.query);
  if (state.status) params.set('status', state.status);
  if (state.species) params.set('species', state.species);
  if (state.gender) params.set('gender', state.gender);
  return `${API_URL}/?${params.toString()}`;
}

/* ---------------------------------------------------------
   Reto extra 1: tema claro / oscuro
   --------------------------------------------------------- */

function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (error) {
    // Si localStorage está bloqueado se usa la preferencia del sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  ui.themeToggle.setAttribute('aria-pressed', String(isDark));
  ui.themeIcon.textContent = isDark ? '☀️' : '🌙';
  ui.themeLabel.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', isDark ? '#0b0f14' : '#f4f7f5');
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEYS.theme, next);
  } catch (error) {
    console.warn('No se pudo guardar la preferencia de tema:', error);
  }
}

/* ---------------------------------------------------------
   Reto extra 2: historial de búsquedas
   --------------------------------------------------------- */

const MAX_HISTORY = 6;

function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string').slice(0, MAX_HISTORY) : [];
  } catch (error) {
    return [];
  }
}

let searchHistory = readHistory();

function persistHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(searchHistory));
  } catch (error) {
    console.warn('No se pudo guardar el historial:', error);
  }
}

function addToHistory(term) {
  const clean = term.trim();
  if (clean.length < 2) return;
  searchHistory = [clean, ...searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase())]
    .slice(0, MAX_HISTORY);
  persistHistory();
  renderHistory();
}

function renderHistory() {
  ui.history.hidden = searchHistory.length === 0;
  const chips = searchHistory
    .map((term) => `<button class="chip" type="button" data-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`)
    .join('');
  const clear = searchHistory.length
    ? '<button class="chip chip--clear" type="button" data-action="clear-history">Borrar historial</button>'
    : '';
  ui.historyList.innerHTML = chips + clear;
}

/* ---------------------------------------------------------
   Búsqueda y filtros
   --------------------------------------------------------- */

let searchTimer = null;

/** Lee los controles de filtros y los guarda en el estado. */
function syncFiltersFromUI() {
  state.status = ui.statusFilter.value;
  state.species = ui.speciesFilter.value;
  state.gender = ui.genderFilter.value;
  state.sort = ui.sortFilter.value;
}

/** Aplica los filtros actuales y vuelve siempre a la primera página. */
function applyFilters() {
  syncFiltersFromUI();
  state.page = 1;
  if (state.view === 'favorites') {
    renderFavorites();
  } else {
    loadCharacters();
  }
}

function updateClearButton() {
  ui.clearSearch.hidden = ui.searchInput.value.length === 0;
}

/* ---------------------------------------------------------
   Favoritos persistentes (localStorage)
   --------------------------------------------------------- */

function readFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && Number.isInteger(item.id)) : [];
  } catch (error) {
    console.warn('Los favoritos guardados están dañados:', error);
    return [];
  }
}

let favorites = readFavorites();

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  } catch (error) {
    console.warn('No se pudieron guardar los favoritos:', error);
    showMessage({
      icon: '💾',
      title: 'No se pudo guardar',
      text: 'Tu navegador no permite guardar datos para este sitio.',
      variant: 'error'
    });
  }
}

function isFavorite(id) {
  return favorites.some((character) => character.id === id);
}

function findCharacter(id) {
  return state.items.find((character) => character.id === id)
    || favorites.find((character) => character.id === id)
    || null;
}

function toggleFavorite(character) {
  const active = isFavorite(character.id);
  favorites = active
    ? favorites.filter((item) => item.id !== character.id)
    : [...favorites, character];

  saveFavorites();
  renderFavoritesCount();
  updateClearFavButton();

  if (state.view === 'favorites') {
    renderFavorites();
  } else {
    refreshFavoriteButtons();
  }
}

/** Actualiza el estado visual de los corazones ya dibujados. */
function refreshFavoriteButtons() {
  ui.grid.querySelectorAll('.fav-btn').forEach((button) => {
    const card = button.closest('.card');
    const active = isFavorite(Number(card.dataset.id));
    const name = button.dataset.name;
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', `${active ? 'Quitar' : 'Agregar'} ${name} ${active ? 'de' : 'a'} favoritos`);
  });
}

function renderFavoritesCount() {
  ui.favCount.textContent = String(favorites.length);
}

/** El botón "Vaciar favoritos" solo tiene sentido en la vista de favoritos. */
function updateClearFavButton() {
  ui.clearFavBtn.hidden = state.view !== 'favorites' || favorites.length === 0;
}

function clearFavorites() {
  if (favorites.length === 0) return;

  const confirmed = window.confirm(
    `¿Seguro que quieres vaciar tus ${favorites.length} favoritos? Esta acción no se puede deshacer.`
  );
  if (!confirmed) return;

  favorites = [];
  try {
    localStorage.removeItem(STORAGE_KEYS.favorites); // Se elimina la clave completa.
  } catch (error) {
    console.warn('No se pudo borrar el almacenamiento de favoritos:', error);
  }

  renderFavoritesCount();
  renderFavorites();
  updateClearFavButton();
}

/* ---------------------------------------------------------
   Filtros sobre favoritos y cambio de vista
   --------------------------------------------------------- */

/** Comprueba si un personaje cumple los filtros (para la vista de favoritos). */
function matchesFilters(character) {
  const query = state.query.toLowerCase();
  if (query && !character.name.toLowerCase().includes(query)) return false;
  if (state.status && character.status.toLowerCase() !== state.status) return false;
  if (state.species && character.species !== state.species) return false;
  if (state.gender && character.gender.toLowerCase() !== state.gender) return false;
  return true;
}

function renderFavorites() {
  setLoading(false);
  ui.pagination.hidden = true;
  updateClearFavButton();
  const list = favorites.filter(matchesFilters);

  if (favorites.length === 0) {
    ui.grid.innerHTML = '';
    updateResultsInfo('');
    showMessage({
      icon: '💔',
      title: 'Todavía no tienes favoritos',
      text: 'Pulsa el corazón de cualquier personaje para guardarlo en este navegador.'
    });
    return;
  }

  if (list.length === 0) {
    ui.grid.innerHTML = '';
    updateResultsInfo(`0 de ${favorites.length} favoritos`);
    showMessage({
      icon: '🔍',
      title: 'Ningún favorito coincide con la búsqueda',
      text: 'Prueba con otro nombre o limpia los filtros para ver todos tus favoritos.'
    });
    return;
  }

  hideMessage();
  renderCards(list);
  updateResultsInfo(`${list.length} de ${favorites.length} favoritos guardados`);
}

function setView(view) {
  state.view = view;
  const isAll = view === 'all';

  ui.tabAll.classList.toggle('is-active', isAll);
  ui.tabFav.classList.toggle('is-active', !isAll);
  ui.tabAll.setAttribute('aria-selected', String(isAll));
  ui.tabFav.setAttribute('aria-selected', String(!isAll));
  ui.tabAll.tabIndex = isAll ? 0 : -1;
  ui.tabFav.tabIndex = isAll ? -1 : 0;
  updateClearFavButton();

  if (isAll) {
    state.page = 1;
    loadCharacters();
  } else {
    renderFavorites();
  }
}

/* ---------------------------------------------------------
   Modal de detalle del personaje
   --------------------------------------------------------- */

let modalRequest = null;

function detailTemplate(character) {
  const favorite = isFavorite(character.id);
  return `
    <div class="detail">
      <img class="detail__img" src="${escapeHtml(character.image)}" alt="Retrato de ${escapeHtml(character.name)}"
           width="320" height="320">
      <div class="detail__info">
        <span class="card__status card__status--${character.status?.toLowerCase() || 'unknown'} detail__status">
          <span class="dot"></span>${labelFor(STATUS_LABELS, character.status?.toLowerCase())}
        </span>
        <h3 class="detail__name">${escapeHtml(character.name)}</h3>
        <dl class="detail__list">
          <div><dt>Especie</dt><dd>${escapeHtml(character.species)}</dd></div>
          <div><dt>Tipo</dt><dd>${escapeHtml(character.type || 'Sin dato')}</dd></div>
          <div><dt>Género</dt><dd>${escapeHtml(labelFor(GENDER_LABELS, character.gender))}</dd></div>
          <div><dt>Origen</dt><dd>${escapeHtml(character.origin?.name || 'Desconocido')}</dd></div>
          <div><dt>Última ubicación</dt><dd>${escapeHtml(character.location?.name || 'Desconocida')}</dd></div>
          <div><dt>Episodios</dt><dd>${character.episode?.length ?? 0}</dd></div>
        </dl>
        <button class="btn btn--primary detail__fav" type="button" data-action="fav"
                data-id="${character.id}" data-name="${escapeHtml(character.name)}" aria-pressed="${favorite}">
          ♥ ${favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        </button>
      </div>
    </div>
  `;
}

async function openDetail(id) {
  ui.modalBody.innerHTML = '<p class="detail__loading">Cargando información del personaje…</p>';
  ui.modal.showModal();
  document.body.classList.add('no-scroll');

  if (modalRequest) modalRequest.abort();
  const controller = new AbortController();
  modalRequest = controller;

  try {
    const response = await fetch(`${API_URL}/${id}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`La API respondió con el código ${response.status}`);

    const character = await response.json();
    ui.modalBody.innerHTML = detailTemplate(character);
  } catch (error) {
    if (error.name === 'AbortError') return;
    ui.modalBody.innerHTML = `
      <p class="detail__error">
        No se pudo cargar el detalle del personaje. Revisa tu conexión e inténtalo de nuevo.
      </p>
    `;
    console.error('Error al cargar el detalle:', error);
  }
}

function closeDetail() {
  ui.modal.close();
}

/* ---------------------------------------------------------
   Interfaz: carga, tarjetas y paginación
   --------------------------------------------------------- */

function setLoading(isLoading) {
  ui.skeleton.hidden = !isLoading;
  ui.grid.hidden = isLoading;
  ui.grid.setAttribute('aria-busy', String(isLoading));
  if (isLoading) {
    ui.skeleton.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton-card"></div>').join('');
    ui.pagination.hidden = true;
  }
}

function showMessage({ icon = '💬', title = '', text = '', variant = '' }) {
  ui.messageIcon.textContent = icon;
  ui.messageText.innerHTML = `${title ? `<strong>${escapeHtml(title)}</strong>` : ''}${escapeHtml(text)}`;
  ui.message.classList.toggle('message--error', variant === 'error');
  ui.message.hidden = false;
}

function hideMessage() {
  ui.message.hidden = true;
}

/** Genera el HTML de una tarjeta de personaje. */
function characterCard(character) {
  const statusClass = `card__status--${character.status?.toLowerCase() || 'unknown'}`;
  const favorite = isFavorite(character.id);
  const favoriteLabel = `${favorite ? 'Quitar' : 'Agregar'} ${character.name} ${favorite ? 'de' : 'a'} favoritos`;

  return `
    <article class="card" data-id="${character.id}">
      <div class="card__media">
        <img class="card__img" src="${escapeHtml(character.image)}" alt="Retrato de ${escapeHtml(character.name)}"
             width="300" height="300" loading="lazy" decoding="async">
        <span class="card__status ${statusClass}">
          <span class="dot"></span>${labelFor(STATUS_LABELS, character.status?.toLowerCase())}
        </span>
        <button class="fav-btn" type="button" data-action="fav" data-name="${escapeHtml(character.name)}"
                aria-pressed="${favorite}" aria-label="${escapeHtml(favoriteLabel)}">♥</button>
      </div>
      <div class="card__body">
        <h3 class="card__name">${escapeHtml(character.name)}</h3>
        <p class="card__meta">
          <span>${escapeHtml(character.species)}</span>
          <span>${escapeHtml(labelFor(GENDER_LABELS, character.gender))}</span>
        </p>
        <button class="card__detail" type="button" data-action="detail">
          Ver detalle <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  `;
}

/** Reto extra 3: orden alfabético de la página visible. */
function sortCharacters(characters) {
  const collator = new Intl.Collator('es', { sensitivity: 'base' });
  if (state.sort === 'az') {
    return [...characters].sort((a, b) => collator.compare(a.name, b.name));
  }
  if (state.sort === 'za') {
    return [...characters].sort((a, b) => collator.compare(b.name, a.name));
  }
  return characters;
}

function renderCards(characters) {
  ui.grid.innerHTML = sortCharacters(characters).map(characterCard).join('');
}

function updatePagination() {
  const hasPages = state.totalPages > 1;
  ui.pagination.hidden = !hasPages || state.view === 'favorites';
  if (!hasPages) return;
  ui.pageInfo.textContent = `Página ${state.page} de ${state.totalPages}`;
  ui.prevBtn.disabled = state.page <= 1;
  ui.nextBtn.disabled = state.page >= state.totalPages;
}

function updateResultsInfo(text) {
  ui.resultsInfo.textContent = text;
}

/* ---------------------------------------------------------
   Consulta a la API
   --------------------------------------------------------- */

let activeRequest = null;

async function loadCharacters({ scroll = false } = {}) {
  // Cancela la petición anterior para que no sobrescriba los resultados nuevos.
  if (activeRequest) activeRequest.abort();
  const controller = new AbortController();
  activeRequest = controller;

  setLoading(true);
  hideMessage();
  ui.retryBtn.hidden = true;

  try {
    const response = await fetch(buildUrl(state.page), { signal: controller.signal });

    // La API responde 404 cuando la búsqueda no devuelve ningún personaje.
    if (response.status === 404) {
      state.items = [];
      state.totalPages = 0;
      state.totalCount = 0;
      ui.grid.innerHTML = '';
      ui.pagination.hidden = true;
      updateResultsInfo('0 resultados');
      showMessage({
        icon: '🔍',
        title: 'Sin resultados',
        text: `No encontramos personajes${state.query ? ` para «${state.query}»` : ''} con esos filtros. Prueba con otro nombre o pulsa «Limpiar filtros».`
      });
      return;
    }

    if (!response.ok) {
      throw new Error(`La API respondió con el código ${response.status}`);
    }

    const data = await response.json();
    state.items = data.results;
    state.totalPages = data.info.pages;
    state.totalCount = data.info.count;

    renderCards(state.items);
    updatePagination();
    updateResultsInfo(describeResults());

    if (scroll) {
      ui.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    if (error.name === 'AbortError') return; // Petición reemplazada por una más reciente.

    state.items = [];
    ui.grid.innerHTML = '';
    ui.pagination.hidden = true;
    updateResultsInfo('');
    ui.retryBtn.hidden = false;
    showMessage({
      icon: '📡',
      title: 'No se pudo consultar la API',
      text: navigator.onLine
        ? 'El servicio no respondió. Puede ser un fallo temporal: inténtalo de nuevo en unos segundos.'
        : 'Parece que no tienes conexión a internet. Revísala y vuelve a intentarlo.',
      variant: 'error'
    });
    console.error('Error al consultar la API:', error);
  } finally {
    // Solo la petición vigente controla el esqueleto de carga.
    if (!controller.signal.aborted) setLoading(false);
  }
}

/** Texto descriptivo del resultado actual. */
function describeResults() {
  const total = state.totalCount;
  const noun = total === 1 ? 'personaje encontrado' : 'personajes encontrados';
  const order = state.sort ? ' · orden aplicado a esta página' : '';
  return `${total} ${noun} · página ${state.page} de ${state.totalPages}${order}`;
}

/* ---------------------------------------------------------
   Eventos
   --------------------------------------------------------- */

ui.form.addEventListener('submit', (event) => {
  event.preventDefault();
  window.clearTimeout(searchTimer);
  state.query = ui.searchInput.value.trim();
  addToHistory(state.query);
  applyFilters();
});

/* Búsqueda "en vivo" con retardo para no saturar la API en cada tecla. */
ui.searchInput.addEventListener('input', () => {
  updateClearButton();
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = ui.searchInput.value.trim();
    addToHistory(state.query);
    applyFilters();
  }, 450);
});

/* Botón nativo de limpiar de los input type="search". */
ui.searchInput.addEventListener('search', () => {
  if (ui.searchInput.value === '') {
    state.query = '';
    applyFilters();
  }
});

ui.clearSearch.addEventListener('click', () => {
  ui.searchInput.value = '';
  state.query = '';
  updateClearButton();
  applyFilters();
  ui.searchInput.focus();
});

[ui.statusFilter, ui.speciesFilter, ui.genderFilter, ui.sortFilter].forEach((select) => {
  select.addEventListener('change', applyFilters);
});

ui.resetBtn.addEventListener('click', () => {
  ui.form.reset();
  ui.statusFilter.value = '';
  ui.speciesFilter.value = '';
  ui.genderFilter.value = '';
  ui.sortFilter.value = '';
  state.query = '';
  updateClearButton();
  applyFilters();
});

ui.prevBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    loadCharacters({ scroll: true });
  }
});

ui.nextBtn.addEventListener('click', () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    loadCharacters({ scroll: true });
  }
});

ui.retryBtn.addEventListener('click', () => loadCharacters());

/* Al recuperar la conexión se reintenta la última consulta automáticamente. */
window.addEventListener('online', () => {
  if (state.view === 'all' && ui.message.classList.contains('message--error')) {
    loadCharacters();
  }
});

/* Delegación de eventos: un solo listener para corazones y detalles. */
ui.grid.addEventListener('click', (event) => {
  const detailButton = event.target.closest('[data-action="detail"]');
  if (detailButton) {
    openDetail(Number(detailButton.closest('.card').dataset.id));
    return;
  }

  const button = event.target.closest('[data-action="fav"]');
  if (!button) return;

  const card = button.closest('.card');
  const character = findCharacter(Number(card.dataset.id));
  if (character) toggleFavorite(character);
});

/* Favorito desde el modal: se actualizan el botón y las tarjetas. */
ui.modalBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="fav"]');
  if (!button) return;

  const character = findCharacter(Number(button.dataset.id));
  if (!character) return;

  toggleFavorite(character);
  const active = isFavorite(character.id);
  button.setAttribute('aria-pressed', String(active));
  button.textContent = `♥ ${active ? 'Quitar de favoritos' : 'Guardar en favoritos'}`;
});

ui.modalClose.addEventListener('click', closeDetail);

/* Cerrar al hacer clic fuera del contenido. */
ui.modal.addEventListener('click', (event) => {
  if (event.target === ui.modal) closeDetail();
});

ui.modal.addEventListener('close', () => {
  document.body.classList.remove('no-scroll');
});

ui.tabAll.addEventListener('click', () => setView('all'));
ui.tabFav.addEventListener('click', () => setView('favorites'));

ui.clearFavBtn.addEventListener('click', clearFavorites);

/* Las pestañas se recorren con las flechas del teclado (patrón ARIA tabs). */
[ui.tabAll, ui.tabFav].forEach((tab) => {
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const target = tab === ui.tabAll ? ui.tabFav : ui.tabAll;
    target.focus();
    setView(target === ui.tabAll ? 'all' : 'favorites');
  });
});

ui.themeToggle.addEventListener('click', toggleTheme);

/* Chips del historial: repiten una búsqueda o borran el historial. */
ui.historyList.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="clear-history"]')) {
    searchHistory = [];
    persistHistory();
    renderHistory();
    return;
  }

  const chip = event.target.closest('[data-term]');
  if (!chip) return;

  const term = chip.dataset.term;
  ui.searchInput.value = term;
  state.query = term;
  updateClearButton();
  addToHistory(term);
  applyFilters();
});

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

applyTheme(getPreferredTheme());
renderHistory();
renderFavoritesCount();
loadCharacters();
