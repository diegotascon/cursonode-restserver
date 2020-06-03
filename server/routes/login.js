const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Verificación del token de Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub']; // No se necesita por ahora
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    // Se devuelve un objeto con las propiedades que Google envía
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.img,
        google: true
    }
};
//verify().catch(console.error);

// Usada por la autenticación de Google via AJAX
app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    // Se verifica el token recibido
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    // Se verifica que el usuario que se ha autenticado está en BD
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si existe el usuario en BD
        if (usuarioDB) {
            // Si no está registrado como usuario de Google pero ha entrado con Google
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Debe usar su autenticación normal"
                    }
                });
            } else {
                // Genera el token de aplicación
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            // Si el usuario no existe en BD se añade ¿?
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // Porque la contraseña es obligatoria

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });

    // A la llamada AJAX para obtener el token simplemente devolvemos el propio token
    // res.json({
    //     googleUser
    // })
});



module.exports = app;