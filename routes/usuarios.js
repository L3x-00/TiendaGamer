// routes/usuarios.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /usuarios -> crea usuario (solo super)
router.post('/', requireRole('super'), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Faltan campos' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', [username, hashed, role]);
    res.json({ id: result.insertId, username, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Usuario ya existe' });
    res.status(500).json({ error: err.message });
  }
});

// GET /usuarios -> lista usuarios (solo super)
router.get('/', requireRole('super'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, role, creado_en FROM usuarios ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
