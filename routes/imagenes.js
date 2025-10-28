// routes/imagenes.js
const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /imagenes/:producto_id (público)
router.get('/:producto_id', async (req, res) => {
  try {
    const { producto_id } = req.params;
    const result = await db.query('SELECT id, url FROM imagenes_productos WHERE producto_id = $1 ORDER BY id ASC', [producto_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /imagenes (admin|super) - Añadir una imagen a un producto
router.post('/', requireRole('admin','super'), async (req, res) => {
  const { url, producto_id } = req.body;
  if (!url || !producto_id) {
    return res.status(400).json({ error: 'URL y producto_id son requeridos' });
  }
  try {
    const result = await db.query('INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2) RETURNING *', [url, producto_id]);
    res.status(201).json({ message: 'Imagen añadida con éxito', image: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /imagenes/:id (admin|super) - Eliminar una imagen
router.delete('/:id', requireRole('admin','super'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM imagenes_productos WHERE id = $1', [id]);
    res.json({ message: 'Imagen eliminada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;