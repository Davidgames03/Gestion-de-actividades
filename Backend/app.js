// Este archivo es el que enciende el servidor
const express = require('express');
const path = require('path');
require('dotenv').config();

const actividadesRouters = require('./Routers/actividadesRouters');

const app = express();

// Para poder leer los datos que manda el navegador en formato JSON
app.use(express.json());

// Muestra los archivos de la carpeta Frontend (html, css y js)
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use('/api/actividades', actividadesRouters);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/Actividades.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});