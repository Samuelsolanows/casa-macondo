/**
 * activity-detail.js
 * Extrae el ID de la actividad de la URL, consulta la API en el backend
 * y renderiza dinámicamente los detalles de la experiencia en la página.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/actividades';
  const detailContainer = document.getElementById('activityDetailContent');

  // Obtener el ID desde los parámetros de la URL (ej: actividad.html?id=2)
  const urlParams = new URLSearchParams(window.location.search);
  const activityId = urlParams.get('id');

  if (!activityId) {
    showError('No se especificó ninguna actividad para mostrar.');
    return;
  }

  /** Consulta los detalles de la actividad al servidor */
  async function fetchActivityDetail() {
    try {
      detailContainer.innerHTML = '<div class="loading-spinner-large">Cargando la experiencia...</div>';

      const response = await fetch(`${API_URL}/${activityId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('La actividad solicitada no existe.');
        }
        throw new Error('Error al conectar con el servidor.');
      }

      const activity = await response.json();
      renderActivityDetail(activity);

    } catch (err) {
      console.error(err);
      showError(err.message || 'Ocurrió un error al cargar los detalles.');
    }
  }

  /** Renderiza la estructura premium con maquetación alterna */
  function renderActivityDetail(activity) {
    // Cambiar dinámicamente el título de la pestaña del navegador
    document.title = `${activity.nombre} - Casa Macondo`;

    detailContainer.innerHTML = `
      <!-- Fila 1: Imagen Izquierda, Texto Derecha -->
      <div class="detail-row">
        <div class="detail-col detail-image-col">
          <div class="detail-image-wrapper">
            <img src="${activity.imagen_ruta}" alt="${activity.nombre}" class="detail-main-img" />
          </div>
        </div>
        <div class="detail-col detail-text-col">
          <h1 class="detail-title">${activity.titulo_detalle}</h1>
          <p class="detail-paragraph">${activity.descripcion}</p>
        </div>
      </div>

      <!-- Fila 2: Texto Izquierda, Imagen Derecha (Diseño Alterno) -->
      <div class="detail-row detail-row-reverse">
        <div class="detail-col detail-text-col">
          <h2 class="detail-subtitle">${activity.subtitulo_detalle}</h2>
          <p class="detail-paragraph">${activity.descripcion_detalle}</p>
        </div>
        <div class="detail-col detail-image-col">
          <div class="detail-image-wrapper">
            <img src="${activity.imagen_secundaria_ruta || activity.imagen_ruta}" alt="${activity.nombre} detalle" class="detail-sec-img" />
          </div>
        </div>
      </div>
    `;
  }

  /** Muestra mensaje de error en pantalla */
  function showError(message) {
    detailContainer.innerHTML = `
      <div class="detail-error-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="error-icon-large"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h2>Experiencia no encontrada</h2>
        <p>${message}</p>
        <a href="actividades.html" class="btn-back-home">Volver a actividades</a>
      </div>
    `;
  }

  // Carga inicial
  fetchActivityDetail();
});
