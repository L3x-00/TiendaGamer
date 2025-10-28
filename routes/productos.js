// routes/productos.js
const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
// CAMBIO 1: Importar multer y path
const multer = require('multer');
const path = require('path');

const router = express.Router();

// CAMBIO 2: Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Asegúrate de que la carpeta 'uploads' exista en tu proyecto
    },
    filename: function (req, file, cb) {
        // Crear un nombre de archivo único para evitar sobreescrituras
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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

// CAMBIO 3: Modificar POST para usar multer y guardar la imagen
// POST /productos (admin|super) - Crea un nuevo producto
router.post('/', requireRole('admin','super'), upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [nombre, descripcion, precio, stock, categoria_id]
    );
    const newProduct = result.rows[0];

    // Si se subió una imagen, la guardamos en la tabla imagenes_productos
    if (req.file) {
      await db.query(
        'INSERT INTO imagenes_productos (producto_id, url) VALUES ($1, $2)',
        [newProduct.id, req.file.filename] // req.file.filename contiene el nombre del archivo guardado
      );
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CAMBIO 4: Modificar PUT para usar multer y guardar la nueva imagen
// PUT /productos/:id (admin|super) - Actualiza un producto existente
router.put('/:id', requireRole('admin','super'), upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria_id } = req.body;
  try {
    await db.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria_id=$5 WHERE id=$6', 
      [nombre, descripcion, precio, stock, categoria_id, id]
    );

    // Si se subió una imagen nueva, la guardamos
    if (req.file) {
      await db.query(
        'INSERT INTO imagenes_productos (producto_id, url) VALUES ($1, $2)',
        [id, req.file.filename]
      );
    }

    res.json({ id, nombre, descripcion, precio, stock, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id (admin|super) - Elimina un producto
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