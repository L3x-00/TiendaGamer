// CreateAdmin.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'tienda_gamer'
    });

    const username = 'admin';
    const plainPassword = 'admin123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    // Borra y crea para garantizar estado
    await conn.execute('DELETE FROM usuarios WHERE username = ?', [username]);
    await conn.execute('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', [username, hashed, 'super']);

    console.log(`✅ Super creado: ${username} / ${plainPassword}`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error CreateAdmin:', err.message);
    process.exit(1);
  }
})();
