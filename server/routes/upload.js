// Copiado parcialmente de
// https://github.com/richardgirges/express-fileupload/tree/master/example#basic-file-upload
const express = require('express');
const fileUpload = require('express-fileupload');

// Paquetes necesarios para borrar archivos, no para guardarlos
const fs = require('fs');
const path = require('path');

// Aplicación de express
const app = express();

// Se importan los modelos de Usuario y Producto para poder grabar la imagen subida
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');


// default options: todo fichero que se cargue es accesible en req.files
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "No se ha seleccionado ningún archivo"
            }
        });
    }

    // "archivo" es el nombre de la clave usada en la llamada REST
    // En Postman debe incluirse como una clave "form-data" dentro
    // del body (no como x-www-form-urlencoded)
    let archivo = req.files.archivo;

    // Validar el tipo de imagen que se sube
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "Los tipos válidos son " + tiposValidos.join(),
                tipoRecibido: tipo
            }
        });
    }

    // Validar que el fichero tiene una de las extensiones permitidas
    let extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: "Las extensiones permitidas son " + extensionesValidas,
                extensionRecibida: extension
            }
        });
    }

    // Cambiar nombre al archivo para que sea único, que no se machaquen
    // dos subidas con el mismo nombre de archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        // Aquí se dispone ya de la imagen cargada en el sistema de archivos
        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
        }

        /* res.json({
            ok: true,
            message: "Imagen subida correctamente"
        }); */
    });
});

// Actualiza la imagen del usuario indicado por id
function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        } else if (!usuarioDB) {
            res.status(500).json({
                ok: false,
                err: {
                    message: "El usuario no existe"
                }
            });
        } else {
            usuarioDB.img = nombreArchivo;
            usuarioDB.save((err, usuarioGuardado) => {
                // No ha verificado el error
                res.json({
                    ok: true,
                    usuario: usuarioGuardado,
                    img: nombreArchivo
                })
            });
        }

        // Pase lo que pase, se borra la imagen recibida
        borraArchivo(nombreArchivo, 'usuarios');
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        } else if (!productoBD) {
            res.status(500).json({
                ok: false,
                err: {
                    message: "El producto no existe"
                }
            });
        } else {
            productoBD.img = nombreArchivo;
            productoBD.save((err, productoGuardado) => {
                // No ha verificado el error
                res.json({
                    ok: true,
                    producto: productoGuardado,
                    img: nombreArchivo
                })
            });
        }

        // Pase lo que pase, se borra la imagen recibida
        borraArchivo(nombreArchivo, 'productos');
    });
}

function borraArchivo(nombreImagen, tipo) {
    // Construye el path a la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // Primero se verifica que el path sea correcto
    if (fs.existsSync(pathImagen)) {
        // Si existe el pathImagen
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;