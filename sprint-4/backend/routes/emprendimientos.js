const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify logged in user
const verifySession = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado. Se requiere iniciar sesión.' });
  }
  next();
};

// GET /api/emprendimientos - Obtener todos los emprendimientos (Público)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM emprendimientos ORDER BY id_emprendimiento ASC';
    let params = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query = `
        SELECT * FROM emprendimientos 
        WHERE nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?
        ORDER BY id_emprendimiento ASC
      `;
      params = [searchTerm, searchTerm, searchTerm];
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener emprendimientos:', error);
    res.status(500).json({ error: 'Error al obtener los emprendimientos de la base de datos.' });
  }
});

// GET /api/emprendimientos/mis-negocios - Obtener emprendimientos del usuario actual
router.get('/mis-negocios', verifySession, async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const [rows] = await db.query(
      'SELECT * FROM emprendimientos WHERE id_usuario = ? ORDER BY id_emprendimiento ASC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mis emprendimientos:', error);
    res.status(500).json({ error: 'Error al obtener tus emprendimientos.' });
  }
});

// POST /api/emprendimientos - Registrar nuevo emprendimiento (Cualquier usuario autenticado)
router.post('/', verifySession, async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { nombre, descripcion, categoria, contacto, imagen_ruta } = req.body;

    if (!nombre || !descripcion || !categoria || !contacto || !imagen_ruta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, descripcion, categoria, contacto, imagen_ruta).' });
    }

    const [result] = await db.query(
      'INSERT INTO emprendimientos (nombre, descripcion, categoria, contacto, imagen_ruta, id_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, categoria, contacto, imagen_ruta, userId]
    );

    res.status(201).json({
      message: 'Emprendimiento registrado exitosamente.',
      id_emprendimiento: result.insertId,
      nombre,
      descripcion,
      categoria,
      contacto,
      imagen_ruta,
      id_usuario: userId
    });
  } catch (error) {
    console.error('Error al registrar emprendimiento:', error);
    res.status(500).json({ error: 'Error al registrar el emprendimiento en la base de datos.' });
  }
});

// PUT /api/emprendimientos/:id - Editar emprendimiento (Propietario o Admin)
router.put('/:id', verifySession, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const { nombre, descripcion, categoria, contacto, imagen_ruta } = req.body;

    if (!nombre || !descripcion || !categoria || !contacto || !imagen_ruta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, descripcion, categoria, contacto, imagen_ruta).' });
    }

    // Verificar si existe y verificar propiedad o admin
    const [existing] = await db.query('SELECT * FROM emprendimientos WHERE id_emprendimiento = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El emprendimiento no existe.' });
    }

    // Obtener rol del usuario actual
    const [users] = await db.query('SELECT id_rol FROM usuarios WHERE id_usuario = ?', [userId]);
    const isAdmin = users.length > 0 && users[0].id_rol === 1;

    if (existing[0].id_usuario != userId && !isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres el propietario de este emprendimiento.' });
    }

    await db.query(
      'UPDATE emprendimientos SET nombre = ?, descripcion = ?, categoria = ?, contacto = ?, imagen_ruta = ? WHERE id_emprendimiento = ?',
      [nombre, descripcion, categoria, contacto, imagen_ruta, id]
    );

    res.json({ message: 'Emprendimiento actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar emprendimiento:', error);
    res.status(500).json({ error: 'Error al actualizar el emprendimiento en la base de datos.' });
  }
});

// DELETE /api/emprendimientos/:id - Eliminar emprendimiento (Propietario o Admin)
router.delete('/:id', verifySession, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    // Verificar si existe
    const [existing] = await db.query('SELECT * FROM emprendimientos WHERE id_emprendimiento = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El emprendimiento no existe.' });
    }

    // Obtener rol del usuario actual
    const [users] = await db.query('SELECT id_rol FROM usuarios WHERE id_usuario = ?', [userId]);
    const isAdmin = users.length > 0 && users[0].id_rol === 1;

    if (existing[0].id_usuario != userId && !isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres el propietario de este emprendimiento.' });
    }

    await db.query('DELETE FROM emprendimientos WHERE id_emprendimiento = ?', [id]);

    res.json({ message: 'Emprendimiento eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar emprendimiento:', error);
    res.status(500).json({ error: 'Error al eliminar el emprendimiento de la base de datos.' });
  }
});

module.exports = router;
