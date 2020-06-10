const express = require('express');
const fs = require('fs');
const path = require('path');

let { verificaToken, verificaTokenImg } = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    // Validar el tipo de imagen que se pide
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

    // Construye el path a la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    // Primero se verifica que el path sea correcto
    if (fs.existsSync(pathImagen)) {
        // Si existe el pathImagen, se devuelve toda la imagen
        res.sendFile(pathImagen);
    } else {
        // Si la imagen que se pide no existe, se devuelve no-image.jpg
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }
});


module.exports = app;