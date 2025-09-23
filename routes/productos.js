// Archivo: /routes/productos.js

// GET /productos (público) - Lee todos los productos con su imagen principal
router.get('/', async (req, res) => {
  try {
    const sqlQuery = `
      SELECT DISTINCT ON (p.id)
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.categoria_id,
        c.nombre AS categoria,
        ip.url AS firstImageUrl
      FROM 
        productos p
      LEFT JOIN 
        categorias c ON p.categoria_id = c.id
      LEFT JOIN 
        imagenes_productos ip ON p.id = ip.producto_id
      ORDER BY 
        p.id DESC, ip.id DESC; -- <<-- ¡ESTE ES EL CAMBIO CLAVE! (de ASC a DESC)
    `;
    const { rows } = await db.query(sqlQuery);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});