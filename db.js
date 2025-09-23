// Archivo: db.js (versión para PostgreSQL)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Exportamos el pool para poder hacer consultas
module.exports = {
  query: (text, params) => pool.query(text, params),
};