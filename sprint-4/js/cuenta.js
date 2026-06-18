/**
 * cuenta.js
 * Maneja la lógica de la página de Perfil y Panel de Administración de Bochalema 360.
 * Realiza peticiones al API de backend para actualizar perfil y realizar operaciones CRUD.
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api';

  // ---- Autenticación y Carga de Usuario ----
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    // Si no está logueado, redirigir a Index.html
    alert('Acceso no autorizado. Por favor inicia sesión primero.');
    window.location.href = 'Index.html';
    return;
  }

  const currentUser = JSON.parse(userJson);

  // Chart instances (Sprint 4)
  let chartPagesInstance = null;
  let chartDaysInstance = null;

  // ---- Elementos comunes de la interfaz ----
  const userSidebarName = document.getElementById('userSidebarName');
  const userSidebarRole = document.getElementById('userSidebarRole');
  const userAvatarLetter = document.getElementById('userAvatarLetter');
  const profileRoleText = document.getElementById('profileRoleText');

  // Rellenar datos en la barra lateral
  userSidebarName.textContent = currentUser.nombre;
  userSidebarRole.textContent = currentUser.id_rol === 1 ? 'Administrador' : 'Usuario';
  userAvatarLetter.textContent = currentUser.nombre.charAt(0).toUpperCase();
  profileRoleText.textContent = currentUser.id_rol === 1 ? 'Administrador' : 'Usuario';

  // ---- Manejo de Tabs (Pestañas) ----
  const tabButtons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.account-section');

  function activateTab(tabName) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    sections.forEach(sec => {
      if (sec.id === `${tabName}Section`) {
        sec.classList.add('active');
        sec.style.display = 'block';
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });

    // Cargar datos
    if (tabName === 'activities') {
      loadActivities();
    } else if (tabName === 'accommodations') {
      loadAccommodations();
    } else if (tabName === 'ventures') {
      loadVentures();
    } else if (tabName === 'events') {
      loadEvents();
    } else if (tabName === 'stats') {
      loadStats();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      activateTab(targetTab);
    });
  });

  // Mostrar tabs de admin si es administrador (id_rol === 1)
  if (currentUser.id_rol === 1) {
    document.getElementById('tabAdminActivities').classList.remove('hidden');
    document.getElementById('tabAdminAccommodations').classList.remove('hidden');
    document.getElementById('tabAdminEvents').classList.remove('hidden');
    document.getElementById('tabAdminStats').classList.remove('hidden');
  }
  // Activar pestaña por defecto para todos: Mi Perfil
  activateTab('profile');

  // ---- Lógica de Perfil (Actualizar datos) ----
  const profileForm = document.getElementById('profileForm');
  const profileAlert = document.getElementById('profileAlert');

  // Rellenar campos del perfil
  document.getElementById('profileName').value = currentUser.nombre;
  document.getElementById('profileEmail').value = currentUser.correo;
  document.getElementById('profilePhone').value = currentUser.telefono || '';

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      profileAlert.innerHTML = ''; // Limpiar alertas

      const nombre = document.getElementById('profileName').value.trim();
      const correo = document.getElementById('profileEmail').value.trim();
      const telefono = document.getElementById('profilePhone').value.trim();
      const contrasena = document.getElementById('profileCurrentPassword').value;
      const nuevaContrasena = document.getElementById('profileNewPassword').value;
      const confirmNuevaContrasena = document.getElementById('profileConfirmNewPassword').value;

      // Validación de cambio de contraseña
      if (nuevaContrasena || confirmNuevaContrasena) {
        if (!contrasena) {
          showFormAlert(profileAlert, 'error', 'Debes ingresar tu contraseña actual para cambiarla.');
          return;
        }
        if (nuevaContrasena !== confirmNuevaContrasena) {
          showFormAlert(profileAlert, 'error', 'La nueva contraseña y su confirmación no coinciden.');
          return;
        }
        if (nuevaContrasena.length < 6) {
          showFormAlert(profileAlert, 'error', 'La nueva contraseña debe tener al menos 6 caracteres.');
          return;
        }
      }

      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id_usuario
          },
          body: JSON.stringify({ nombre, correo, telefono, contrasena, nuevaContrasena })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ocurrió un error al actualizar el perfil.');
        }

        // Éxito
        showFormAlert(profileAlert, 'success', '¡Perfil actualizado exitosamente!');
        
        // Actualizar datos de sesión local
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser.nombre = data.user.nombre;
        currentUser.correo = data.user.correo;
        currentUser.telefono = data.user.telefono;

        // Actualizar barra lateral
        userSidebarName.textContent = data.user.nombre;
        userAvatarLetter.textContent = data.user.nombre.charAt(0).toUpperCase();

        // Limpiar campos de contraseña
        document.getElementById('profileCurrentPassword').value = '';
        document.getElementById('profileNewPassword').value = '';
        document.getElementById('profileConfirmNewPassword').value = '';

      } catch (err) {
        showFormAlert(profileAlert, 'error', err.message);
      }
    });
  }

  // ---- CRUD: ADMINISTRACIÓN DE ACTIVIDADES ----
  let allActivities = [];
  const activitiesTableBody = document.getElementById('activitiesTableBody');
  const adminActivitySearch = document.getElementById('adminActivitySearch');
  const btnAddActivity = document.getElementById('btnAddActivity');
  
  // Modal de Actividad
  const activityModal = document.getElementById('activityModal');
  const closeActivityModalBtn = document.getElementById('closeActivityModalBtn');
  const activityForm = document.getElementById('activityForm');
  const activityModalTitle = document.getElementById('activityModalTitle');
  const activityIdField = document.getElementById('activityIdField');

  // Buscar/filtrar actividades
  if (adminActivitySearch) {
    adminActivitySearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allActivities.filter(act => 
        act.nombre.toLowerCase().includes(query) ||
        act.descripcion.toLowerCase().includes(query) ||
        act.categoria.toLowerCase().includes(query)
      );
      renderActivitiesTable(filtered);
    });
  }

  // Cargar lista de actividades del backend
  async function loadActivities() {
    try {
      const response = await fetch(`${API_URL}/actividades`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las actividades.');
      }
      
      allActivities = data;
      renderActivitiesTable(allActivities);
    } catch (err) {
      activitiesTableBody.innerHTML = `<tr><td colspan="6" class="table-empty-state text-error">Error: ${err.message}</td></tr>`;
    }
  }

  // Renderizar la tabla de actividades
  function renderActivitiesTable(list) {
    if (list.length === 0) {
      activitiesTableBody.innerHTML = '<tr><td colspan="6" class="table-empty-state">No se encontraron actividades.</td></tr>';
      return;
    }

    activitiesTableBody.innerHTML = '';
    list.forEach(act => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${act.id_actividad}</td>
        <td><img src="${act.imagen_ruta || act.imagen_principal}" alt="${act.nombre}" class="table-img" onerror="this.src='img/fogata_main.png'" /></td>
        <td><strong>${act.nombre}</strong></td>
        <td><span class="role-badge">${act.categoria}</span></td>
        <td class="table-desc-cell">${act.descripcion}</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-edit" title="Editar" data-id="${act.id_actividad}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-table-delete" title="Eliminar" data-id="${act.id_actividad}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      `;

      // Vincular eventos a los botones de la fila
      tr.querySelector('.btn-table-edit').addEventListener('click', () => openEditActivityModal(act));
      tr.querySelector('.btn-table-delete').addEventListener('click', () => deleteActivity(act.id_actividad, act.nombre));

      activitiesTableBody.appendChild(tr);
    });
  }

  // Abrir Modal de Agregar Actividad
  if (btnAddActivity) {
    btnAddActivity.addEventListener('click', () => {
      activityModalTitle.textContent = 'Agregar Actividad';
      activityIdField.value = '';
      activityForm.reset();
      activityModal.classList.add('active');
    });
  }

  // Cerrar Modal de Actividad
  if (closeActivityModalBtn) {
    closeActivityModalBtn.addEventListener('click', () => {
      activityModal.classList.remove('active');
    });
  }

  // Pre-llenar y abrir modal para Editar
  function openEditActivityModal(act) {
    activityModalTitle.textContent = 'Editar Actividad';
    activityIdField.value = act.id_actividad;
    document.getElementById('activityNameField').value = act.nombre;
    document.getElementById('activityCategoryField').value = act.categoria;
    document.getElementById('activityDescField').value = act.descripcion;
    document.getElementById('activityImgPrincipalField').value = act.imagen_ruta || act.imagen_principal || '';
    document.getElementById('activityImgSecundariaField').value = act.imagen_secundaria_ruta || act.imagen_secondary || act.imagen_secundaria || '';
    document.getElementById('activityLatitudeField').value = act.latitud || '';
    document.getElementById('activityLongitudeField').value = act.longitud || '';
    
    activityModal.classList.add('active');
  }

  // Enviar formulario (Guardar o Actualizar)
  if (activityForm) {
    activityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = activityIdField.value;
      const nombre = document.getElementById('activityNameField').value.trim();
      const categoria = document.getElementById('activityCategoryField').value;
      const descripcion = document.getElementById('activityDescField').value.trim();
      const imagen_principal = document.getElementById('activityImgPrincipalField').value.trim();
      const imagen_secundaria = document.getElementById('activityImgSecundariaField').value.trim();
      const latitud = document.getElementById('activityLatitudeField').value.trim();
      const longitud = document.getElementById('activityLongitudeField').value.trim();

      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `${API_URL}/actividades/${id}` : `${API_URL}/actividades`;

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id_usuario
          },
          body: JSON.stringify({ nombre, categoria, descripcion, imagen_principal, imagen_secundaria, latitud, longitud })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al guardar la actividad.');
        }

        alert(id ? 'Actividad actualizada con éxito.' : 'Actividad agregada con éxito.');
        activityModal.classList.remove('active');
        loadActivities();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Eliminar Actividad
  async function deleteActivity(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la actividad "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/actividades/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id_usuario
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la actividad.');
      }

      alert('Actividad eliminada con éxito.');
      loadActivities();
    } catch (err) {
      alert(err.message);
    }
  }


  // ---- CRUD: ADMINISTRACIÓN DE ALOJAMIENTOS ----
  let allAccommodations = [];
  const accommodationsTableBody = document.getElementById('accommodationsTableBody');
  const adminAccommodationSearch = document.getElementById('adminAccommodationSearch');
  const btnAddAccommodation = document.getElementById('btnAddAccommodation');

  // Modal de Alojamiento
  const accommodationModal = document.getElementById('accommodationModal');
  const closeAccommodationModalBtn = document.getElementById('closeAccommodationModalBtn');
  const accommodationForm = document.getElementById('accommodationForm');
  const accommodationModalTitle = document.getElementById('accommodationModalTitle');
  const accommodationIdField = document.getElementById('accommodationIdField');

  // Buscar/filtrar alojamientos
  if (adminAccommodationSearch) {
    adminAccommodationSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allAccommodations.filter(aloj => 
        aloj.nombre.toLowerCase().includes(query) ||
        aloj.servicios.toLowerCase().includes(query) ||
        aloj.capacidad.toString().includes(query)
      );
      renderAccommodationsTable(filtered);
    });
  }

  // Cargar lista de alojamientos del backend
  async function loadAccommodations() {
    try {
      const response = await fetch(`${API_URL}/alojamientos`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los alojamientos.');
      }
      
      allAccommodations = data;
      renderAccommodationsTable(allAccommodations);
    } catch (err) {
      accommodationsTableBody.innerHTML = `<tr><td colspan="8" class="table-empty-state text-error">Error: ${err.message}</td></tr>`;
    }
  }

  // Renderizar la tabla de alojamientos
  function renderAccommodationsTable(list) {
    if (list.length === 0) {
      accommodationsTableBody.innerHTML = '<tr><td colspan="8" class="table-empty-state">No se encontraron alojamientos.</td></tr>';
      return;
    }

    accommodationsTableBody.innerHTML = '';
    list.forEach(aloj => {
      // Formatear precio
      const priceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(aloj.precio_noche);
      const firstImg = (aloj.imagenes && aloj.imagenes.length > 0) ? aloj.imagenes[0] : 'img/ofuro_1.png';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${aloj.id_alojamiento}</td>
        <td><img src="${firstImg}" alt="${aloj.nombre}" class="table-img" onerror="this.src='img/ofuro_1.png'" /></td>
        <td><strong>${aloj.nombre}</strong></td>
        <td>${aloj.capacidad} personas</td>
        <td>${aloj.habitaciones} habs / ${aloj.camas} camas</td>
        <td><strong class="color-cream">${priceFormatted}</strong></td>
        <td class="table-desc-cell">${aloj.servicios}</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-edit" title="Editar" data-id="${aloj.id_alojamiento}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-table-delete" title="Eliminar" data-id="${aloj.id_alojamiento}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      `;

      // Eventos
      tr.querySelector('.btn-table-edit').addEventListener('click', () => openEditAccommodationModal(aloj));
      tr.querySelector('.btn-table-delete').addEventListener('click', () => deleteAccommodation(aloj.id_alojamiento, aloj.nombre));

      accommodationsTableBody.appendChild(tr);
    });
  }

  // Abrir Modal de Agregar Alojamiento
  if (btnAddAccommodation) {
    btnAddAccommodation.addEventListener('click', () => {
      accommodationModalTitle.textContent = 'Agregar Alojamiento';
      accommodationIdField.value = '';
      accommodationForm.reset();
      accommodationModal.classList.add('active');
    });
  }

  // Cerrar Modal de Alojamiento
  if (closeAccommodationModalBtn) {
    closeAccommodationModalBtn.addEventListener('click', () => {
      accommodationModal.classList.remove('active');
    });
  }

  // Pre-llenar y abrir modal para Editar
  async function openEditAccommodationModal(aloj) {
    try {
      // Necesitamos fetchear los detalles completos por el tema de las imágenes individuales
      const response = await fetch(`${API_URL}/alojamientos/${aloj.id_alojamiento}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los detalles del alojamiento.');
      }

      accommodationModalTitle.textContent = 'Editar Alojamiento';
      accommodationIdField.value = data.id_alojamiento;
      
      document.getElementById('accommodationNameField').value = data.nombre;
      document.getElementById('accommodationPriceField').value = data.precio_noche;
      document.getElementById('accommodationCapacityField').value = data.capacidad;
      document.getElementById('accommodationRoomsField').value = data.habitaciones;
      document.getElementById('accommodationBedsField').value = data.camas;
      document.getElementById('accommodationDescField').value = data.descripcion;
      document.getElementById('accommodationServicesField').value = data.servicios;
      document.getElementById('accommodationMapField').value = data.mapa_embed_url || '';
      
      // Unir las imágenes con coma para mostrarlas en la caja de texto
      document.getElementById('accommodationImagesField').value = data.imagenes ? data.imagenes.join(', ') : '';

      accommodationModal.classList.add('active');
    } catch (err) {
      alert(`Error al cargar datos: ${err.message}`);
    }
  }

  // Enviar formulario Alojamiento (Guardar o Actualizar)
  if (accommodationForm) {
    accommodationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = accommodationIdField.value;
      const nombre = document.getElementById('accommodationNameField').value.trim();
      const precio_noche = parseInt(document.getElementById('accommodationPriceField').value);
      const capacidad = parseInt(document.getElementById('accommodationCapacityField').value);
      const habitaciones = parseInt(document.getElementById('accommodationRoomsField').value);
      const camas = parseInt(document.getElementById('accommodationBedsField').value);
      const descripcion = document.getElementById('accommodationDescField').value.trim();
      const servicios = document.getElementById('accommodationServicesField').value.trim();
      const mapa_embed_url = document.getElementById('accommodationMapField').value.trim();
      
      // Parsear imágenes separadas por coma
      const imgRaw = document.getElementById('accommodationImagesField').value;
      const imagenes = imgRaw.split(',').map(s => s.trim()).filter(s => s !== '');

      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `${API_URL}/alojamientos/${id}` : `${API_URL}/alojamientos`;

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id_usuario
          },
          body: JSON.stringify({
            nombre,
            descripcion,
            precio_noche,
            capacidad,
            habitaciones,
            camas,
            servicios,
            mapa_embed_url,
            imagenes
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al guardar el alojamiento.');
        }

        alert(id ? 'Alojamiento actualizado con éxito.' : 'Alojamiento agregado con éxito.');
        accommodationModal.classList.remove('active');
        loadAccommodations();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Eliminar Alojamiento
  async function deleteAccommodation(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el hospedaje "${nombre}"? Se borrarán en cascada todas sus fotos asociadas.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/alojamientos/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id_usuario
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el alojamiento.');
      }

      alert('Alojamiento eliminado con éxito.');
      loadAccommodations();
    } catch (err) {
      alert(err.message);
    }
  }


  // ---- CRUD: MIS EMPRENDIMIENTOS ----
  let allVentures = [];
  const venturesTableBody = document.getElementById('venturesTableBody');
  const adminVentureSearch = document.getElementById('adminVentureSearch');
  const btnAddVenture = document.getElementById('btnAddVenture');
  const ventureModal = document.getElementById('ventureModal');
  const closeVentureModalBtn = document.getElementById('closeVentureModalBtn');
  const ventureForm = document.getElementById('ventureForm');
  const ventureModalTitle = document.getElementById('ventureModalTitle');
  const ventureIdField = document.getElementById('ventureIdField');

  // Buscar/filtrar emprendimientos
  if (adminVentureSearch) {
    adminVentureSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allVentures.filter(v => 
        v.nombre.toLowerCase().includes(query) ||
        v.descripcion.toLowerCase().includes(query) ||
        v.categoria.toLowerCase().includes(query)
      );
      renderVenturesTable(filtered);
    });
  }

  async function loadVentures() {
    try {
      if (venturesTableBody) {
        venturesTableBody.innerHTML = '<tr><td colspan="7" class="table-empty-state">Cargando emprendimientos...</td></tr>';
      }
      const response = await fetch(`${API_URL}/emprendimientos/mis-negocios`, {
        headers: { 'x-user-id': currentUser.id_usuario }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los emprendimientos.');
      }
      allVentures = data;
      renderVenturesTable(allVentures);
    } catch (err) {
      if (venturesTableBody) {
        venturesTableBody.innerHTML = `<tr><td colspan="7" class="table-empty-state text-error">Error: ${err.message}</td></tr>`;
      }
    }
  }

  function renderVenturesTable(list) {
    if (!venturesTableBody) return;
    if (list.length === 0) {
      venturesTableBody.innerHTML = '<tr><td colspan="7" class="table-empty-state">No tienes emprendimientos registrados.</td></tr>';
      return;
    }
    venturesTableBody.innerHTML = '';
    list.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.id_emprendimiento}</td>
        <td><img src="${v.imagen_ruta}" alt="${v.nombre}" class="table-img" onerror="this.src='img/sitios_main.png'" /></td>
        <td><strong>${v.nombre}</strong></td>
        <td><span class="role-badge">${v.categoria}</span></td>
        <td>${v.contacto}</td>
        <td class="table-desc-cell">${v.descripcion}</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-edit" title="Editar" data-id="${v.id_emprendimiento}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-table-delete" title="Eliminar" data-id="${v.id_emprendimiento}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      `;
      tr.querySelector('.btn-table-edit').addEventListener('click', () => openEditVentureModal(v));
      tr.querySelector('.btn-table-delete').addEventListener('click', () => deleteVenture(v.id_emprendimiento, v.nombre));
      venturesTableBody.appendChild(tr);
    });
  }

  if (btnAddVenture) {
    btnAddVenture.addEventListener('click', () => {
      ventureModalTitle.textContent = 'Agregar Emprendimiento';
      ventureIdField.value = '';
      ventureForm.reset();
      ventureModal.classList.add('active');
    });
  }

  if (closeVentureModalBtn) {
    closeVentureModalBtn.addEventListener('click', () => {
      ventureModal.classList.remove('active');
    });
  }

  function openEditVentureModal(v) {
    ventureModalTitle.textContent = 'Editar Emprendimiento';
    ventureIdField.value = v.id_emprendimiento;
    document.getElementById('ventureNameField').value = v.nombre;
    document.getElementById('ventureCategoryField').value = v.categoria;
    document.getElementById('ventureContactField').value = v.contacto;
    document.getElementById('ventureDescField').value = v.descripcion;
    document.getElementById('ventureImgField').value = v.imagen_ruta;
    ventureModal.classList.add('active');
  }

  if (ventureForm) {
    ventureForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = ventureIdField.value;
      const nombre = document.getElementById('ventureNameField').value.trim();
      const categoria = document.getElementById('ventureCategoryField').value;
      const contacto = document.getElementById('ventureContactField').value.trim();
      const descripcion = document.getElementById('ventureDescField').value.trim();
      const imagen_ruta = document.getElementById('ventureImgField').value.trim();

      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `${API_URL}/emprendimientos/${id}` : `${API_URL}/emprendimientos`;

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id_usuario
          },
          body: JSON.stringify({ nombre, categoria, contacto, descripcion, imagen_ruta })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al guardar el emprendimiento.');
        alert(id ? 'Emprendimiento actualizado.' : 'Emprendimiento registrado.');
        ventureModal.classList.remove('active');
        loadVentures();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  async function deleteVenture(id, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el emprendimiento "${nombre}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/emprendimientos/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id_usuario }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar.');
      alert('Emprendimiento eliminado.');
      loadVentures();
    } catch (err) {
      alert(err.message);
    }
  }

  // ---- CRUD: ADMINISTRACIÓN DE EVENTOS ----
  let allEvents = [];
  const eventsTableBody = document.getElementById('eventsTableBody');
  const btnAddEvent = document.getElementById('btnAddEvent');
  const eventModal = document.getElementById('eventModal');
  const closeEventModalBtn = document.getElementById('closeEventModalBtn');
  const eventForm = document.getElementById('eventForm');
  const eventModalTitle = document.getElementById('eventModalTitle');
  const eventIdField = document.getElementById('eventIdField');

  async function loadEvents() {
    try {
      if (eventsTableBody) {
        eventsTableBody.innerHTML = '<tr><td colspan="7" class="table-empty-state">Cargando eventos...</td></tr>';
      }
      const response = await fetch(`${API_URL}/eventos`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los eventos.');
      }
      allEvents = data;
      renderEventsTable(allEvents);
    } catch (err) {
      if (eventsTableBody) {
        eventsTableBody.innerHTML = `<tr><td colspan="7" class="table-empty-state text-error">Error: ${err.message}</td></tr>`;
      }
    }
  }

  function renderEventsTable(list) {
    if (!eventsTableBody) return;
    if (list.length === 0) {
      eventsTableBody.innerHTML = '<tr><td colspan="7" class="table-empty-state">No hay eventos programados.</td></tr>';
      return;
    }
    eventsTableBody.innerHTML = '';
    list.forEach(evt => {
      const dateStr = evt.fecha ? evt.fecha.split('T')[0] : '';
      const timeStr = evt.hora || 'Por confirmar';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evt.id_evento}</td>
        <td><img src="${evt.imagen_ruta || 'img/sitios_main.png'}" alt="${evt.titulo}" class="table-img" onerror="this.src='img/sitios_main.png'" /></td>
        <td><strong>${evt.titulo}</strong></td>
        <td>${dateStr} <br/><small>${timeStr}</small></td>
        <td>${evt.lugar}</td>
        <td>${evt.organizador}</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-edit" title="Editar" data-id="${evt.id_evento}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-table-delete" title="Eliminar" data-id="${evt.id_evento}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      `;
      tr.querySelector('.btn-table-edit').addEventListener('click', () => openEditEventModal(evt));
      tr.querySelector('.btn-table-delete').addEventListener('click', () => deleteEvent(evt.id_evento, evt.titulo));
      eventsTableBody.appendChild(tr);
    });
  }

  if (btnAddEvent) {
    btnAddEvent.addEventListener('click', () => {
      eventModalTitle.textContent = 'Agregar Evento';
      eventIdField.value = '';
      eventForm.reset();
      eventModal.classList.add('active');
    });
  }

  if (closeEventModalBtn) {
    closeEventModalBtn.addEventListener('click', () => {
      eventModal.classList.remove('active');
    });
  }

  function openEditEventModal(evt) {
    eventModalTitle.textContent = 'Editar Evento';
    eventIdField.value = evt.id_evento;
    document.getElementById('eventTitleField').value = evt.titulo;
    const dateStr = evt.fecha ? evt.fecha.split('T')[0] : '';
    document.getElementById('eventDateField').value = dateStr;
    document.getElementById('eventTimeField').value = evt.hora || '';
    document.getElementById('eventPlaceField').value = evt.lugar;
    document.getElementById('eventOrganizerField').value = evt.organizador;
    document.getElementById('eventImgField').value = evt.imagen_ruta || '';
    document.getElementById('eventDescField').value = evt.descripcion;
    eventModal.classList.add('active');
  }

  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = eventIdField.value;
      const titulo = document.getElementById('eventTitleField').value.trim();
      const fecha = document.getElementById('eventDateField').value;
      const hora = document.getElementById('eventTimeField').value || null;
      const lugar = document.getElementById('eventPlaceField').value.trim();
      const organizador = document.getElementById('eventOrganizerField').value.trim();
      const imagen_ruta = document.getElementById('eventImgField').value.trim() || null;
      const descripcion = document.getElementById('eventDescField').value.trim();

      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `${API_URL}/eventos/${id}` : `${API_URL}/eventos`;

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id_usuario
          },
          body: JSON.stringify({ titulo, fecha, hora, lugar, organizador, imagen_ruta, descripcion })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al guardar el evento.');
        alert(id ? 'Evento actualizado.' : 'Evento publicado.');
        eventModal.classList.remove('active');
        loadEvents();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  async function deleteEvent(id, titulo) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el evento "${titulo}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/eventos/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser.id_usuario }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar.');
      alert('Evento eliminado.');
      loadEvents();
    } catch (err) {
      alert(err.message);
    }
  }

  // ---- CARGAR ESTADÍSTICAS Y GRÁFICOS (Sprint 4) ----
  async function loadStats() {
    try {
      const response = await fetch(`${API_URL}/visitas/stats`, {
        headers: { 'x-user-id': currentUser.id_usuario }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las estadísticas.');
      }
      
      // Llenar tarjetas
      document.getElementById('statsTotalVisits').textContent = data.totalVisits;
      document.getElementById('statsTotalUsers').textContent = data.totalUsers;
      document.getElementById('statsMostVisitedPage').textContent = data.visitsByPage.length > 0 ? data.visitsByPage[0].ruta : '-';
      
      // Preparar datos para Gráfico de Páginas
      const pageLabels = data.visitsByPage.map(item => item.ruta);
      const pageCounts = data.visitsByPage.map(item => item.count);
      
      // Destruir gráficos anteriores si existen
      if (chartPagesInstance) chartPagesInstance.destroy();
      if (chartDaysInstance) chartDaysInstance.destroy();
      
      // Gráfico de Páginas (Bar)
      const ctxPages = document.getElementById('chartPages').getContext('2d');
      chartPagesInstance = new Chart(ctxPages, {
        type: 'bar',
        data: {
          labels: pageLabels,
          datasets: [{
            label: 'Visitas',
            data: pageCounts,
            backgroundColor: 'rgba(11, 61, 46, 0.75)',
            borderColor: '#0b3d2e',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(243, 233, 228, 0.08)' },
              ticks: { color: 'rgba(243, 233, 228, 0.7)' }
            },
            x: {
              grid: { display: false },
              ticks: { color: 'rgba(243, 233, 228, 0.7)' }
            }
          }
        }
      });
      
      // Preparar datos para Gráfico de Días
      const dayLabels = data.visitsByDay.map(item => item.date);
      const dayCounts = data.visitsByDay.map(item => item.count);
      
      // Gráfico de Días (Line)
      const ctxDays = document.getElementById('chartDays').getContext('2d');
      chartDaysInstance = new Chart(ctxDays, {
        type: 'line',
        data: {
          labels: dayLabels,
          datasets: [{
            label: 'Visitas Diarias',
            data: dayCounts,
            fill: true,
            backgroundColor: 'rgba(11, 61, 46, 0.25)',
            borderColor: '#0b3d2e',
            borderWidth: 3,
            tension: 0.3,
            pointBackgroundColor: '#f3e9e4',
            pointBorderColor: '#0b3d2e',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(243, 233, 228, 0.08)' },
              ticks: { color: 'rgba(243, 233, 228, 0.7)' }
            },
            x: {
              grid: { display: false },
              ticks: { color: 'rgba(243, 233, 228, 0.7)' }
            }
          }
        }
      });
      
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }


  // ---- Funciones auxiliares ----
  function showFormAlert(container, type, message) {
    container.innerHTML = `<div class="crud-alert auth-alert-${type}">${message}</div>`;
  }
});
