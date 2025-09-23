// Archivo: /routes/productos.js (Versión Completa y Corregida)

const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// ESTA ES LA LÍNEA QUE FALTABA
const router = express.Router();

// GET /productos (público) - Lee todos los productos con su imagen más reciente
router.get('/', async (req, res) => {
  try {
    const sqlQuery = `
      SELECT DISTINCT ON (p.id)
        p.id, p.nombre, p.descripcion, p.precio, p.stock, p.categoria_id, 
        c.nombre AS categoria,
        ip.url AS firstImageUrl
      FROM 
        productos p
      LEFT JOIN 
        categorias c ON p.categoria_id = c.id
      LEFT JOIN 
        imagenes_productos ip ON p.id = ip.producto_id
      ORDER BY 
        p.id DESC, ip.id DESC;
    `;
    const { rows } = await db.query(sqlQuery);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /productos (admin|super) - Crea un nuevo producto
router.post('/', requireRole('admin', 'super'), async (req, res) => {
  const { nombre, descripcion = null, precio = 0.0, stock = 0, categoria_id = null } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, descripcion, precio, stock, categoria_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id (admin|super) - Actualiza un producto existente
router.put('/:id', requireRole('admin', 'super'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria_id=$5 WHERE id=$6 RETURNING *',
      [nombre, descripcion, precio, stock, categoria_id, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id (admin|super) - Elimina un producto
router.delete('/:id', requireRole('admin', 'super'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;