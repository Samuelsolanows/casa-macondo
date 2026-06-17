/**
 * activities.js
 * Maneja la carga dinámica, filtrado, búsqueda y visualización en mapa de las actividades turísticas de Casa Macondo.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/actividades';
  const activitiesList = document.getElementById('activitiesList');
  const searchInput = document.getElementById('activitySearchInput');
  const btnViewList = document.getElementById('btnViewList');
  const btnViewMap = document.getElementById('btnViewMap');
  const mapContainer = document.getElementById('mapContainer');

  let debounceTimer;
  let currentActivities = [];
  let map = null;
  let markersLayer = null;
  let currentView = 'list'; // 'list' o 'map'

  /** Fetch activities from backend API and render them */
  async function fetchAndRenderActivities(searchQuery = '') {
    try {
      if (currentView === 'list') {
        activitiesList.innerHTML = '<div class="loading-spinner">Buscando experiencias...</div>';
      }

      const url = searchQuery.trim() !== '' 
        ? `${API_URL}?search=${encodeURIComponent(searchQuery)}`
        : API_URL;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos de actividades.');
      }

      currentActivities = await response.json();
      
      // Renderizar vista actual
      if (currentView === 'list') {
        renderActivitiesList(currentActivities);
      } else {
        initMapIfNeeded();
        updateMapMarkers();
      }

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

  /** Inicializar mapa Leaflet */
  function initMapIfNeeded() {
    if (map) return;

    // Coordenadas del parque principal de Bochalema
    map = L.map('activitiesMap').setView([7.6100, -72.6300], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }

  /** Actualizar pines en el mapa */
  function updateMapMarkers() {
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = [];
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div class="pin-marker"><div class="pin-dot"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -20]
    });

    currentActivities.forEach(activity => {
      if (activity.latitud && activity.longitud) {
        const lat = parseFloat(activity.latitud);
        const lon = parseFloat(activity.longitud);
        bounds.push([lat, lon]);

        const popupContent = `
          <div class="map-popup-card">
            <div class="map-popup-img-wrapper">
              <img src="${activity.imagen_ruta}" alt="${activity.nombre}" class="map-popup-img" />
              <span class="map-popup-category">${activity.categoria}</span>
            </div>
            <div class="map-popup-body">
              <h4 class="map-popup-title">${activity.nombre}</h4>
              <p class="map-popup-desc">${activity.descripcion.length > 70 ? activity.descripcion.substring(0, 70) + '...' : activity.descripcion}</p>
              <a href="actividad.html?id=${activity.id_actividad}" class="map-popup-link">Ver detalles &rarr;</a>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lon], { icon: customIcon })
          .bindPopup(popupContent, {
            maxWidth: 260,
            className: 'premium-popup'
          });

        markersLayer.addLayer(marker);
      }
    });

    // Ajustar zoom y encuadre
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    // Invalida tamaño para corregir bugs de renderizado al mostrar elemento oculto
    setTimeout(() => {
      map.invalidateSize();
    }, 50);
  }

  // Controlador de vistas (Lista / Mapa)
  if (btnViewList && btnViewMap) {
    btnViewList.addEventListener('click', () => {
      if (currentView === 'list') return;
      currentView = 'list';
      btnViewList.classList.add('active');
      btnViewMap.classList.remove('active');
      activitiesList.style.display = 'grid';
      mapContainer.classList.add('hidden-view');
      renderActivitiesList(currentActivities);
    });

    btnViewMap.addEventListener('click', () => {
      if (currentView === 'map') return;
      currentView = 'map';
      btnViewMap.classList.add('active');
      btnViewList.classList.remove('active');
      activitiesList.style.display = 'none';
      mapContainer.classList.remove('hidden-view');
      
      initMapIfNeeded();
      updateMapMarkers();
    });
  }

  // Escuchar entrada de teclado con Debounce (300ms)
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
