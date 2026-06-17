/**
 * events.js
 * Maneja la carga dinámica y visualización cronológica de eventos turísticos y culturales de Bochalema.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/eventos';
  const eventsList = document.getElementById('eventsList');

  /** Fetch events from database */
  async function fetchAndRenderEvents() {
    try {
      eventsList.innerHTML = '<div class="loading-spinner">Cargando eventos programados...</div>';

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos de eventos.');
      }

      const events = await response.json();
      renderEventsGrid(events);

    } catch (error) {
      console.error(error);
      eventsList.innerHTML = `
        <div class="activities-error" style="grid-column: 1 / -1; text-align: center; color: rgba(243, 233, 228, 0.6); padding: 4rem 2rem; border: 1px dashed rgba(243, 233, 228, 0.15); border-radius: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>No pudimos cargar los eventos. Asegúrate de que el servidor backend esté corriendo.</p>
        </div>
      `;
    }
  }

  /** Render events to card list */
  function renderEventsGrid(events) {
    if (events.length === 0) {
      eventsList.innerHTML = `
        <div class="activities-no-results" style="grid-column: 1 / -1; text-align: center; color: rgba(243, 233, 228, 0.5); padding: 4rem 2rem;">
          <p>No hay eventos programados en este momento. ¡Vuelve pronto!</p>
        </div>
      `;
      return;
    }

    eventsList.innerHTML = events.map(evt => {
      // Parsear fecha para el badge calendario
      // Formato: YYYY-MM-DD
      const dateParts = evt.fecha.split('T')[0].split('-');
      const year = dateParts[0];
      const monthIndex = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);

      const monthsShort = [
        'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
        'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
      ];
      const monthName = monthsShort[monthIndex] || 'EVENTO';

      // Formato legible de hora
      let formattedTime = 'Hora por confirmar';
      if (evt.hora) {
        const timeParts = evt.hora.split(':');
        const hour = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        formattedTime = `${displayHour}:${minutes} ${ampm}`;
      }

      // Formato legible de fecha completo (para el detalle)
      const monthsFull = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const fullDateStr = `${day} de ${monthsFull[monthIndex]} de ${year}`;

      return `
        <div class="event-card">
          <div class="event-img-wrapper">
            <img src="${evt.imagen_ruta || 'img/sitios_main.png'}" alt="${evt.titulo}" class="event-img" loading="lazy" onerror="this.src='img/sitios_main.png'" />
            <div class="event-date-badge">
              <span class="event-date-day">${day}</span>
              <span class="event-date-month">${monthName}</span>
            </div>
          </div>
          <div class="event-body">
            <h3 class="event-title">${evt.titulo}</h3>
            <p class="event-desc">${evt.descripcion}</p>
            <div class="event-details-list">
              <div class="event-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span><span class="event-detail-label">Hora:</span> ${formattedTime}</span>
              </div>
              <div class="event-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span><span class="event-detail-label">Lugar:</span> ${evt.lugar}</span>
              </div>
              <div class="event-detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span><span class="event-detail-label">Organiza:</span> ${evt.organizador}</span>
              </div>
              <div class="event-detail-item" style="margin-top: 0.2rem; font-weight: 500;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>${fullDateStr}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Inicialización
  fetchAndRenderEvents();
});
