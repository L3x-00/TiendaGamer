// routes/productos.js
const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /productos (público)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id, p.nombre, p.descripcion, p.precio, p.stock, p.categoria_id, 
        c.nombre AS categoria,
        (SELECT url FROM imagenes_productos ip WHERE ip.producto_id = p.id ORDER BY ip.id LIMIT 1) AS firstimageurl
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NUEVA RUTA AÑADIDA ---
// GET /productos/:id (público) - Devuelve un solo producto por su ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// -----------------------------

// POST /productos (admin|super)
router.post('/', requireRole('admin','super'), async (req, res) => {
  const { nombre, descripcion = null, precio = 0.0, stock = 0, categoria_id = null } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [nombre, descripcion, precio, stock, categoria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id (admin|super)
router.put('/:id', requireRole('admin','super'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;
  try {
    await db.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria_id=$5 WHERE id=$6', 
      [nombre, descripcion, precio, stock, categoria_id, id]
    );
    res.json({ id, nombre, descripcion, precio, stock, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id (admin|super)
router.delete('/:id', requireRole('admin','super'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;