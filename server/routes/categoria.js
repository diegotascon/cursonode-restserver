const express = require('express');
const _ = require('underscore');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// 5 servicios

// Obtener todas las categorías, sin paginación
app.get('/categoria', verificaToken, (req, res) => {
    // Por ahora no pongo ningún parámetro
    Categoria.find()
        .sort('descripcion')
        // Revisa qué campos con ObjectID hay en el documento y, con él,
        // cargar información de otras colecciones. En este caso de la colección usuario
        // Como segundo argumento se pasa la lista de campos que se quieren incluir
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err // err: err
                });
            }

            // Igual que con los usuarios, cuento las categorías devueltas
            Categoria.count((err, cuantos) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos
                });
            });
        });
});

// Mostrar una categoría por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    // req.params.<variable definida en URL>
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: "No se encontró la categoría"
                }
            });
        } else {
            res.json({
                ok: true,
                categoria: categoriaBD
            });
        }
    });
});

// Crear nueva categoría
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    // .save es un método de mongoose
    categoria.save((err, categoriaDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err // err: err
            });
        } else {
            res.json({
                ok: true,
                categoria: categoriaDB
            });
        }
    });

});

// Actualizar una categoría (por ahora la descripcion)
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let categoriaActualizada = _.pick(req.body, [
        'descripcion'
    ]);

    // opciones para findByIdAndUpdate
    let opciones = {
        // devuelve el documento actualizado, no el que encuentra en BD
        new: true,
        // aplica las validaciones definidas en el modelo, como el enum dentro de role
        runValidators: true
    };

    // función de mongoose
    Categoria.findByIdAndUpdate(id, categoriaActualizada, opciones, (err, categoriaDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err // err: err
            });
        } else {
            res.json({
                ok: true,
                categoria: categoriaDB
            });
        }
    });

});

// Borrar físicamente una categoría: solo lo puede hacer el administrador
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!categoriaBorrada) {
            res.status(400).json({
                ok: false,
                err: {
                    message: "Categoría no encontrada"
                }
            });
        } else {
            res.json({
                ok: true,
                message: "Categoría borrada"
            });
        }

    });
});

module.exports = app;