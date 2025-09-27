// index.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');

const app = express();
const PORT = process.env.PORT || 3000; // Render inyecta automáticamente el puerto

app.use(cors());
app.use(express.json());

// Rutas
app.use('/', authRoutes);           // /login
app.use('/usuarios', usuariosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);

app.get('/', (req, res) => res.json({ mensaje: 'API tienda_gamer funcionando' }));

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
