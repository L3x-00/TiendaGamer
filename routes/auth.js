// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SECRETA';

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username y password requeridos' });
  try {
    // CAMBIO: Usar $1 en lugar de ?
    const result = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  // --- RUTA TEMPORAL PARA CREAR EL ADMINISTRADOR ---
  // ¡MUY IMPORTANTE! Borrar esta ruta después de usarla.
  router.get('/create-admin-temporal', async (req, res) => {
    try {
      const db = require('../db');
      const bcrypt = require('bcryptjs');
      const username = 'admin';
      const plainPassword = 'admin123';
      const role = 'super';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Borra cualquier admin existente para evitar duplicados
      await db.query('DELETE FROM usuarios WHERE username = $1', [username]);
      
      // Crea el nuevo administrador
      const result = await db.query(
        'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, hashedPassword, role]
      );
      
      res.status(201).json({ 
        message: 'Usuario admin creado con éxito', 
        user: result.rows[0] 
      });
    } catch (err) {
      console.error('Error al crear admin:', err);
      res.status(500).json({ error: 'Error interno del servidor al crear admin' });
    }
  });
  // ---------------------------------------------------------

module.exports = router;