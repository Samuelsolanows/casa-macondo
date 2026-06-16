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

// Middleware helper to verify Admin role
const verifyAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'No autorizado. Se requiere iniciar sesión.' });
  }
  try {
    const [users] = await db.query('SELECT id_role, id_rol FROM usuarios WHERE id_usuario = ?', [userId]);
    // Note: handle both potential database column names for safety, though from schema we saw id_rol.
    const user = users[0];
    if (!user || user.id_rol !== 1) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
  } catch (err) {
    console.error('Error al verificar admin:', err);
    res.status(500).json({ error: 'Error al verificar los permisos del usuario.' });
  }
};

// POST /api/alojamientos - Crear un nuevo alojamiento (Admin)
router.post('/', verifyAdmin, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { nombre, descripcion, precio_noche, capacidad, habitaciones, camas, servicios, mapa_embed_url, imagenes } = req.body;

    if (!nombre || !descripcion || !precio_noche || !capacidad || !habitaciones || !camas || !servicios) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para el alojamiento.' });
    }

    const [result] = await connection.query(
      `INSERT INTO alojamientos 
       (nombre, descripcion, precio_noche, capacidad, habitaciones, camas, servicios, mapa_embed_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, precio_noche, capacidad, habitaciones, camas, servicios, mapa_embed_url || '']
    );

    const newId = result.insertId;

    if (imagenes && Array.isArray(imagenes)) {
      for (const imgPath of imagenes) {
        if (imgPath && imgPath.trim() !== '') {
          await connection.query(
            'INSERT INTO alojamiento_imagenes (id_alojamiento, imagen_ruta) VALUES (?, ?)',
            [newId, imgPath.trim()]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({
      message: 'Alojamiento creado exitosamente.',
      id_alojamiento: newId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear alojamiento:', error);
    res.status(500).json({ error: 'Error al crear el alojamiento en la base de datos.' });
  } finally {
    connection.release();
  }
});

// PUT /api/alojamientos/:id - Editar un alojamiento existente (Admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { nombre, descripcion, precio_noche, capacidad, habitaciones, camas, servicios, mapa_embed_url, imagenes } = req.body;

    if (!nombre || !descripcion || !precio_noche || !capacidad || !habitaciones || !camas || !servicios) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para el alojamiento.' });
    }

    // Verificar si existe
    const [existing] = await connection.query('SELECT id_alojamiento FROM alojamientos WHERE id_alojamiento = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'El alojamiento no existe.' });
    }

    await connection.query(
      `UPDATE alojamientos 
       SET nombre = ?, descripcion = ?, precio_noche = ?, capacidad = ?, habitaciones = ?, camas = ?, servicios = ?, mapa_embed_url = ? 
       WHERE id_alojamiento = ?`,
      [nombre, descripcion, precio_noche, capacidad, habitaciones, camas, servicios, mapa_embed_url || '', id]
    );

    // Borrar imágenes viejas y registrar las nuevas
    await connection.query('DELETE FROM alojamiento_imagenes WHERE id_alojamiento = ?', [id]);

    if (imagenes && Array.isArray(imagenes)) {
      for (const imgPath of imagenes) {
        if (imgPath && imgPath.trim() !== '') {
          await connection.query(
            'INSERT INTO alojamiento_imagenes (id_alojamiento, imagen_ruta) VALUES (?, ?)',
            [id, imgPath.trim()]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Alojamiento actualizado exitosamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar alojamiento:', error);
    res.status(500).json({ error: 'Error al actualizar el alojamiento en la base de datos.' });
  } finally {
    connection.release();
  }
});

// DELETE /api/alojamientos/:id - Eliminar un alojamiento (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const [existing] = await db.query('SELECT id_alojamiento FROM alojamientos WHERE id_alojamiento = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'El alojamiento no existe.' });
    }

    // Nota: Las imágenes se borran en cascada gracias a ON DELETE CASCADE en la clave foránea
    await db.query('DELETE FROM alojamientos WHERE id_alojamiento = ?', [id]);

    res.json({ message: 'Alojamiento eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar alojamiento:', error);
    res.status(500).json({ error: 'Error al eliminar el alojamiento de la base de datos.' });
  }
});

module.exports = router;
