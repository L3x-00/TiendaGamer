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

// --- FILTRO DE IP CONDICIONAL (La Magia Sucede Aquí) ---
app.use((req, res, next) => {
    // --- PASO 1: Verificar el entorno ---
    // Si NO estamos en producción (es decir, estamos en tu laptop), permitir todo el acceso.
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Modo Desarrollo. Filtro de IP desactivado. Acceso permitido desde: ${req.ip}`);
        return next(); // Permite el acceso y sale de la función.
    }

    // --- PASO 2: Si estamos en producción, aplicar el filtro ---
    // (Este código solo se ejecutará en Render)
    let clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    if (clientIP && clientIP.includes(',')) {
        clientIP = clientIP.split(',')[0].trim();
    }

    // <<<--- PON AQUÍ LAS IPs PERMITIDAS DE TU INSTITUTO ---<<<
    const allowedIPs = ['45.232.149.130', '45.232.149.146', '45.232.149.145']; 
    
    console.log(`[PROD] Modo Producción. Verificando IP: ${clientIP}`);
    
    if (allowedIPs.includes(clientIP)) {
        console.log(`[PROD] ACCESO PERMITIDO para la IP: ${clientIP}`);
        next(); // La IP es permitida, continuamos
    } else {
        console.log(`[PROD] ACCESO DENEGADO para la IP: ${clientIP}`);
        res.status(403).json({ message: 'Acceso denegado: IP no permitida' });
    }
});


// --- SERVIR ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'index')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- MONTAR LAS RUTAS DE LA API ---
app.use('/api', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/imagenes', imagenesRoutes);

// Documentación de Swagger
swaggerDocs(app);

// --- RUTA RAÍZ ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'index.html'));
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});