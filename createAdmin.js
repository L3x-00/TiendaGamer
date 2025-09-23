// Archivo: CreateAdmin.js (Versión Corregida para PostgreSQL)
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la conexión. Usará la misma URL que tu API.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // <-- ¡Importante!
  ssl: {
    rejectUnauthorized: false
  }
});

const createAdmin = async () => {
  const client = await pool.connect();
  try {
    const username = 'admin';
    const plainPassword = 'admin123';
    const role = 'super';

    // 1. Encriptar la contraseña (igual que lo haría tu API)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('✅ Contraseña encriptada correctamente.');

    // 2. Borrar cualquier usuario 'admin' existente para empezar de cero
    await client.query('DELETE FROM usuarios WHERE username = $1', [username]);
    console.log(`- Usuario 'admin' anterior eliminado (si existía).`);

    // 3. Insertar el nuevo usuario 'admin' con la contraseña GARANTIZADA
    await client.query(
      'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );

    console.log('----------------------------------------------------');
    console.log('✅ ¡ÉXITO! Usuario administrador creado/reparado.');
    console.log(`   Usuario: ${username}`);
    console.log(`   Contraseña: ${plainPassword}`);
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('❌ ERROR al ejecutar el script:', err);
  } finally {
    await client.end();
    await pool.end();
  }
};

createAdmin();
