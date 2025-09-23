// Archivo: /routes/categorias.js (Versión Corregida para PostgreSQL)

const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /categorias (público)
router.get('/', async (req, res) => {
  try {
    // SINTAXIS CORREGIDA: Se desestructura { rows } de la respuesta de pg
    const { rows } = await db.query('SELECT * FROM categorias ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener categorias:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /categorias (admin|super)
router.post('/', requireRole('admin', 'super'), async (req, res) => {
  const { nombre } = req.body;
  try {
    // SINTAXIS CORREGIDA: Se usa $1 para el parámetro y RETURNING * para devolver el objeto creado
    const { rows } = await db.query('INSERT INTO categorias (nombre) VALUES ($1) RETURNING *', [nombre]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear categoria:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /categorias/:id (admin|super)
router.put('/:id', requireRole('admin', 'super'), async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    // SINTAXIS CORREGIDA: Se usan $1, $2
    const { rows } = await db.query('UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al actualizar categoria:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /categorias/:id (admin|super)
router.delete('/:id', requireRole('admin', 'super'), async (req, res) => {
  const { id } = req.params;
  try {
    // SINTAXIS CORREGIDA: Se usa $1
    await db.query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    console.error("Error al eliminar categoria:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;