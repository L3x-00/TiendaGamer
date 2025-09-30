// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');

const app = express();
const PORT = process.env.PORT || 3000; // Render inyecta automáticamente el puerto

app.use(cors());
app.use(express.json());

// ======================================================
// 1. Servir frontend desde carpeta "index"
// ======================================================
app.use(express.static(path.join(__dirname, 'index')));

// ======================================================
// 2. Rutas de la API
//    (Te recomiendo ponerlas bajo prefijo /api para no
//    mezclarlas con el frontend)
// ======================================================
app.use('/api', authRoutes);           // /api/login
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/imagenes', imagenesRoutes);

// ======================================================
// 3. Ruta raíz -> abrir index.html
// ======================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'index.html'));
});

// ======================================================
// 4. Arrancar servidor
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

