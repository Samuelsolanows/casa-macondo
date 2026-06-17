const express = require('express');
const router = express.Router();
const db = require('../db');

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

// GET /api/eventos - Listar eventos públicos (ordenados por fecha ascendente)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM eventos ORDER BY fecha ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener los eventos de la base de datos.' });
  }
});

// POST /api/eventos - Publicar nuevo evento (Admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, lugar, organizador, imagen_ruta } = req.body;

    if (!titulo || !descripcion || !fecha || !lugar || !organizador) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (titulo, descripcion, fecha, lugar, organizador).' });
    }

    const [result] = await db.query(
      'INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, organizador, imagen_ruta) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, fecha, hora || null, lugar, organizador, imagen_ruta || null]
    );

    res.status(201).json({
      message: 'Evento creado exitosamente.',
      id_evento: result.insertId,
      titulo,
      descripcion,
      fecha,
      hora,
      lugar,
      organizador,
      imagen_ruta
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear el evento en la base de datos.' });
  }
});

// PUT /api/eventos/:id - Editar evento existente (Admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, hora, lugar, organizador, imagen_ruta } = req.body;

    if (!titulo || !descripcion || !fecha || !lugar || !organizador) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (titulo, descripcion, fecha, lugar, organizador).' });
    }

    // Verificar si existe
    const [existing] = await db.query('SELECT id_evento FROM eventos WHERE id_evento = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El evento no existe.' });
    }

    await db.query(
      'UPDATE eventos SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, lugar = ?, organizador = ?, imagen_ruta = ? WHERE id_evento = ?',
      [titulo, descripcion, fecha, hora || null, lugar, organizador, imagen_ruta || null, id]
    );

    res.json({ message: 'Evento actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error al actualizar el evento en la base de datos.' });
  }
});

// DELETE /api/eventos/:id - Eliminar evento (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const [existing] = await db.query('SELECT id_evento FROM eventos WHERE id_evento = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El evento no existe.' });
    }

    await db.query('DELETE FROM eventos WHERE id_evento = ?', [id]);

    res.json({ message: 'Evento eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar el evento de la base de datos.' });
  }
});

module.exports = router;
