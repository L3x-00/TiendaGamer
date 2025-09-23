// Archivo: /routes/auth.js (Versión Corregida para PostgreSQL)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Ahora usa la conexión de pg

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SECRETA';

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username y password requeridos' });
  }

  try {
    // SINTAXIS CORREGIDA: Se usa $1 y se desestructura { rows }
    const { rows } = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    res.json({ token, role: user.role });

  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;