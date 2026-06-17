const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbName = process.env.DB_NAME || 'casamacondo';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
});


const seedData = [
  {
    nombre: 'Jacuzzi',
    categoria: 'Bienestar',
    imagen_ruta: 'img/jacuzzi_main.png',
    imagen_secundaria_ruta: 'img/jacuzzi_sec.png',
    titulo_detalle: 'Relajación total en nuestro Jacuzzi climatizado',
    descripcion: 'Disfruta de un baño relajante en nuestro jacuzzi al aire libre. Un espacio pensado para desconectar, rodeado de un entorno verde espectacular que te permitirá reconectar con tu tranquilidad.',
    subtitulo_detalle: '¿Qué incluye esta experiencia de relajación?',
    descripcion_detalle: 'El acceso al jacuzzi cuenta con hidromasaje climatizado a temperatura regulable, ideal para descansar después de un día de caminata o exploración. La sesión incluye toallas y una bebida de cortesía.',
    latitud: 7.61110000,
    longitud: -72.63220000
  },
  {
    nombre: 'Fogata al aire libre',
    categoria: 'Experiencias',
    imagen_ruta: 'img/fogata_main.png',
    imagen_secundaria_ruta: 'img/fogata_sec.png',
    titulo_detalle: 'Vive la esencia de las noches en Casa Macondo',
    descripcion: 'Esta experiencia te invita a disfrutar de una velada única bajo el cielo estrellado, rodeado de naturaleza y tranquilidad. La fogata al aire libre crea un ambiente cálido y acogedor, ideal para compartir, relajarse y conectar con el entorno rural de una manera auténtica.',
    subtitulo_detalle: '¿Qué harás en esta experiencia?',
    descripcion_detalle: 'Nos reuniremos en un espacio abierto de Bochalema para encender una fogata y disfrutar de una noche especial en medio de la naturaleza. La actividad tiene una duración aproximada de 2 a 3 horas y se adapta al ambiente y dinámica del grupo.',
    latitud: 7.60850000,
    longitud: -72.63150000
  },
  {
    nombre: 'Cascadas naturales',
    categoria: 'Naturaleza',
    imagen_ruta: 'img/cascadas_main.png',
    imagen_secundaria_ruta: 'img/cascadas_sec.png',
    titulo_detalle: 'Explora el agua pura de las Cascadas Naturales',
    descripcion: 'Aventúrate en un sendero ecológico que te guiará hasta caídas de agua naturales de una belleza sin igual. Un baño refrescante en estas aguas cristalinas te recargará de energía y vitalidad.',
    subtitulo_detalle: '¿Cómo es la caminata ecológica?',
    descripcion_detalle: 'Recorreremos un sendero de dificultad media rodeado de vegetación nativa y avistamiento de aves de la región. Se recomienda llevar calzado cómodo para caminar en terreno húmedo y traje de baño.',
    latitud: 7.59500000,
    longitud: -72.64500000
  },
  {
    nombre: 'Termales',
    categoria: 'Bienestar',
    imagen_ruta: 'img/termales_main.png',
    imagen_secundaria_ruta: 'img/termales_sec.png',
    titulo_detalle: 'Aguas termales medicinales para renovar tu cuerpo',
    descripcion: 'Disfruta del calor reconfortante de las aguas termales ricas en minerales. Perfectas para aliviar tensiones musculares, mejorar la circulación y brindar bienestar absoluto a tu mente y cuerpo.',
    subtitulo_detalle: 'Beneficios de nuestras aguas termales',
    descripcion_detalle: 'Las piscinas termales mantienen una temperatura constante de 38°C. El alto contenido de azufre y minerales ayuda a exfoliar la piel de forma natural y relajar las articulaciones de manera óptima.',
    latitud: 7.62500000,
    longitud: -72.61800000
  },
  {
    nombre: 'Sitios Turísticos',
    categoria: 'Cultura',
    imagen_ruta: 'img/sitios_main.png',
    imagen_secundaria_ruta: 'img/sitios_sec.png',
    titulo_detalle: 'Descubre la riqueza histórica y cultural de Bochalema',
    descripcion: 'Recorre los lugares más emblemáticos del municipio. Desde su arquitectura colonial hasta sus plazas llenas de historia y costumbres locales que te harán viajar en el tiempo.',
    subtitulo_detalle: '¿Qué visitaremos en el recorrido?',
    descripcion_detalle: 'El tour incluye una caminata guiada por la plaza principal, la iglesia histórica, los monumentos locales de interés y una cata guiada de postres tradicionales del municipio.',
    latitud: 7.60640000,
    longitud: -72.63190000
  },
  {
    nombre: 'Turismo cafetero',
    categoria: 'Experiencias',
    imagen_ruta: 'img/turismo_main.png',
    imagen_secundaria_ruta: 'img/turismo_sec.png',
    titulo_detalle: 'El viaje del grano a la taza: Experiencia cafetera',
    descripcion: 'Sumérgete en la cultura del café. Aprende sobre el cultivo, la recolección manual de las cerezas de café, el proceso de secado y finaliza con una deliciosa cata para distinguir perfiles de sabor.',
    subtitulo_detalle: 'Aprende con expertos caficultores',
    descripcion_detalle: 'Recorreremos los cultivos de café de la mano de un experto productor que compartirá los secretos de un café de especialidad de excelente calidad. Aprenderás a preparar café en diferentes métodos de filtrado.',
    latitud: 7.60100000,
    longitud: -72.62500000
  }
];

async function run() {
  try {
    const connection = await pool.getConnection();
    console.log(`🔄 Creando base de datos "${dbName}" si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    console.log('🔄 Ejecutando migración...');


    // 1. Crear tabla de actividades si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS actividades (
        id_actividad INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) DEFAULT 'General',
        imagen_ruta VARCHAR(255) NOT NULL,
        imagen_secundaria_ruta VARCHAR(255),
        titulo_detalle VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        subtitulo_detalle VARCHAR(255) NOT NULL,
        descripcion_detalle TEXT NOT NULL,
        latitud DECIMAL(10, 8) DEFAULT NULL,
        longitud DECIMAL(11, 8) DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "actividades" creada o ya existente.');

    // 2. Verificar y agregar columnas si no existen
    const [columns] = await connection.query('SHOW COLUMNS FROM actividades');
    const hasLat = columns.some(col => col.Field === 'latitud');
    const hasLon = columns.some(col => col.Field === 'longitud');

    if (!hasLat) {
      console.log('Adding "latitud" column to "actividades" table...');
      await connection.query('ALTER TABLE actividades ADD COLUMN latitud DECIMAL(10, 8) DEFAULT NULL');
    }
    if (!hasLon) {
      console.log('Adding "longitud" column to "actividades" table...');
      await connection.query('ALTER TABLE actividades ADD COLUMN longitud DECIMAL(11, 8) DEFAULT NULL');
    }

    // 3. Verificar si ya hay registros
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM actividades');
    if (rows[0].count === 0) {
      console.log('🌱 Sembrando datos de actividades de Casa Macondo...');
      for (const item of seedData) {
        await connection.query(
          `INSERT INTO actividades 
           (nombre, categoria, imagen_ruta, imagen_secundaria_ruta, titulo_detalle, descripcion, subtitulo_detalle, descripcion_detalle, latitud, longitud) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.nombre,
            item.categoria,
            item.imagen_ruta,
            item.imagen_secundaria_ruta,
            item.titulo_detalle,
            item.descripcion,
            item.subtitulo_detalle,
            item.descripcion_detalle,
            item.latitud,
            item.longitud
          ]
        );
      }
      console.log('✅ Siembra de actividades completada exitosamente.');
    } else {
      console.log('ℹ️ La tabla "actividades" ya contiene registros. Actualizando coordenadas si están vacías...');
      for (const item of seedData) {
        await connection.query(
          `UPDATE actividades SET latitud = ?, longitud = ? WHERE nombre = ? AND (latitud IS NULL OR longitud IS NULL)`,
          [item.latitud, item.longitud, item.nombre]
        );
      }
      console.log('✅ Coordenadas de actividades actualizadas.');
    }

    // 4. Crear tabla de emprendimientos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS emprendimientos (
        id_emprendimiento INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        contacto VARCHAR(100) NOT NULL,
        imagen_ruta VARCHAR(255) NOT NULL,
        id_usuario INT NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabla "emprendimientos" creada o ya existente.');

    // 5. Crear tabla de eventos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id_evento INT PRIMARY KEY AUTO_INCREMENT,
        titulo VARCHAR(150) NOT NULL,
        descripcion TEXT NOT NULL,
        fecha DATE NOT NULL,
        hora TIME DEFAULT NULL,
        lugar VARCHAR(150) NOT NULL,
        imagen_ruta VARCHAR(255) DEFAULT NULL,
        organizador VARCHAR(100) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "eventos" creada o ya existente.');

    // 6. Sembrar emprendimientos si está vacía
    const [empRows] = await connection.query('SELECT COUNT(*) as count FROM emprendimientos');
    if (empRows[0].count === 0) {
      const [users] = await connection.query('SELECT id_usuario FROM usuarios LIMIT 1');
      const defaultUserId = users.length > 0 ? users[0].id_usuario : 1;

      const seedEmprendimientos = [
        {
          nombre: 'Café Don Macondo',
          descripcion: 'El mejor café de especialidad cosechado en las laderas de Bochalema. Ofrecemos catas guiadas y café molido de origen único.',
          categoria: 'Gastronomía',
          contacto: '+57 301 234 5678',
          imagen_ruta: 'img/turismo_main.png'
        },
        {
          nombre: 'Artesanías El Portal',
          descripcion: 'Tienda de artesanías locales fabricadas a mano con materiales tradicionales de la región. Sombreros, cestería y decoración.',
          categoria: 'Artesanías',
          contacto: 'artesanias@portal.com',
          imagen_ruta: 'img/sitios_main.png'
        },
        {
          nombre: 'Guías Bochalema Aventura',
          descripcion: 'Servicio de guías locales certificados para senderismo y paseos ecológicos por las cascadas y termales de la región.',
          categoria: 'Guías',
          contacto: 'bochalema@adventure.com',
          imagen_ruta: 'img/cascadas_main.png'
        }
      ];

      console.log('🌱 Sembrando datos de emprendimientos...');
      for (const item of seedEmprendimientos) {
        await connection.query(
          `INSERT INTO emprendimientos (nombre, descripcion, categoria, contacto, imagen_ruta, id_usuario) VALUES (?, ?, ?, ?, ?, ?)`,
          [item.nombre, item.descripcion, item.categoria, item.contacto, item.imagen_ruta, defaultUserId]
        );
      }
      console.log('✅ Siembra de emprendimientos completada.');
    }

    // 7. Sembrar eventos si está vacía
    const [evtRows] = await connection.query('SELECT COUNT(*) as count FROM eventos');
    if (evtRows[0].count === 0) {
      const seedEventos = [
        {
          titulo: 'Feria del Café Especial',
          descripcion: 'Disfruta de una jornada llena de aromas y sabores. Cata de café de la región, charlas con productores locales y exhibición de barismo en Casa Macondo.',
          fecha: '2026-08-20',
          hora: '09:00:00',
          lugar: 'Casa Macondo',
          organizador: 'Asocafé Bochalema',
          imagen_ruta: 'img/turismo_sec.png'
        },
        {
          titulo: 'Festival de Luces de Bochalema',
          descripcion: 'Tradicional festival de luces y faroles para celebrar el inicio de la navidad en el Parque Principal con muestras artísticas y pólvora fría.',
          fecha: '2026-12-07',
          hora: '18:00:00',
          lugar: 'Parque Principal',
          organizador: 'Alcaldía de Bochalema',
          imagen_ruta: 'img/sitios_sec.png'
        },
        {
          titulo: 'Caminata Ecológica de Luna Llena',
          descripcion: 'Aventúrate en un recorrido nocturno por el sendero ecológico de Las Cascadas iluminados únicamente por la luz de la luna llena. Cupos limitados.',
          fecha: '2026-07-28',
          hora: '19:30:00',
          lugar: 'Sendero Las Cascadas',
          organizador: 'Bochalema Aventura',
          imagen_ruta: 'img/cascadas_sec.png'
        }
      ];

      console.log('🌱 Sembrando datos de eventos...');
      for (const item of seedEventos) {
        await connection.query(
          `INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, organizador, imagen_ruta) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.titulo, item.descripcion, item.fecha, item.hora, item.lugar, item.organizador, item.imagen_ruta]
        );
      }
      console.log('✅ Siembra de eventos completada.');
    }

    // 8. Crear tabla de visitas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id_visita INT PRIMARY KEY AUTO_INCREMENT,
        ruta VARCHAR(100) NOT NULL,
        id_usuario INT DEFAULT NULL,
        fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
      );
    `);
    console.log('✅ Tabla "visitas" creada o ya existente.');

    // 9. Sembrar visitas si está vacía
    const [visitRows] = await connection.query('SELECT COUNT(*) as count FROM visitas');
    if (visitRows[0].count === 0) {
      console.log('🌱 Sembrando datos de visitas de prueba...');
      
      const routes = [
        'Index.html',
        'alojamientos.html',
        'actividades.html',
        'emprendimientos.html',
        'eventos.html',
        'alojamiento-detalle.html',
        'cuenta.html'
      ];

      // Generar 120 visitas mock repartidas en los últimos 7 días
      for (let i = 0; i < 120; i++) {
        const route = routes[Math.floor(Math.random() * routes.length)];
        // Días hacia atrás (entre 0 y 6)
        const daysAgo = Math.floor(Math.random() * 7);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        // Formato para MySQL TIMESTAMP: YYYY-MM-DD HH:MM:SS
        const timestampStr = date.toISOString().slice(0, 19).replace('T', ' ');

        await connection.query(
          'INSERT INTO visitas (ruta, id_usuario, fecha_hora) VALUES (?, NULL, ?)',
          [route, timestampStr]
        );
      }
      console.log('✅ Siembra de visitas completada.');
    }

    connection.release();
    await pool.end();
    console.log('🚀 Migración finalizada con éxito.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

run();
