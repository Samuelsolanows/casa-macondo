const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'casamacondo'
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
    descripcion_detalle: 'El acceso al jacuzzi cuenta con hidromasaje climatizado a temperatura regulable, ideal para descansar después de un día de caminata o exploración. La sesión incluye toallas y una bebida de cortesía.'
  },
  {
    nombre: 'Fogata al aire libre',
    categoria: 'Experiencias',
    imagen_ruta: 'img/fogata_main.png',
    imagen_secundaria_ruta: 'img/fogata_sec.png',
    titulo_detalle: 'Vive la esencia de las noches en Casa Macondo',
    descripcion: 'Esta experiencia te invita a disfrutar de una velada única bajo el cielo estrellado, rodeado de naturaleza y tranquilidad. La fogata al aire libre crea un ambiente cálido y acogedor, ideal para compartir, relajarse y conectar con el entorno rural de una manera auténtica.',
    subtitulo_detalle: '¿Qué harás en esta experiencia?',
    descripcion_detalle: 'Nos reuniremos en un espacio abierto de Bochalema para encender una fogata y disfrutar de una noche especial en medio de la naturaleza. La actividad tiene una duración aproximada de 2 a 3 horas y se adapta al ambiente y dinámica del grupo.'
  },
  {
    nombre: 'Cascadas naturales',
    categoria: 'Naturaleza',
    imagen_ruta: 'img/cascadas_main.png',
    imagen_secundaria_ruta: 'img/cascadas_sec.png',
    titulo_detalle: 'Explora el agua pura de las Cascadas Naturales',
    descripcion: 'Aventúrate en un sendero ecológico que te guiará hasta caídas de agua naturales de una belleza sin igual. Un baño refrescante en estas aguas cristalinas te recargará de energía y vitalidad.',
    subtitulo_detalle: '¿Cómo es la caminata ecológica?',
    descripcion_detalle: 'Recorreremos un sendero de dificultad media rodeado de vegetación nativa y avistamiento de aves de la región. Se recomienda llevar calzado cómodo para caminar en terreno húmedo y traje de baño.'
  },
  {
    nombre: 'Termales',
    categoria: 'Bienestar',
    imagen_ruta: 'img/termales_main.png',
    imagen_secundaria_ruta: 'img/termales_sec.png',
    titulo_detalle: 'Aguas termales medicinales para renovar tu cuerpo',
    descripcion: 'Disfruta del calor reconfortante de las aguas termales ricas en minerales. Perfectas para aliviar tensiones musculares, mejorar la circulación y brindar bienestar absoluto a tu mente y cuerpo.',
    subtitulo_detalle: 'Beneficios de nuestras aguas termales',
    descripcion_detalle: 'Las piscinas termales mantienen una temperatura constante de 38°C. El alto contenido de azufre y minerales ayuda a exfoliar la piel de forma natural y relajar las articulaciones de manera óptima.'
  },
  {
    nombre: 'Sitios Turísticos',
    categoria: 'Cultura',
    imagen_ruta: 'img/sitios_main.png',
    imagen_secundaria_ruta: 'img/sitios_sec.png',
    titulo_detalle: 'Descubre la riqueza histórica y cultural de Bochalema',
    descripcion: 'Recorre los lugares más emblemáticos del municipio. Desde su arquitectura colonial hasta sus plazas llenas de historia y costumbres locales que te harán viajar en el tiempo.',
    subtitulo_detalle: '¿Qué visitaremos en el recorrido?',
    descripcion_detalle: 'El tour incluye una caminata guiada por la plaza principal, la iglesia histórica, los monumentos locales de interés y una cata guiada de postres tradicionales del municipio.'
  },
  {
    nombre: 'Turismo cafetero',
    categoria: 'Experiencias',
    imagen_ruta: 'img/turismo_main.png',
    imagen_secundaria_ruta: 'img/turismo_sec.png',
    titulo_detalle: 'El viaje del grano a la taza: Experiencia cafetera',
    descripcion: 'Sumérgete en la cultura del café. Aprende sobre el cultivo, la recolección manual de las cerezas de café, el proceso de secado y finaliza con una deliciosa cata para distinguir perfiles de sabor.',
    subtitulo_detalle: 'Aprende con expertos caficultores',
    descripcion_detalle: 'Recorreremos los cultivos de café de la mano de un experto productor que compartirá los secretos de un café de especialidad de excelente calidad. Aprenderás a preparar café en diferentes métodos de filtrado.'
  }
];

async function run() {
  try {
    const connection = await pool.getConnection();
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
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "actividades" creada o ya existente.');

    // 2. Verificar si ya hay registros
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM actividades');
    if (rows[0].count === 0) {
      console.log('🌱 Sembrando datos de actividades de Casa Macondo...');
      for (const item of seedData) {
        await connection.query(
          `INSERT INTO actividades 
           (nombre, categoria, imagen_ruta, imagen_secundaria_ruta, titulo_detalle, descripcion, subtitulo_detalle, descripcion_detalle) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.nombre,
            item.categoria,
            item.imagen_ruta,
            item.imagen_secundaria_ruta,
            item.titulo_detalle,
            item.descripcion,
            item.subtitulo_detalle,
            item.descripcion_detalle
          ]
        );
      }
      console.log('✅ Siembra de actividades completada exitosamente.');
    } else {
      console.log('ℹ️ La tabla "actividades" ya contiene registros. Omitiendo siembra.');
    }

    connection.release();
    await pool.end();
    console.log('🚀 Migración finalizada con éxito.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

run();
