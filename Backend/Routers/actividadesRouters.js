const express = require('express');
const router = express.Router();
const actividadesController = require('../Controllers/ActividadesController');

// Cada dirección se conecta con la función que le toca
router.get('/', actividadesController.obtenerTodas);      // ver todas las actividades
router.post('/', actividadesController.crear);            // registrar una nueva
router.put('/:id', actividadesController.actualizar);     // editarla o cambiarle el estado
router.delete('/:id', actividadesController.eliminar);    // borrarla

module.exports = router;