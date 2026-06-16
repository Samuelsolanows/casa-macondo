const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/alojamientos - Listar alojamientos con sus respectivas imágenes
router.get('/', async (req, res) => {
  try {
    const [alojamientos] = await db.query('SELECT * FROM alojamientos ORDER BY id_alojamiento ASC');
    
    // Obtener imágenes para cada alojamiento
    for (let i = 0; i < alojamientos.length; i++) {
      const [imagenes] = await db.query(
        'SELECT imagen_ruta FROM alojamiento_imagenes WHERE id_alojamiento = ? ORDER BY id_imagen ASC',
        [alojamientos[i].id_alojamiento]
      );
      alojamientos[i].imagenes = imagenes.map(img => img.imagen_ruta);
    }

    res.json(alojamientos);
  } catch (error) {
    console.error('Error al obtener alojamientos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de alojamientos de la base de datos.' });
  }
});

// GET /api/alojamientos/:id - Obtener detalles de un alojamiento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM alojamientos WHERE id_alojamiento = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'El alojamiento solicitado no existe.' });
    }

    const [imagenes] = await db.query(
      'SELECT imagen_ruta FROM alojamiento_imagenes WHERE id_alojamiento = ? ORDER BY id_imagen ASC',
      [id]
    );

    const alojamiento = rows[0];
    alojamiento.imagenes = imagenes.map(img => img.imagen_ruta);

    res.json(alojamiento);
  } catch (error) {
    console.error('Error al obtener detalle de alojamiento:', error);
    res.status(500).json({ error: 'Error al obtener los detalles del alojamiento.' });
  }
});

module.exports = router;
