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

module.exports = router;
