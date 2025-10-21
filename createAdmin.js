// CreateAdmin.js
const db = require('./db'); // Usamos el mismo archivo de conexión
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const username = 'admin';
    const plainPassword = 'admin123';
    const role = 'super';

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('Intentando crear el superusuario...');

    // Borra cualquier usuario existente con ese nombre para evitar duplicados
    await db.query('DELETE FROM usuarios WHERE username = $1', [username]);

    // Inserta el nuevo superusuario
    const result = await db.query(
      'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );

    console.log('✅ Superusuario creado con éxito:');
    console.log(`   - Username: ${result.rows[0].username}`);
    console.log(`   - Password: ${plainPassword}`);
    console.log(`   - Role: ${result.rows[0].role}`);
    
    process.exit(0); // Termina el script con éxito
  } catch (err) {
    console.error('❌ Error al crear el superusuario:', err.message);
    process.exit(1); // Termina el script con error
  }
})();