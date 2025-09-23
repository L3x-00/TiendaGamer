// Archivo: /routes/productos.js

const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /productos (público) - Lee todos los productos con su imagen principal
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id, p.nombre, p.descripcion, p.precio, p.stock, p.categoria_id, 
        c.nombre AS categoria,
        (SELECT url FROM imagenes_productos ip WHERE ip.producto_id = p.id ORDER BY ip.id LIMIT 1) AS firstImageUrl
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /productos (admin|super) - Crea un nuevo producto
router.post('/', requireRole('admin','super'), async (req, res) => {
  const { nombre, descripcion = null, precio = 0.0, stock = 0, categoria_id = null } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES (?, ?, ?, ?, ?)', 
      [nombre, descripcion, precio, stock, categoria_id]
    );
    res.status(201).json({ id: result.insertId, nombre, descripcion, precio, stock, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id (admin|super) - Actualiza un producto existente
router.put('/:id', requireRole('admin','super'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;
  try {
    await db.query(
      'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, categoria_id=? WHERE id=?', 
      [nombre, descripcion, precio, stock, categoria_id, id]
    );
    res.json({ id, nombre, descripcion, precio, stock, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id (admin|super) - Elimina un producto
router.delete('/:id', requireRole('admin','super'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;