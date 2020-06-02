const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importa el modelo de usuario
const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {
    let body = req.body;

    // Se verifica si viene un correo
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err // err: err
            });
        }

        // Si el usuario con el correo que viene en la llamada no existe en BD
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrectos"
                }
            });
        }

        // Se verifica si la contraseña proporcionada es correcta
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrectos"
                }
            });
        }

        // Si todo ha ido bien, se genera un token para el cliente
        let token = jwt.sign({ // payload
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        return res.json({
            ok: true,
            usuario: usuarioDB,
            token // token: token
        })

    });

});

module.exports = app;