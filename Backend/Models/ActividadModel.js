const db = require('../Configuration/database');

// El modelo es el único que habla con la base de datos
const ActividadModel = {
  // Trae todas las actividades, las más nuevas primero
  obtenerTodas: (callback) => {
    const sql = 'SELECT * FROM actividades ORDER BY id DESC';
    db.query(sql, callback);
  },

  // Guarda una actividad nueva, siempre empieza como Pendiente
  crear: (datos, callback) => {
    const { nombre, materia, prioridad } = datos;
    const sql = 'INSERT INTO actividades (nombre, materia, estado, prioridad) VALUES (?, ?, "Pendiente", ?)';
    db.query(sql, [nombre, materia, prioridad], callback);
  },

  // Cambia los datos de una actividad que ya existe
  actualizar: (id, datos, callback) => {
    const { nombre, materia, estado, prioridad } = datos;
    const sql = 'UPDATE actividades SET nombre = ?, materia = ?, estado = ?, prioridad = ? WHERE id = ?';
    db.query(sql, [nombre, materia, estado, prioridad, id], callback);
  },

  // Borra una actividad
  eliminar: (id, callback) => {
    const sql = 'DELETE FROM actividades WHERE id = ?';
    db.query(sql, [id], callback);
  }
};

module.exports = ActividadModel;