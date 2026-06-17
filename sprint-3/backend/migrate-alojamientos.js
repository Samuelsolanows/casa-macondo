const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'casamacondo'
});

const defaultMapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5134706596163!2d-72.6318536!3d7.6063996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e665a38bbd1cfdb%3A0xc331a980997fa2ee!2sBochalema%2C%20Norte%20de%20Santander!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco';

const seedAlojamientos = [
  {
    nombre: 'Eco-Villa con Ofuro',
    descripcion: 'Vive una experiencia romántica y relajante única en nuestra Eco-Villa con Ofuro privado. Esta cabaña de diseño ecológico combina madera natural, vistas espectaculares al bosque y un baño tradicional japonés (Ofuro) climatizado a leña en tu balcón privado. El refugio perfecto para parejas que buscan intimidad y conexión profunda con la naturaleza.',
    precio_noche: 350000,
    capacidad: 2,
    habitaciones: 1,
    camas: 1,
    servicios: 'Ofuro Privado,Wifi de alta velocidad,Agua Caliente,Desayuno Incluido,Calefacción,Mini Bar',
    mapa_embed_url: defaultMapUrl,
    imagenes: [
      'img/ofuro_1.png',
      'img/ofuro_2.png',
      'img/ofuro_3.png'
    ]
  },
  {
    nombre: 'Eco-Villa sin Ofuro',
    descripcion: 'Disfruta de la comodidad y tranquilidad de nuestra Eco-Villa estándar. Con un diseño triangular A-Frame y grandes ventanales de vidrio templado, esta cabaña ofrece una vista panorámica inigualable del amanecer entre los pinos. Cuenta con una terraza privada perfecta para disfrutar del café de la mañana en medio de la paz absoluta.',
    precio_noche: 280000,
    capacidad: 2,
    habitaciones: 1,
    camas: 1,
    servicios: 'Terraza Privada,Wifi de alta velocidad,Agua Caliente,Desayuno Incluido,Cafetera Express,Hamaca',
    mapa_embed_url: defaultMapUrl,
    imagenes: [
      'img/sin_ofuro_1.png',
      'img/ofuro_2.png',
      'img/ofuro_3.png'
    ]
  },
  {
    nombre: 'Cabaña Familiar Macondo',
    descripcion: 'El espacio ideal para crear recuerdos memorables con los tuyos. Nuestra Cabaña Familiar Macondo cuenta con dos plantas rústicas, amplias zonas comunes y capacidad para hasta 6 huéspedes. Dispone de una zona exterior con fogón privado, cocina totalmente dotada y todo el confort necesario para una estadía familiar en el bosque.',
    precio_noche: 480000,
    capacidad: 6,
    habitaciones: 2,
    camas: 4,
    servicios: 'Cocina Equipada,Zona de Fogata,Parqueadero Privado,Wifi de alta velocidad,Agua Caliente,Área de Asados',
    mapa_embed_url: defaultMapUrl,
    imagenes: [
      'img/fogata_main.png',
      'img/ofuro_2.png',
      'img/ofuro_3.png'
    ]
  }
];

async function run() {
  try {
    const connection = await pool.getConnection();
    console.log('🔄 Iniciando migración de Alojamientos...');

    // 1. Crear tabla alojamientos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alojamientos (
        id_alojamiento INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        precio_noche INT NOT NULL,
        capacidad INT NOT NULL,
        habitaciones INT NOT NULL,
        camas INT NOT NULL,
        servicios VARCHAR(255) NOT NULL,
        mapa_embed_url TEXT NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "alojamientos" creada o verificada.');

    // 2. Crear tabla alojamiento_imagenes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alojamiento_imagenes (
        id_imagen INT PRIMARY KEY AUTO_INCREMENT,
        id_alojamiento INT NOT NULL,
        imagen_ruta VARCHAR(255) NOT NULL,
        FOREIGN KEY (id_alojamiento) REFERENCES alojamientos(id_alojamiento) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabla "alojamiento_imagenes" creada o verificada.');

    // 3. Sembrar datos
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM alojamientos');
    if (rows[0].count === 0) {
      console.log('🌱 Sembrando datos predeterminados de hospedajes...');
      for (const cabin of seedAlojamientos) {
        const [result] = await connection.query(
          `INSERT INTO alojamientos 
           (nombre, descripcion, precio_noche, capacidad, habitaciones, camas, servicios, mapa_embed_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cabin.nombre,
            cabin.descripcion,
            cabin.precio_noche,
            cabin.capacidad,
            cabin.habitaciones,
            cabin.camas,
            cabin.servicios,
            cabin.mapa_embed_url
          ]
        );

        const newId = result.insertId;

        for (const imgPath of cabin.imagenes) {
          await connection.query(
            `INSERT INTO alojamiento_imagenes (id_alojamiento, imagen_ruta) VALUES (?, ?)`,
            [newId, imgPath]
          );
        }
      }
      console.log('✅ Siembra de alojamientos y carruseles completada.');
    } else {
      console.log('ℹ️ La tabla "alojamientos" ya contiene registros. Omitiendo siembra.');
    }

    connection.release();
    await pool.end();
    console.log('🚀 Migración de alojamientos finalizada.');
  } catch (error) {
    console.error('❌ Error durante la migración de alojamientos:', error);
  }
}

run();
