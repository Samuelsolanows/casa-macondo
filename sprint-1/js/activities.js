/**
 * activities.js
 * Maneja la carga dinámica, filtrado y búsqueda de actividades turísticas de Bochalema 360.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/actividades';
  const activitiesList = document.getElementById('activitiesList');
  const searchInput = document.getElementById('activitySearchInput');

  let debounceTimer;

  /** Fetch activities from backend API and render them */
  async function fetchAndRenderActivities(searchQuery = '') {
    try {
      // Mostrar spinner
      activitiesList.innerHTML = '<div class="loading-spinner">Buscando experiencias...</div>';

      const url = searchQuery.trim() !== '' 
        ? `${API_URL}?search=${encodeURIComponent(searchQuery)}`
        : API_URL;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos de actividades.');
      }

      const activities = await response.json();
      renderActivitiesList(activities);

    } catch (error) {
      console.error(error);
      activitiesList.innerHTML = `
        <div class="activities-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>No pudimos cargar las actividades. Asegúrate de que el servidor backend esté corriendo.</p>
        </div>
      `;
    }
  }

  /** Render array of activities to HTML cards */
  function renderActivitiesList(activities) {
    if (activities.length === 0) {
      activitiesList.innerHTML = `
        <div class="activities-no-results">
          <p>No se encontraron actividades que coincidan con tu búsqueda.</p>
        </div>
      `;
      return;
    }

    activitiesList.innerHTML = activities.map(activity => `
      <a href="actividad.html?id=${activity.id_actividad}" class="activity-card">
        <div class="activity-img-wrapper">
          <img src="${activity.imagen_ruta}" alt="${activity.nombre}" class="activity-img" loading="lazy" />
          <span class="activity-category">${activity.categoria}</span>
        </div>
        <div class="activity-content">
          <h3 class="activity-name">${activity.nombre}</h3>
          <p class="activity-desc">${activity.descripcion}</p>
          <div class="activity-footer-link">
            <span>Ver detalles</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow-right-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </div>
      </a>
    `).join('');
  }

  // Escuchar entrada de teclado con Debounce (300ms) para no sobrecargar el servidor
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value;

      debounceTimer = setTimeout(() => {
        fetchAndRenderActivities(query);
      }, 300);
    });
  }

  // Carga inicial
  fetchAndRenderActivities();
});
