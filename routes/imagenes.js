// Archivo: /routes/imagenes.js (Versión Corregida para PostgreSQL)

const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /imagenes/:producto_id (público)
router.get('/:producto_id', async (req, res) => {
  const { producto_id } = req.params;
  try {
    // SINTAXIS CORREGIDA: Se usa $1 y se desestructura { rows }
    const { rows } = await db.query('SELECT id, url, producto_id FROM imagenes_productos WHERE producto_id = $1', [producto_id]);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener imagenes:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /imagenes (admin|super)
router.post('/', requireRole('admin', 'super'), async (req, res) => {
  const { url, producto_id } = req.body;
  try {
    // SINTAXIS CORREGIDA: Se usan $1, $2 y RETURNING *
    const { rows } = await db.query('INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2) RETURNING *', [url, producto_id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear imagen:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /imagenes/:id (admin|super)
router.delete('/:id', requireRole('admin', 'super'), async (req, res) => {
  const { id } = req.params;
  try {
    // SINTAXIS CORREGIDA: Se usa $1
    await db.query('DELETE FROM imagenes_productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Imagen eliminada' });
  } catch (err) {
    console.error("Error al eliminar imagen:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;