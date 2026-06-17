/**
 * modal.js
 * Maneja la lógica de la ventana emergente (modal) de Registro e Inicio de Sesión.
 * Controla la apertura, el cierre, el cambio entre vistas y la conexión con el backend de MySQL.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Configuración del Backend ----
  const API_URL = 'http://localhost:3000/api';

  // ---- Selección de elementos del DOM ----
  const authModal      = document.getElementById('authModal');
  const btnReservar    = document.querySelector('.btn-reservar');
  const closeModalBtn  = document.getElementById('closeModalBtn');
  const toLoginBtn     = document.getElementById('toLoginBtn');
  const toRegisterBtn  = document.getElementById('toRegisterBtn');
  const registerView   = document.getElementById('registerView');
  const loginView      = document.getElementById('loginView');

  // Formularios
  const registerForm   = document.getElementById('registerForm');
  const loginForm      = document.getElementById('loginForm');
  const footerRegisterBtn = document.getElementById('footerRegisterBtn');

  // ---- Funciones principales ----

  function updateHeaderSession() {
    const userJson = localStorage.getItem('user');
    const navRight = document.querySelector('.nav-menu.nav-right');
    if (!navRight) return;

    // Remove any previously added dynamic buttons to avoid duplicates
    const oldDynamicItems = navRight.querySelectorAll('.dynamic-session-item');
    oldDynamicItems.forEach(item => item.remove());

    const btnReservar = navRight.querySelector('.btn-reservar');

    if (userJson) {
      const user = JSON.parse(userJson);
      
      // Hide standard btnReservar
      if (btnReservar) {
        btnReservar.style.display = 'none';
      }

      // Create "Mi Cuenta" link
      const myAccountLink = document.createElement('a');
      myAccountLink.href = 'cuenta.html';
      myAccountLink.className = 'dynamic-session-item nav-account-link';
      myAccountLink.textContent = 'Mi Cuenta';
      myAccountLink.style.marginRight = '1.5rem';

      // Create "Cerrar Sesión" button
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'dynamic-session-item btn-reservar btn-logout';
      logoutBtn.textContent = 'Cerrar Sesión';
      logoutBtn.style.backgroundColor = '#7a1d1d';
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        updateHeaderSession();
        if (window.location.pathname.includes('cuenta.html')) {
          window.location.href = 'Index.html';
        } else {
          window.location.reload();
        }
      });

      // Insert before menu toggle or append
      const menuToggle = navRight.querySelector('.menu-toggle');
      if (menuToggle) {
        navRight.insertBefore(myAccountLink, menuToggle);
        navRight.insertBefore(logoutBtn, menuToggle);
      } else {
        navRight.appendChild(myAccountLink);
        navRight.appendChild(logoutBtn);
      }
    } else {
      // Show standard btnReservar
      if (btnReservar) {
        btnReservar.style.display = 'block';
      }
    }
  }

  // Ejecutar al cargar la página
  updateHeaderSession();

  /** Abre la ventana emergente y muestra la vista de Registro por defecto. */
  function openModal() {
    authModal.classList.add('active');
    registerView.classList.remove('hidden');
    loginView.classList.add('hidden');
    clearAlerts(registerForm);
    clearAlerts(loginForm);
  }

  /** Cierra la ventana emergente. */
  function closeModal() {
    authModal.classList.remove('active');
  }

  /** Muestra un mensaje de alerta (éxito/error) de manera atractiva en un formulario. */
  function showFormAlert(form, type, message) {
    clearAlerts(form);

    const alertDiv = document.createElement('div');
    alertDiv.className = `auth-alert auth-alert-${type}`;
    alertDiv.textContent = message;

    // Insertar al inicio del formulario
    form.insertBefore(alertDiv, form.firstChild);
  }

  /** Elimina las alertas de un formulario. */
  function clearAlerts(form) {
    if (!form) return;
    const existingAlert = form.querySelector('.auth-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
  }

  // ---- Eventos de apertura / cierre ----

  // Botón "Reservar" en la cabecera → abrir modal en vista Registro
  if (btnReservar) {
    btnReservar.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Enlace "Registro" en el footer de la página de detalle
  if (footerRegisterBtn) {
    footerRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Botón "×" dentro del modal → cerrar
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  // Click en el overlay (fondo oscuro) → cerrar
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeModal();
      }
    });
  }

  // Tecla Escape → cerrar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // ---- Cambio entre vistas (Registro ↔ Login) ----

  // "¿Ya tienes una cuenta? Inicia sesión" → mostrar vista Login
  if (toLoginBtn) {
    toLoginBtn.addEventListener('click', () => {
      registerView.classList.add('hidden');
      loginView.classList.remove('hidden');
      clearAlerts(registerForm);
      clearAlerts(loginForm);
    });
  }

  // "¿No tienes una cuenta? Regístrate" → mostrar vista Registro
  if (toRegisterBtn) {
    toRegisterBtn.addEventListener('click', () => {
      loginView.classList.add('hidden');
      registerView.classList.remove('hidden');
      clearAlerts(registerForm);
      clearAlerts(loginForm);
    });
  }

  // ---- Envío de formularios (Conexión al Backend) ----

  // Registro de usuario
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('regName').value.trim();
      const correo = document.getElementById('regEmail').value.trim();
      const contrasena = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const telefono = document.getElementById('regPhone').value.trim();

      // Validación: Las contraseñas coinciden
      if (contrasena !== confirmPassword) {
        showFormAlert(registerForm, 'error', 'Las contraseñas no coinciden.');
        return;
      }

      // Validación: Largo de la contraseña
      if (contrasena.length < 6) {
        showFormAlert(registerForm, 'error', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombre, correo, contrasena, telefono })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ocurrió un error al registrar el usuario.');
        }

        // Éxito
        showFormAlert(registerForm, 'success', '¡Registro exitoso! Redirigiendo al inicio de sesión...');
        registerForm.reset();

        // Cambiar a la vista de Login tras 2 segundos
        setTimeout(() => {
          registerView.classList.add('hidden');
          loginView.classList.remove('hidden');
          clearAlerts(registerForm);
          // Pre-llenar el correo en el login para comodidad
          document.getElementById('loginEmail').value = correo;
        }, 2000);

      } catch (err) {
        showFormAlert(registerForm, 'error', err.message);
      }
    });
  }

  // Inicio de Sesión
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const correo = document.getElementById('loginEmail').value.trim();
      const contrasena = document.getElementById('loginPassword').value;

      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ correo, contrasena })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ocurrió un error al iniciar sesión.');
        }

        // Éxito
        showFormAlert(loginForm, 'success', `¡Inicio de sesión exitoso! Bienvenido de nuevo, ${data.user.nombre}.`);
        loginForm.reset();

        // Almacenar datos del usuario
        localStorage.setItem('user', JSON.stringify(data.user));
        updateHeaderSession();

        // Cerrar el modal tras 1.5 segundos
        setTimeout(() => {
          closeModal();
          window.location.reload();
        }, 1500);

      } catch (err) {
        showFormAlert(loginForm, 'error', err.message);
      }
    });
  }

  // ---- Registro Automático de Visitas (Sprint 4) ----
  (function trackVisit() {
    try {
      const pathParts = window.location.pathname.split('/');
      let page = pathParts[pathParts.length - 1] || 'Index.html';
      
      // Si la URL termina con barra, puede ser index
      if (page === '') page = 'Index.html';

      const userJson = localStorage.getItem('user');
      const userId = userJson ? JSON.parse(userJson).id_usuario : null;

      fetch('http://localhost:3000/api/visitas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ruta: page,
          id_usuario: userId
        })
      }).catch(err => console.warn('Error recording visit:', err));
    } catch (e) {
      console.warn('Stats tracker error:', e);
    }
  })();
});
