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
  return `
    <article class="card" data-id="${character.id}">
      <div class="card__media">
        <img class="card__img" src="${escapeHtml(character.image)}" alt="Retrato de ${escapeHtml(character.name)}"
             width="300" height="300" loading="lazy" decoding="async">
        <span class="card__status ${statusClass}">
          <span class="dot"></span>${labelFor(STATUS_LABELS, character.status?.toLowerCase())}
        </span>
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

async function loadCharacters() {
  setLoading(true);
  hideMessage();

  try {
    const response = await fetch(buildUrl(state.page));
    if (!response.ok) {
      throw new Error(`La API respondió con el código ${response.status}`);
    }

    const data = await response.json();
    state.items = data.results;
    state.totalPages = data.info.pages;
    state.totalCount = data.info.count;

    renderCards(state.items);
    updatePagination();
    updateResultsInfo(`${state.totalCount} personajes encontrados · página ${state.page} de ${state.totalPages}`);
  } catch (error) {
    state.items = [];
    ui.grid.innerHTML = '';
    ui.pagination.hidden = true;
    updateResultsInfo('');
    showMessage({
      icon: '📡',
      title: 'No se pudo conectar con la API',
      text: 'Revisa tu conexión a internet e inténtalo de nuevo.',
      variant: 'error'
    });
    console.error('Error al consultar la API:', error);
  } finally {
    setLoading(false);
  }
}

/* ---------------------------------------------------------
   Eventos
   --------------------------------------------------------- */

ui.form.addEventListener('submit', (event) => {
  event.preventDefault();
});

ui.prevBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    loadCharacters();
  }
});

ui.nextBtn.addEventListener('click', () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    loadCharacters();
  }
});

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

loadCharacters();
