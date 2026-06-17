const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/actividades - Listar actividades (soporta búsqueda opcional ?search=...)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM actividades ORDER BY id_actividad ASC';
    let params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query = `
        SELECT * FROM actividades 
        WHERE nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?
        ORDER BY id_actividad ASC
      `;
      params = [searchTerm, searchTerm, searchTerm];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener las actividades de la base de datos.' });
  }
});

// GET /api/actividades/:id - Obtener detalle de una actividad específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM actividades WHERE id_actividad = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'La actividad solicitada no existe.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener detalle de actividad:', error);
    res.status(500).json({ error: 'Error al obtener el detalle de la actividad.' });
  }
});

module.exports = router;
