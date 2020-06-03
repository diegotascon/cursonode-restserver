// Leo los parámetros
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// Paquete para tratar los paths de la aplicación.
// Necesario para acceder a los ficheros en public
const path = require('path');
const app = express();

// parse application/x-www-form-urlencoded
// .use para instalar un middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// habilitar la carpeta de public
app.use(express.static(path.resolve(__dirname, "../public")));

// app.use(require('./routes/usuario'));
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB,
    // Para evitar warnings 
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos ONLINE');
    });

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});