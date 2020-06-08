const express = require('express');
const _ = require('underscore');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

app.get('/productos', verificaToken, (req, res) => {
    // trae todos los productos
    // populate: usuario y categoría
    // paginado
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;
    let soloActivos = { disponible: true };

    Producto.find(soloActivos)
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err // err: err
                });
            } else {
                Producto.count(soloActivos, (err, conteo) => {

                    res.json({
                        ok: true,
                        productosDB,
                        cuantos: conteo
                    });
                });
            }
        });
});

app.get('/productos/:id', verificaToken, (req, res) => {
    // trae un producto
    // populate: usuario y categoría
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err // err: err
                });
            } else if (!productoBD) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: "No se encontró el producto"
                    }
                });
            } else {
                res.json({
                    ok: true,
                    producto: productoBD
                });
            }
        });

});

// Buscar productos
app.get('/productos/buscar/:texto', verificaToken, (req, res) => {
    let texto = req.params.texto;

    let regex = new RegExp(texto, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err // err: err
                });
            } else if (productos.length === 0) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: "No se encontró ningún producto"
                    }
                });
            } else {
                res.json({
                    ok: true,
                    producto: productos
                });
            }
        });
});

// Crear un nuevo producto
app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoría del listado
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria, // Cómo se envía por URL? Con su ID?
        usuario: req.usuario._id
    });

    // .save es un método de mongoose
    producto.save((err, productoBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!productoBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        } else {
            res.json({
                ok: true,
                producto: productoBD
            });
        }
    });
});

app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let productoActualizado = _.pick(req.body, [
        'nombre',
        'precioUni',
        'descripcion',
        'disponible',
        'categoria'
    ]);

    // opciones para findByIdAndUpdate
    let opciones = {
        // devuelve el documento actualizado, no el que encuentra en BD
        new: true,
        // aplica las validaciones definidas en el modelo, como el enum dentro de role
        runValidators: true
    };

    // función de mongoose
    Producto.findByIdAndUpdate(id, productoActualizado, opciones, (err, productoBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!productoBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        } else {
            res.json({
                ok: true,
                producto: productoBD
            });
        }
    });

});

app.delete('/productos/:id', verificaToken, (req, res) => {
    // disponible: false. No borrar físicamente
    let id = req.params.id;

    // Solo quiero modificar el estado, y me da igual si ya estaba a false
    let body = { 'disponible': false };

    // opciones para findByIdAndUpdate
    let opciones = {
        // devuelve el documento actualizado, no el que encuentra en BD
        new: true
    };

    // función de mongoose
    Producto.findByIdAndUpdate(id, body, opciones, (err, productoBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err // err: err
            });
        } else if (!productoBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        } else {

            res.json({
                ok: true,
                producto: productoBD
            });
        }
    });

});


module.exports = app;