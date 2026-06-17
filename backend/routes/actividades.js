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

// Middleware helper to verify Admin role
const verifyAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado. Se requiere iniciar sesión.' });
  }
  try {
    const [users] = await db.query('SELECT id_rol FROM usuarios WHERE id_usuario = ?', [userId]);
    if (users.length === 0 || users[0].id_rol !== 1) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
  } catch (err) {
    console.error('Error al verificar admin:', err);
    res.status(500).json({ error: 'Error al verificar los permisos del usuario.' });
  }
};

// POST /api/actividades - Crear una nueva actividad (Admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, categoria, imagen_principal, imagen_secundaria, latitud, longitud } = req.body;
    const imagen_ruta = req.body.imagen_ruta || imagen_principal;
    const imagen_secundaria_ruta = req.body.imagen_secundaria_ruta || imagen_secundaria;

    if (!nombre || !descripcion || !categoria || !imagen_ruta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, descripcion, categoria, imagen_ruta o imagen_principal).' });
    }

    const lat = (latitud !== undefined && latitud !== null && latitud !== '') ? parseFloat(latitud) : null;
    const lon = (longitud !== undefined && longitud !== null && longitud !== '') ? parseFloat(longitud) : null;

    const titulo_detalle = nombre;
    const subtitulo_detalle = nombre;
    const descripcion_detalle = descripcion;

    const [result] = await db.query(
      `INSERT INTO actividades 
       (nombre, descripcion, categoria, imagen_ruta, imagen_secundaria_ruta, titulo_detalle, subtitulo_detalle, descripcion_detalle, latitud, longitud) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, categoria, imagen_ruta, imagen_secundaria_ruta || null, titulo_detalle, subtitulo_detalle, descripcion_detalle, lat, lon]
    );

    res.status(201).json({
      message: 'Actividad creada exitosamente.',
      id_actividad: result.insertId,
      nombre,
      descripcion,
      categoria,
      imagen_ruta,
      imagen_secundaria_ruta,
      latitud: lat,
      longitud: lon
    });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'Error al crear la actividad en la base de datos.' });
  }
});

// PUT /api/actividades/:id - Editar una actividad existente (Admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, imagen_principal, imagen_secundaria, latitud, longitud } = req.body;
    const imagen_ruta = req.body.imagen_ruta || imagen_principal;
    const imagen_secundaria_ruta = req.body.imagen_secundaria_ruta || imagen_secundaria;

    if (!nombre || !descripcion || !categoria || !imagen_ruta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, descripcion, categoria, imagen_ruta o imagen_principal).' });
    }

    // Verificar si la actividad existe
    const [existing] = await db.query('SELECT id_actividad FROM actividades WHERE id_actividad = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'La actividad no existe.' });
    }

    const lat = (latitud !== undefined && latitud !== null && latitud !== '') ? parseFloat(latitud) : null;
    const lon = (longitud !== undefined && longitud !== null && longitud !== '') ? parseFloat(longitud) : null;

    await db.query(
      `UPDATE actividades 
       SET nombre = ?, descripcion = ?, categoria = ?, imagen_ruta = ?, imagen_secundaria_ruta = ?, latitud = ?, longitud = ? 
       WHERE id_actividad = ?`,
      [nombre, descripcion, categoria, imagen_ruta, imagen_secundaria_ruta || null, lat, lon, id]
    );

    res.json({ message: 'Actividad actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({ error: 'Error al actualizar la actividad en la base de datos.' });
  }
});

// DELETE /api/actividades/:id - Eliminar una actividad (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la actividad existe
    const [existing] = await db.query('SELECT id_actividad FROM actividades WHERE id_actividad = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'La actividad no existe.' });
    }

    await db.query('DELETE FROM actividades WHERE id_actividad = ?', [id]);

    res.json({ message: 'Actividad eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ error: 'Error al eliminar la actividad de la base de datos.' });
  }
});

module.exports = router;
