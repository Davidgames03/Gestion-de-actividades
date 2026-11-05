const API_URL = '/api/actividades';

// Aquí se guardan las actividades que mandó el servidor
let listaActividades = [];

// Los elementos de la página que se usan varias veces
const form = document.getElementById('form-actividad');
const inputId = document.getElementById('actividad-id');
const inputNombre = document.getElementById('nombre');
const inputMateria = document.getElementById('materia');
const selectPrioridad = document.getElementById('prioridad');
const tabla = document.getElementById('tabla-actividades');
const mensajeError = document.getElementById('mensaje-error');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

// Al abrir la página se cargan las actividades y se conectan los botones
document.addEventListener('DOMContentLoaded', cargarActividades);
form.addEventListener('submit', guardarActividad);
btnCancelar.addEventListener('click', resetearFormulario);

// Muestra un aviso rojo y lo quita solo a los 3 segundos y medio
let temporizador = null;
function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.classList.remove('oculto');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => mensajeError.classList.add('oculto'), 3500);
}

// Le pide las actividades al servidor y las dibuja en la tabla
async function cargarActividades() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      mostrarError('No se pudieron cargar las actividades.');
      return;
    }
    listaActividades = await res.json();
    renderizarTabla(listaActividades);
  } catch (err) {
    mostrarError('No se pudo conectar con el servidor.');
  }
}

// Dibuja la tabla, una fila por cada actividad
function renderizarTabla(actividades) {
  tabla.replaceChildren();

  // si no hay ninguna, se avisa
  if (actividades.length === 0) {
    const trVacio = document.createElement('tr');
    const tdVacio = document.createElement('td');
    tdVacio.colSpan = 6;
    tdVacio.className = 'vacio';
    tdVacio.textContent = 'No hay actividades registradas.';
    trVacio.appendChild(tdVacio);
    tabla.appendChild(trVacio);
    return;
  }

  actividades.forEach((act) => {
    const tr = document.createElement('tr');

    // Celda del ID
    const tdId = document.createElement('td');
    tdId.textContent = act.id;
    tr.appendChild(tdId);

    // Celda del nombre
    const tdNombre = document.createElement('td');
    tdNombre.textContent = act.nombre;
    tr.appendChild(tdNombre);

    // Celda de la materia
    const tdMateria = document.createElement('td');
    tdMateria.textContent = act.materia;
    tr.appendChild(tdMateria);

    // Celda de la prioridad
    const tdPrioridad = document.createElement('td');
    const strongPrioridad = document.createElement('strong');
    strongPrioridad.textContent = act.prioridad;
    tdPrioridad.appendChild(strongPrioridad);
    tr.appendChild(tdPrioridad);

    // Lista para cambiar el estado ahí mismo
    const tdEstado = document.createElement('td');
    const selectEstado = document.createElement('select');

    const opciones = ['Pendiente', 'En proceso', 'Completada'];
    opciones.forEach((opcion) => {
      const opt = document.createElement('option');
      opt.value = opcion;
      opt.textContent = opcion;
      if (act.estado === opcion) {
        opt.selected = true;
      }
      selectEstado.appendChild(opt);
    });

    selectEstado.addEventListener('change', () => {
      cambiarEstado(act.id, act.nombre, act.materia, act.prioridad, selectEstado.value);
    });

    tdEstado.appendChild(selectEstado);
    tr.appendChild(tdEstado);

    // Botones de editar y eliminar
    const tdAcciones = document.createElement('td');

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => {
      prepararEdicion(act.id, act.nombre, act.materia, act.prioridad);
    });

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.classList.add('btn-eliminar');
    btnEliminar.addEventListener('click', () => {
      eliminarActividad(act.id);
    });

    tdAcciones.appendChild(btnEditar);
    tdAcciones.appendChild(btnEliminar);
    tr.appendChild(tdAcciones);

    tabla.appendChild(tr);
  });
}

// Se usa al darle a "Agregar" o "Actualizar": si hay un id es que se está editando, si no es nueva
async function guardarActividad(e) {
  e.preventDefault();

  const id = inputId.value;
  const nombre = inputNombre.value.trim();
  const materia = inputMateria.value.trim();
  const prioridad = selectPrioridad.value;

  // Si falta algún campo se avisa y no se manda nada
  if (!nombre || !materia || !prioridad) {
    mostrarError('Por favor, completa todos los campos.');
    return;
  }

  const payload = { nombre, materia, prioridad };

  try {
    let res;
    if (id) {
      // al editar se conserva el estado que ya tenía
      const actividadActual = listaActividades.find(act => act.id == id);
      const estadoActual = actividadActual ? actividadActual.estado : 'Pendiente';

      res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, estado: estadoActual })
      });
    } else {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const dataErr = await res.json();
      mostrarError(dataErr.mensaje || 'Error al guardar la actividad.');
      return;
    }

    resetearFormulario();
    cargarActividades();
  } catch (err) {
    mostrarError('No se pudo conectar con el servidor.');
  }
}

// Cambia solo el estado desde la lista de la tabla
async function cambiarEstado(id, nombre, materia, prioridad, nuevoEstado) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, materia, prioridad, estado: nuevoEstado })
    });

    if (!res.ok) {
      const dataErr = await res.json();
      mostrarError(dataErr.mensaje || 'Error al cambiar el estado.');
    }
    cargarActividades();
  } catch (err) {
    mostrarError('No se pudo conectar con el servidor.');
  }
}

// Borra una actividad (primero pregunta si está seguro)
async function eliminarActividad(id) {
  if (!confirm('¿Deseas eliminar esta actividad?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const dataErr = await res.json();
      mostrarError(dataErr.mensaje || 'No se pudo eliminar la actividad.');
    }

    // si justo se estaba editando esa actividad, se limpia el formulario
    if (inputId.value == id) {
      resetearFormulario();
    }
    cargarActividades();
  } catch (err) {
    mostrarError('No se pudo conectar con el servidor.');
  }
}

// Pasa los datos de la fila al formulario para poder cambiarlos
function prepararEdicion(id, nombre, materia, prioridad) {
  inputId.value = id;
  inputNombre.value = nombre;
  inputMateria.value = materia;
  selectPrioridad.value = prioridad;
  btnGuardar.textContent = 'Actualizar Actividad';
  btnCancelar.classList.remove('oculto');
  inputNombre.focus();
}

// Deja el formulario como al inicio, listo para una actividad nueva
function resetearFormulario() {
  inputId.value = '';
  form.reset();
  btnGuardar.textContent = 'Agregar Actividad';
  btnCancelar.classList.add('oculto');
}