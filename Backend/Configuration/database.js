const mysql = require('mysql2');
require('dotenv').config();

// Datos para conectarse a la base de datos (están en el archivo .env)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Revisa que la base de datos sí responda al encender el servidor
db.getConnection((err, conexion) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('Conexión exitosa a MySQL');
  conexion.release();
});

module.exports = db;