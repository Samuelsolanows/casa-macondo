/**
 * modal.js
 * Maneja la lógica de la ventana emergente (modal) de Registro e Inicio de Sesión.
 * Controla la apertura, el cierre y el cambio entre las vistas de Registro y Login.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Selección de elementos del DOM ----
  const authModal      = document.getElementById('authModal');
  const btnReservar    = document.querySelector('.btn-reservar');
  const closeModalBtn  = document.getElementById('closeModalBtn');
  const toLoginBtn     = document.getElementById('toLoginBtn');
  const toRegisterBtn  = document.getElementById('toRegisterBtn');
  const registerView   = document.getElementById('registerView');
  const loginView      = document.getElementById('loginView');

  // ---- Funciones principales ----

  /** Abre la ventana emergente y muestra la vista de Registro por defecto. */
  function openModal() {
    authModal.classList.add('active');
    registerView.classList.remove('hidden');
    loginView.classList.add('hidden');
  }

  /** Cierra la ventana emergente. */
  function closeModal() {
    authModal.classList.remove('active');
  }

  // ---- Eventos de apertura / cierre ----

  // Botón "Reservar" en la cabecera → abrir modal en vista Registro
  btnReservar.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  // Botón "×" dentro del modal → cerrar
  closeModalBtn.addEventListener('click', closeModal);

  // Click en el overlay (fondo oscuro) → cerrar
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Tecla Escape → cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // ---- Cambio entre vistas (Registro ↔ Login) ----

  // "¿Ya tienes una cuenta? Inicia sesión" → mostrar vista Login
  toLoginBtn.addEventListener('click', () => {
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
  });

  // "¿No tienes una cuenta? Regístrate" → mostrar vista Registro
  toRegisterBtn.addEventListener('click', () => {
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
  });
});
