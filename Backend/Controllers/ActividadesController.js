const ActividadModel = require('../Models/ActividadModel');

// Lo que se permite en estado y prioridad
const ESTADOS = ['Pendiente', 'En proceso', 'Completada'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];

// Quita los espacios de los lados (si no es texto, lo deja vacío)
function limpiar(texto) {
  return typeof texto === 'string' ? texto.trim() : '';
}

// Revisa los datos. Si algo está mal regresa el mensaje, si todo está bien regresa 
// El estado solo se revisa cuando se manda (al crear no se manda porque siempre es Pendiente)
function revisarDatos(nombre, materia, prioridad, estado) {
  if (!nombre || !materia || !prioridad) {
    return 'Todos los campos son obligatorios.';
  }
  if (nombre.length > 150) {
    return 'El nombre no puede tener más de 150 caracteres.';
  }
  if (materia.length > 100) {
    return 'La materia no puede tener más de 100 caracteres.';
  }
  if (!PRIORIDADES.includes(prioridad)) {
    return 'Prioridad no válida.';
  }
  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return 'Estado no válido.';
  }
  return '';
}

// Manda todas las actividades
exports.obtenerTodas = (req, res) => {
  ActividadModel.obtenerTodas((err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener las actividades.' });
    res.json(resultados);
  });
};

// Registra una actividad nueva
exports.crear = (req, res) => {
  const datos = req.body || {};
  const nombre = limpiar(datos.nombre);
  const materia = limpiar(datos.materia);
  const prioridad = limpiar(datos.prioridad);

  const error = revisarDatos(nombre, materia, prioridad);
  if (error) {
    return res.status(400).json({ mensaje: error });
  }

  ActividadModel.crear({ nombre, materia, prioridad }, (err, resultado) => {
    if (err) return res.status(500).json({ mensaje: 'Error al crear la actividad.' });
    res.status(201).json({ mensaje: 'Actividad creada con éxito.', id: resultado.insertId });
  });
};

// Edita los datos de una actividad o le cambia el estado
exports.actualizar = (req, res) => {
  const { id } = req.params;
  const datos = req.body || {};
  const nombre = limpiar(datos.nombre);
  const materia = limpiar(datos.materia);
  const prioridad = limpiar(datos.prioridad);
  const estado = datos.estado;

  // Aquí el estado sí es obligatorio
  if (!estado) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  const error = revisarDatos(nombre, materia, prioridad, estado);
  if (error) {
    return res.status(400).json({ mensaje: error });
  }

  ActividadModel.actualizar(id, { nombre, materia, estado, prioridad }, (err, resultado) => {
    if (err) return res.status(500).json({ mensaje: 'Error al actualizar la actividad.' });
    // si no se modificó ninguna fila es que ese id no existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'La actividad no existe.' });
    }
    res.json({ mensaje: 'Actividad actualizada correctamente.' });
  });
};

// Borra una actividad
exports.eliminar = (req, res) => {
  const { id } = req.params;

  ActividadModel.eliminar(id, (err, resultado) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar la actividad.' });
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'La actividad no existe.' });
    }
    res.json({ mensaje: 'Actividad eliminada correctamente.' });
  });
};