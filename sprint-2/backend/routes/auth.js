const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// POST /api/register - Registrar un nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Por favor, completa los campos obligatorios (nombre, correo, contraseña).' });
    }

    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Verificar si el correo ya está registrado
    const [existingUsers] = await db.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Rol por defecto: 2 (Usuario)
    const defaultRol = 2;

    // Insertar en la base de datos
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, telefono, id_rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hashedPassword, telefono || null, defaultRol]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
  }
});

// POST /api/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Por favor, ingresa tu correo y contraseña.' });
    }

    // Buscar al usuario por correo
    const [users] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas (el correo no está registrado).' });
    }

    const user = users[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta).' });
    }

    // Retornar éxito y datos de usuario (sin la contraseña)
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        id_rol: user.id_rol
      }
    });

  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
});

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado. Se requiere iniciar sesión.' });
    }

    const { nombre, correo, telefono, contrasena, nuevaContrasena } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ error: 'El nombre y el correo son obligatorios.' });
    }

    // Buscar al usuario actual
    const [users] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const user = users[0];

    // Verificar que el correo no esté ocupado por otro usuario
    const [existingUsers] = await db.query(
      'SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?',
      [correo, userId]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso por otro usuario.' });
    }

    let hashedPassword = user.contrasena;

    // Si quiere cambiar contraseña
    if (nuevaContrasena && nuevaContrasena.trim() !== '') {
      if (!contrasena) {
        return res.status(400).json({ error: 'Debes ingresar tu contraseña actual para cambiarla.' });
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!isMatch) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
      }

      if (nuevaContrasena.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }

      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(nuevaContrasena, salt);
    }

    // Actualizar en la base de datos
    await db.query(
      'UPDATE usuarios SET nombre = ?, correo = ?, telefono = ?, contrasena = ? WHERE id_usuario = ?',
      [nombre, correo, telefono || null, hashedPassword, userId]
    );

    res.status(200).json({
      message: 'Perfil actualizado exitosamente.',
      user: {
        id_usuario: parseInt(userId),
        nombre,
        correo,
        telefono: telefono || null,
        id_rol: user.id_rol
      }
    });

  } catch (error) {
    console.error('Error en PUT /profile:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
  }
});

module.exports = router;
