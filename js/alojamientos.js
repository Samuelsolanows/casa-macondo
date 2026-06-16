/**
 * alojamientos.js
 * Carga dinámica de alojamientos desde el backend e inicialización de carruseles interactivos.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/alojamientos';
  const alojamientosList = document.getElementById('alojamientosList');

  /** Fetch accommodations from server and render */
  async function fetchAndRenderAlojamientos() {
    try {
      alojamientosList.innerHTML = '<div class="loading-spinner">Cargando cabañas exclusivas...</div>';

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al conectar con la base de datos de alojamientos.');
      }

      const cabins = await response.json();
      renderAlojamientosGrid(cabins);
      initializeCarousels();

    } catch (error) {
      console.error(error);
      alojamientosList.innerHTML = `
        <div class="activities-error" style="grid-column: 1 / -1; text-align: center; color: rgba(243, 233, 228, 0.6); border: 1px dashed rgba(243, 233, 228, 0.15); padding: 4rem 2rem; border-radius: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>No pudimos cargar los alojamientos. Asegúrate de que el servidor backend esté corriendo.</p>
        </div>
      `;
    }
  }

  /** Render HTML cards structure for accommodations */
  function renderAlojamientosGrid(cabins) {
    if (cabins.length === 0) {
      alojamientosList.innerHTML = '<div class="activities-no-results"><p>No hay alojamientos registrados.</p></div>';
      return;
    }

    alojamientosList.innerHTML = cabins.map(cabin => {
      const servicesArray = cabin.servicios.split(',');

      return `
        <div class="alojamiento-card" data-id="${cabin.id_alojamiento}">
          <!-- Carrusel de imágenes -->
          <div class="cabin-carousel">
            <div class="carousel-track">
              ${cabin.imagenes.map(img => `
                <div class="carousel-slide">
                  <img src="${img}" alt="${cabin.nombre}" loading="lazy" />
                </div>
              `).join('')}
            </div>
            <!-- Flechas de navegación -->
            <button class="carousel-arrow prev-arrow" aria-label="Foto anterior">&lsaquo;</button>
            <button class="carousel-arrow next-arrow" aria-label="Siguiente foto">&rsaquo;</button>
            <!-- Puntos de navegación -->
            <div class="carousel-dots">
              ${cabin.imagenes.map((_, index) => `
                <button class="carousel-dot ${index === 0 ? 'active' : ''}" aria-label="Ir a foto ${index + 1}"></button>
              `).join('')}
            </div>
          </div>
          
          <!-- Información del hospedaje -->
          <div class="alojamiento-info">
            <h3 class="alojamiento-title">${cabin.nombre}</h3>
            
            <!-- Meta especificaciones -->
            <div class="alojamiento-meta-row">
              <span class="alojamiento-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                ${cabin.capacidad} Huéspedes
              </span>
              <span class="alojamiento-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v18H2z"></path><path d="M2 12h20"></path><path d="M12 2v10"></path></svg>
                ${cabin.habitaciones} Dormitorios
              </span>
            </div>

            <!-- Precio y Botón -->
            <div class="alojamiento-action-row">
              <div class="alojamiento-price-wrapper">
                <span class="price-value">$${cabin.precio_noche.toLocaleString('es-CO')}</span>
                <span class="price-label">/ noche</span>
              </div>
              <a href="alojamiento-detalle.html?id=${cabin.id_alojamiento}" class="btn-cabin-detail">Ver cabaña</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /** Initialize event listeners for carousels inside each card */
  function initializeCarousels() {
    const cards = document.querySelectorAll('.alojamiento-card');
    
    cards.forEach(card => {
      const track = card.querySelector('.carousel-track');
      const slides = card.querySelectorAll('.carousel-slide');
      const prevBtn = card.querySelector('.prev-arrow');
      const nextBtn = card.querySelector('.next-arrow');
      const dots = card.querySelectorAll('.carousel-dot');
      
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

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentSlide = (currentSlide - 1 + maxSlides) % maxSlides;
        updateCarousel();
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentSlide = (currentSlide + 1) % maxSlides;
        updateCarousel();
      });

      dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          currentSlide = index;
          updateCarousel();
        });
      });
    });
  }

  // Carga inicial
  fetchAndRenderAlojamientos();
});
