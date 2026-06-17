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

// POST /api/visitas - Registrar una visita
router.post('/', async (req, res) => {
  try {
    const { ruta, id_usuario } = req.body;

    if (!ruta) {
      return res.status(400).json({ error: 'El campo ruta es obligatorio.' });
    }

    await db.query(
      'INSERT INTO visitas (ruta, id_usuario) VALUES (?, ?)',
      [ruta, id_usuario || null]
    );

    res.status(201).json({ message: 'Visita registrada con éxito.' });
  } catch (error) {
    console.error('Error al registrar visita:', error);
    res.status(500).json({ error: 'Error al registrar la visita en la base de datos.' });
  }
});

// GET /api/visitas/stats - Obtener métricas agregadas (Admin Only)
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    // 1. Total visitas
    const [totalVisitsRows] = await db.query('SELECT COUNT(*) as count FROM visitas');
    const totalVisits = totalVisitsRows[0].count;

    // 2. Total usuarios
    const [totalUsersRows] = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const totalUsers = totalUsersRows[0].count;

    // 3. Visitas por ruta/página
    const [visitsByPage] = await db.query(`
      SELECT ruta, COUNT(*) as count 
      FROM visitas 
      GROUP BY ruta 
      ORDER BY count DESC
    `);

    // 4. Visitas por día (últimos 15 días)
    const [visitsByDay] = await db.query(`
      SELECT DATE_FORMAT(fecha_hora, '%Y-%m-%d') as date, COUNT(*) as count 
      FROM visitas 
      GROUP BY DATE(fecha_hora) 
      ORDER BY date ASC
      LIMIT 15
    `);

    res.json({
      totalVisits,
      totalUsers,
      visitsByPage,
      visitsByDay
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de visitas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas del servidor.' });
  }
});

module.exports = router;
