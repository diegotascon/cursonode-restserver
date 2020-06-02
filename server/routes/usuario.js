const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

// Importa el modelo de usuario
const Usuario = require('../models/usuario');

// Importa los middlewares de autenticación
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// Responde a GET
app.get('/usuario', verificaToken, (req, res) => {
    // Obtengo el parámetro opcional desde. Si no está definido, supongo 0
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;
    let soloActivos = { estado: true };

    // Usuario.find(soloActivos, 'nombre email') para devolver solo nombre y email
    Usuario.find(soloActivos)
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err // err: err
                });
            }

            Usuario.count(soloActivos, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios, // usuarios: usuarios
                    cuantos: conteo
                });
            });

        });
});

// Responde a POST: creación de nuevos registros
// Recomienda enviar la información en formato x-www-form-urlencoded
app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {
    // Al estar instalado el middleware de body-parser, éste ya entra en acción
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
            // img: body.img
    });

    // .save es un método de mongoose
    usuario.save((err, usuarioDB) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err // err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });

});

// Responde a PUT: actualización de registros
// :id es el parámetro que se envía en la URL:
//   http://localhost:8080/usuario/<nombre usuario>
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // req.params.<variable definida en URL>
    let id = req.params.id;
    // let body = req.body;
    // Se indican los campos que se quieren trasladar con underscore
    let body = _.pick(req.body, [
        'nombre',
        'email',
        'img',
        'role',
        'estado'
    ]);

    // opciones para findByIdAndUpdate
    let opciones = {
        // devuelve el documento actualizado, no el que encuentra en BD
        new: true,
        // aplica las validaciones definidas en el modelo, como el enum dentro de role
        runValidators: true
    };

    // función de mongoose
    Usuario.findByIdAndUpdate(id, body, opciones, (err, usuarioDB) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err // err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

// Responde a DELETE: borrado de usuarios
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    // Solo quiero modificar el estado, y me da igual si ya estaba a false
    let body = { 'estado': false };

    // opciones para findByIdAndUpdate
    let opciones = {
        // devuelve el documento actualizado, no el que encuentra en BD
        new: true
    };

    // función de mongoose
    Usuario.findByIdAndUpdate(id, body, opciones, (err, usuarioDB) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err // err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //    if (err) {
    //        res.status(400).json({
    //            ok: false,
    //            err // err: err
    //        });
    //    }

    //    // Si no encuentra el usuario indicado
    //    if (!usuarioBorrado) {
    //        res.status(400).json({
    //            ok: false,
    //            err: {
    //                message: 'Usuario no encontrado'
    //            }
    //        });
    //    }

    //    res.json({
    //        ok: true,
    //        usuario: usuarioBorrado
    //    });
    //});
});

module.exports = app;