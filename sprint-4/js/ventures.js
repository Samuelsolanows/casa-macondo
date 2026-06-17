/**
 * ventures.js
 * Maneja la carga dinámica, filtrado y búsqueda de emprendimientos turísticos locales de Bochalema.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/emprendimientos';
  const venturesList = document.getElementById('venturesList');
  const searchInput = document.getElementById('ventureSearchInput');
  const filterTabs = document.querySelectorAll('.filter-tab');

  let debounceTimer;
  let allVentures = [];
  let activeCategory = 'Todos';

  /** Fetch ventures from database */
  async function fetchAndRenderVentures(searchQuery = '') {
    try {
      venturesList.innerHTML = '<div class="loading-spinner">Buscando emprendimientos locales...</div>';

      const url = searchQuery.trim() !== '' 
        ? `${API_URL}?search=${encodeURIComponent(searchQuery)}`
        : API_URL;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos de emprendimientos.');
      }

      allVentures = await response.json();
      filterAndRenderDisplay();

    } catch (error) {
      console.error(error);
      venturesList.innerHTML = `
        <div class="activities-error" style="grid-column: 1 / -1; text-align: center; color: rgba(243, 233, 228, 0.6); padding: 4rem 2rem; border: 1px dashed rgba(243, 233, 228, 0.15); border-radius: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>No pudimos cargar los emprendimientos. Asegúrate de que el servidor backend esté corriendo.</p>
        </div>
      `;
    }
  }

  /** Apply active category filter and render */
  function filterAndRenderDisplay() {
    let filtered = allVentures;

    if (activeCategory !== 'Todos') {
      filtered = allVentures.filter(v => v.categoria.toLowerCase() === activeCategory.toLowerCase());
    }

    renderVenturesGrid(filtered);
  }

  /** Render cards grid */
  function renderVenturesGrid(ventures) {
    if (ventures.length === 0) {
      venturesList.innerHTML = `
        <div class="activities-no-results" style="grid-column: 1 / -1; text-align: center; color: rgba(243, 233, 228, 0.5); padding: 4rem 2rem;">
          <p>No se encontraron emprendimientos en esta categoría.</p>
        </div>
      `;
      return;
    }

    venturesList.innerHTML = ventures.map(v => `
      <div class="venture-card">
        <div class="venture-img-wrapper">
          <img src="${v.imagen_ruta}" alt="${v.nombre}" class="venture-img" loading="lazy" onerror="this.src='img/sitios_main.png'" />
          <span class="venture-category">${v.categoria}</span>
        </div>
        <div class="venture-content">
          <h3 class="venture-name">${v.nombre}</h3>
          <p class="venture-desc">${v.descripcion}</p>
          <div class="venture-footer">
            <div class="venture-contact-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>${v.contacto}</span>
            </div>
            <span class="venture-label">Contacto</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Evento buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value;

      debounceTimer = setTimeout(() => {
        fetchAndRenderVentures(query);
      }, 300);
    });
  }

  // Evento filtros de categorías
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      filterAndRenderDisplay();
    });
  });

  // Inicialización
  fetchAndRenderVentures();
});
