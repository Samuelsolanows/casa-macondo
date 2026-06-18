/**
 * alojamiento-detail.js
 * Carga los detalles de una cabaña específica, monta su galería de fotos,
 * servicios y el mapa interactivo de Google Maps.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/alojamientos';
  const detailContainer = document.getElementById('alojamientoDetailContent');

  // Obtener el ID desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const cabinId = urlParams.get('id');

  if (!cabinId) {
    showError('No se especificó ningún alojamiento para mostrar.');
    return;
  }

  /** Fetch lodging details by ID */
  async function fetchCabinDetail() {
    try {
      detailContainer.innerHTML = '<div class="loading-spinner-large">Cargando el hospedaje...</div>';

      const response = await fetch(`${API_URL}/${cabinId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El alojamiento solicitado no existe.');
        }
        throw new Error('Error al conectar con el servidor.');
      }

      const cabin = await response.json();
      renderCabinDetail(cabin);
      initializeGalleryCarousel();
      setupBookingForm(cabin);

    } catch (err) {
      console.error(err);
      showError(err.message || 'Ocurrió un error al cargar la información.');
    }
  }

  /** Render details layout */
  function renderCabinDetail(cabin) {
    document.title = `${cabin.nombre} - Bochalema 360`;

    const services = cabin.servicios.split(',');

    detailContainer.innerHTML = `
      <!-- Título Superior -->
      <div class="cabin-detail-header">
        <a href="alojamientos.html" class="btn-back-to-list">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver a Alojamientos
        </a>
        <h1 class="cabin-detail-title">${cabin.nombre}</h1>
      </div>

      <!-- Layout de Dos Columnas -->
      <div class="cabin-detail-layout">
        <!-- Columna Izquierda: Galería y Descripción -->
        <div class="cabin-detail-main">
          <!-- Galería de fotos (Carrusel Grande) -->
          <div class="cabin-gallery-carousel">
            <div class="gallery-track">
              ${cabin.imagenes.map(img => `
                <div class="gallery-slide">
                  <img src="${img}" alt="${cabin.nombre}" />
                </div>
              `).join('')}
            </div>
            <button class="gallery-arrow prev-arrow" aria-label="Foto anterior">&lsaquo;</button>
            <button class="gallery-arrow next-arrow" aria-label="Siguiente foto">&rsaquo;</button>
            <div class="gallery-dots">
              ${cabin.imagenes.map((_, index) => `
                <button class="gallery-dot ${index === 0 ? 'active' : ''}"></button>
              `).join('')}
            </div>
          </div>

          <!-- Descripción -->
          <div class="cabin-description-section">
            <h2>Acerca de esta cabaña</h2>
            <p class="cabin-desc-text">${cabin.descripcion}</p>
          </div>

          <!-- Especificaciones Técnicas -->
          <div class="cabin-specs-grid">
            <div class="spec-card">
              <span class="spec-value">${cabin.capacidad}</span>
              <span class="spec-label">Huéspedes Máx.</span>
            </div>
            <div class="spec-card">
              <span class="spec-value">${cabin.habitaciones}</span>
              <span class="spec-label">Dormitorios</span>
            </div>
            <div class="spec-card">
              <span class="spec-value">${cabin.camas}</span>
              <span class="spec-label">Camas</span>
            </div>
          </div>

          <!-- Servicios Incluidos -->
          <div class="cabin-services-section">
            <h2>Servicios y comodidades</h2>
            <div class="services-list-grid">
              ${services.map(service => `
                <div class="service-list-item">
                  <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>${service.trim()}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Tarjeta de Reserva y Ubicación -->
        <aside class="cabin-detail-sidebar">
          <!-- Tarjeta de Reserva -->
          <div class="booking-card">
            <div class="booking-card-price">
              <span class="price-amount">$${cabin.precio_noche.toLocaleString('es-CO')}</span>
              <span class="price-label">/ noche</span>
            </div>
            
            <form class="booking-sidebar-form" id="cabinBookingForm">
              <div class="booking-form-group">
                <label for="bookingCheckIn">Llegada (Check-In)</label>
                <input type="date" id="bookingCheckIn" required />
              </div>
              <div class="booking-form-group">
                <label for="bookingCheckOut">Salida (Check-Out)</label>
                <input type="date" id="bookingCheckOut" required />
              </div>
              <div class="booking-form-group">
                <label for="bookingGuests">Huéspedes</label>
                <select id="bookingGuests">
                  ${Array.from({ length: cabin.capacidad }, (_, i) => `<option value="${i + 1}">${i + 1} ${i === 0 ? 'persona' : 'personas'}</option>`).join('')}
                </select>
              </div>
              
              <button type="submit" class="btn-confirm-booking">Reservar Cabaña</button>
            </form>
          </div>

          <!-- Mapa de Ubicación -->
          <div class="map-card">
            <h3>Ubicación</h3>
            <p class="map-location-sub">Bochalema, Norte de Santander</p>
            <div class="map-iframe-wrapper">
              <iframe 
                src="${cabin.mapa_embed_url}" 
                width="100%" 
                height="220" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  /** Initialize gallery carousel */
  function initializeGalleryCarousel() {
    const track = document.querySelector('.gallery-track');
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.cabin-gallery-carousel .prev-arrow');
    const nextBtn = document.querySelector('.cabin-gallery-carousel .next-arrow');
    const dots = document.querySelectorAll('.gallery-dot');
    
    let currentSlide = 0;
    const maxSlides = slides.length;

    if (maxSlides <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    function updateCarousel() {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }

    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + maxSlides) % maxSlides;
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % maxSlides;
      updateCarousel();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
      });
    });
  }

  /** Booking form handler */
  function setupBookingForm(cabin) {
    const form = document.getElementById('cabinBookingForm');
    if (!form) return;

    // Establecer fechas mínimas (hoy y mañana)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkInInput = document.getElementById('bookingCheckIn');
    const checkOutInput = document.getElementById('bookingCheckOut');

    checkInInput.min = today.toISOString().split('T')[0];
    checkOutInput.min = tomorrow.toISOString().split('T')[0];

    checkInInput.addEventListener('change', () => {
      const selectedDate = new Date(checkInInput.value);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutInput.min = nextDay.toISOString().split('T')[0];
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Verificar si el usuario está logueado
      const user = localStorage.getItem('user');
      if (!user) {
        // Guardar la intención de reserva para reanudar después del login
        localStorage.setItem('pending_booking', JSON.stringify({
          cabinId: cabin.id_alojamiento,
          checkIn: checkInInput.value,
          checkOut: checkOutInput.value,
          guests: document.getElementById('bookingGuests').value
        }));

        // Abrir el modal de Login
        const authModal = document.getElementById('authModal');
        if (authModal) {
          authModal.classList.add('active');
          document.getElementById('registerView').classList.add('hidden');
          document.getElementById('loginView').classList.remove('hidden');
        }
        return;
      }

      // Si está logueado
      const userData = JSON.parse(user);
      alert(`¡Solicitud de Reserva Recibida!\n\nCabaña: ${cabin.nombre}\nHuésped: ${userData.nombre}\nLlegada: ${checkInInput.value}\nSalida: ${checkOutInput.value}\nTotal: $${(cabin.precio_noche * calculateDays(checkInInput.value, checkOutInput.value)).toLocaleString('es-CO')}`);
    });
  }

  function calculateDays(start, end) {
    const date1 = new Date(start);
    const date2 = new Date(end);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  /** Render error message */
  function showError(message) {
    detailContainer.innerHTML = `
      <div class="detail-error-container" style="text-align: center; padding: 8rem 2rem; max-width: 500px; margin: 0 auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h2 style="font-family: var(--font-heading); font-size: 2.4rem; margin-bottom: 1rem;">Hospedaje no encontrado</h2>
        <p style="font-size: 0.95rem; color: rgba(243, 233, 228, 0.6); margin-bottom: 2rem;">${message}</p>
        <a href="alojamientos.html" class="btn-back-home" style="display: inline-block; background-color: var(--color-cream); color: #0b1511; padding: 0.85rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); transition: transform 0.2s, background-color 0.2s;">Volver a Alojamientos</a>
      </div>
    `;
  }

  // Carga inicial
  fetchCabinDetail();
});
