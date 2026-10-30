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
  message: document.getElementById('message'),
  messageIcon: document.getElementById('messageIcon'),
  messageText: document.getElementById('messageText'),
  retryBtn: document.getElementById('retryBtn'),
  skeleton: document.getElementById('skeleton'),
  grid: document.getElementById('grid'),
  pagination: document.getElementById('pagination'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  pageInfo: document.getElementById('pageInfo')
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

  if (isAll) {
    state.page = 1;
    loadCharacters();
  } else {
    renderFavorites();
  }
}

/* ---------------------------------------------------------
   Interfaz: carga, tarjetas y paginación
   --------------------------------------------------------- */

function setLoading(isLoading) {
  ui.skeleton.hidden = !isLoading;
  ui.grid.hidden = isLoading;
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
      </div>
    </article>
  `;
}

function renderCards(characters) {
  ui.grid.innerHTML = characters.map(characterCard).join('');
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
  return `${total} ${noun} · página ${state.page} de ${state.totalPages}`;
}

/* ---------------------------------------------------------
   Eventos
   --------------------------------------------------------- */

ui.form.addEventListener('submit', (event) => {
  event.preventDefault();
  window.clearTimeout(searchTimer);
  state.query = ui.searchInput.value.trim();
  applyFilters();
});

/* Búsqueda "en vivo" con retardo para no saturar la API en cada tecla. */
ui.searchInput.addEventListener('input', () => {
  updateClearButton();
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = ui.searchInput.value.trim();
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

/* Delegación de eventos: un solo listener para todos los corazones. */
ui.grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="fav"]');
  if (!button) return;

  const card = button.closest('.card');
  const character = findCharacter(Number(card.dataset.id));
  if (character) toggleFavorite(character);
});

ui.tabAll.addEventListener('click', () => setView('all'));
ui.tabFav.addEventListener('click', () => setView('favorites'));

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

renderFavoritesCount();
loadCharacters();
