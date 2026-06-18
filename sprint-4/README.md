# Bochalema 360 - Bochalema

En **Bochalema 360** impulsamos el sector turístico de Bochalema, Norte de Santander, mostrando sus maravillosos atractivos naturales, actividades al aire libre, y ofreciendo una experiencia premium de hospedaje en nuestras exclusivas cabañas ecológicas. 

Este proyecto es una aplicación web completa con un backend en **Node.js/Express** y base de datos **MySQL**, diseñada bajo un concepto visual moderno, elegante y responsivo que destaca por su estética de lujo y fluidez de interacción.

---

## 🌟 Características del Proyecto

- **Diseño Estético Premium:** Paleta de colores selecta (verde pino `#0B3D2E`, crema `#F3E9E4` y acabados oscuros) con micro-animaciones y tipografías exclusivas (*Abhaya Libre* y *Montserrat*).
- **Módulo de Actividades:** Listado interactivo de experiencias y atractivos locales con buscador en tiempo real, filtros por categoría y páginas de detalle con diagramación alterna de alta calidad.
- **Módulo de Alojamientos:** Catálogo de hospedajes (Eco-Villas con Ofuro, sin Ofuro y Cabañas Familiares) con carruseles de imágenes deslizables integrados en las tarjetas y vista detallada con mapa de Google Maps interactivo.
- **Sistema de Autenticación Completo:** Registro de usuarios, inicio de sesión mediante ventanas emergentes y almacenamiento seguro de contraseñas con encriptación **Bcrypt**.
- **Panel de Usuario y Perfil (Reactivado - Sprint 4):** Espacio personalizado para editar información de contacto y contraseña de forma segura.
- **Emprendimientos Locales (Sprint 3):** Catálogo público de negocios locales de Bochalema con buscador y filtros por categoría, junto con un panel de control para que cada usuario registrado publique y gestione sus propios emprendimientos.
- **Eventos Turísticos (Sprint 3):** Cartelera cronológica de celebraciones y actividades municipales de Bochalema, y formulario de publicación en el panel para administradores.
- **Estadísticas de Visitas (Sprint 4):** Monitoreo automático en el cliente mediante un script de rastreo y dashboard administrativo premium que visualiza métricas de visitas y usuarios registrados utilizando **Chart.js**.
- **Panel de Administración (CRUD Completo):** Dashboard exclusivo para administradores (`id_rol = 1`) que permite crear, editar y eliminar actividades, hospedajes y eventos en tiempo real.
- **Arquitectura de CSS Modular:** Separación limpia de estilos específicos de componentes para un mejor rendimiento y orden en el código.

---

## 🛠️ Tecnologías Utilizadas

### Frontend:
- HTML5 (Estructura semántica)
- CSS3 Modular (Animaciones, Variables CSS y Responsive Design)
- JavaScript (Interactividad en carruseles, datepickers, cambio de pestañas, Chart.js y llamadas asíncronas a la API)

### Backend & Base de Datos:
- Node.js & Express (Servidor y API REST)
- MySQL (Persistencia de datos relacional)
- Bcrypt.js (Seguridad y encriptación de credenciales)
- Dotenv (Gestión de variables de entorno)
- Cors (Control de acceso a recursos de origen cruzado)

---

## 📁 Estructura del Proyecto

```
CasaMacondo/
│
├── Index.html                  # Página de bienvenida e inicio de Bochalema 360
├── actividades.html            # Galería de atractivos turísticos y experiencias
├── actividad.html              # Vista detallada de una actividad individual
├── alojamientos.html           # Catálogo de cabañas y eco-villas disponibles
├── alojamiento-detalle.html    # Ficha técnica, mapa y reserva de cabaña
├── cuenta.html                 # Panel de perfil y administración (CRUD)
├── emprendimientos.html        # Catálogo público de negocios locales (Sprint 3)
├── eventos.html                # Cartelera cronológica de eventos (Sprint 3)
│
├── css/                        # Estilos modularizados
│   ├── index.css               # Estilos globales (Variables, header, footer, modales)
│   ├── home.css                # Estilos específicos del inicio (Hero, buscador)
│   ├── activities.css          # Estilos de actividades (Filtros y grids)
│   ├── accommodations.css      # Estilos de cabañas (Carruseles y mapas)
│   ├── account.css             # Estilos de perfil, tablas CRUD y estadísticas
│   ├── ventures.css            # Estilos de emprendimientos (Sprint 3)
│   └── events.css              # Estilos de eventos (Sprint 3)
│
├── js/                         # Lógica del cliente
│   ├── modal.js                # Ventanas de registro/login, estados del header y tracker de visitas
│   ├── activities.js           # Búsqueda y renderizado de atractivos
│   ├── activity-detail.js      # Carga asíncrona de detalle de actividad
│   ├── alojamientos.js         # Carruseles deslizables y carga de hospedajes
│   ├── alojamiento-detail.js   # Cotización y carga de mapa del hospedaje
│   ├── ventures.js             # Búsqueda y filtros de emprendimientos (Sprint 3)
│   ├── events.js               # Renderizado de eventos programados (Sprint 3)
│   └── cuenta.js               # Control de perfil, CRUD y carga de estadísticas (Sprint 4)
│
├── backend/                    # Servidor API REST
│   ├── server.js               # Punto de entrada y configuraciones del servidor
│   ├── db.js                   # Configuración del pool de conexión a MySQL
│   ├── migrate-db.js           # Script de creación de BD, tablas base y datos semilla (Sprints 1-4)
│   └── routes/                 # Controladores de rutas
│       ├── auth.js             # Rutas de login, registro y actualización de perfil
│       ├── actividades.js      # Rutas públicas y CRUD administrativo de actividades
│       ├── alojamientos.js     # Rutas públicas y CRUD administrativo de alojamientos
│       ├── emprendimientos.js  # Rutas públicas y CRUD de emprendimientos de usuarios (Sprint 3)
│       ├── eventos.js          # Rutas públicas y CRUD administrativo de eventos (Sprint 3)
│       └── visitas.js          # Rutas de registro y estadísticas analíticas (Sprint 4)
│
├── img/                        # Recursos visuales y fotografías del proyecto
└── sprint-1/ ... sprint-4/     # Carpetas de entregables independientes para cada Sprint
```

---

## 🚀 Instalación y Configuración

### Requisitos:
- Node.js (v14 o superior)
- Servidor MySQL activo (XAMPP, WampServer o local)

### Configuración del Servidor:
1. Dirígete a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configura el archivo de entorno creando un archivo `.env` en la raíz de `backend/` con los datos de tu conexión local:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=casamacondo
   ```
4. Ejecuta el script de migración (el cual crea automáticamente la base de datos `casamacondo` si no existe, inicializa las tablas e inserta los datos de prueba de todos los sprints):
   ```bash
   node migrate-db.js
   ```
5. Enciende el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *(El backend quedará disponible en `http://localhost:3000`)*.

