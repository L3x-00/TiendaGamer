// TiendaGamer/index.js

// --- IMPORTACIONES ---
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos las rutas desde la carpeta 'routes'
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');

// Importamos la configuración de Swagger y la BD
const swaggerDocs = require('./swagger');

// --- CONFIGURACIÓN DEL SERVIDOR ---
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- NUEVO FILTRO DE IP (Lógica de tu amigo) ---
// Este middleware debe ir ANTES de servir cualquier contenido estático o rutas.
app.use((req, res, next) => {
    let clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    if (clientIP && clientIP.includes(',')) {
        clientIP = clientIP.split(',')[0].trim();
    }

    // <<<--- CAMBIO IMPORTANTE: Pon aquí las IPs permitidas de tu instituto ---<<<
    const allowedIPs = ['45.232.149.130', '45.232.149.146', '45.232.149.145']; 
    
    // Permitir en entorno local para facilitar el desarrollo
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    if (allowedIPs.includes(clientIP)) {
        next(); // La IP es permitida, continuamos
    } else {
        // La IP no es permitida, bloqueamos el acceso
        console.log(`ACCESO DENEGADO desde la IP: ${clientIP}`);
        res.status(403).json({ message: 'Acceso denegado: IP no permitida' });
    }
});


// --- SERVIR ARCHIVOS ESTÁTICOS (DESPUÉS del filtro) ---
// Le decimos a Express que sirva los archivos estáticos desde la carpeta 'index'
app.use(express.static(path.join(__dirname, 'index')));

// Añade la ruta para servir las imágenes subidas
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
// <<<--- CAMBIO: Añadir "0.0.0.0" para que Render funcione correctamente ---<<<
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});