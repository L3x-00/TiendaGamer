// TiendaGamer/index.js

// --- IMPORTACIONES ---
const express = require('express');
const cors = require('cors');
// <-- CAMBIO 1: Corregir la importación del módulo 'path'
const path = require('path'); // Necesario para manejar rutas de archivos

// Importamos las rutas desde la carpeta 'routes'
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');

// Importamos la configuración de Swagger y la BD
const swaggerDocs = require('./swagger');
// const db = require('./db'); // No se necesita aquí directamente, pero las rutas sí lo usan.

// --- CONFIGURACIÓN DEL SERVIDOR ---
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- SERVIR ARCHIVOS ESTÁTICOS ---
// Le decimos a Express que sirva los archivos estáticos desde la carpeta 'index' (el frontend)
app.use(express.static(path.join(__dirname, 'index')));

// <-- CAMBIO 2: Añadir la ruta para servir las imágenes subidas
// Le decimos a Express que cualquier petición a /uploads sea atendida por la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- MONTAR LAS RUTAS DE LA API ---
// Todas las rutas que empiecen con /api serán manejadas por nuestros archivos de rutas
app.use('/api', authRoutes);           // Maneja /api/login
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes); // Maneja /api/categorias
app.use('/api/productos', productosRoutes);   // Maneja /api/productos
app.use('/api/imagenes', imagenesRoutes);

// Documentación de Swagger
swaggerDocs(app);

// --- RUTA RAÍZ ---
// Si alguien visita la página principal, le servimos el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'index.html'));
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});