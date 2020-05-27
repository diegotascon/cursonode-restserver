// Leo los parámetros
require('./config/config');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
// .use para instalar un middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Responde a GET
app.get('/usuario', (req, res) => {
    res.json('get Usuario');
});

// Responde a POST: creación de nuevos registros
// Recomienda enviar la información en formato x-www-form-urlencoded
app.post('/usuario', (req, res) => {
    // Al estar instalado el middleware de body-parser, éste ya entra en acción
    let body = req.body;

    if (body.nombre === undefined) {
        // Devuelve un 400 - Bad Request
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({
            persona: body
        });
    }
});

// Responde a PUT: actualización de registros
// :id es el parámetro que se envía en la URL:
//   http://localhost:8080/usuario/<nombre usuario>
app.put('/usuario/:id', (req, res) => {
    // req.params.<variable definida en URL>
    let id = req.params.id;
    res.json({
        id // equivale a id: id
    });
});

// Responde a PUT: actualización de registros
app.delete('/usuario', (req, res) => {
    res.json('delete Usuario');
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});