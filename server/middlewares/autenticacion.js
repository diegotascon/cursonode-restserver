const jwt = require('jsonwebtoken');

// Verificar token
let verificaToken = (req, res, next) => {
    // Se lee el contenido de la cabecera con nombre "token"
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no válido"
                }
            });
        }

        // Si el token es válido, se devuelve todo el usuario (payload)
        req.usuario = decoded.usuario;

        // Llama al contenido de la llamada (al contenido del app.get, app.post, ...)
        next();
    });

};

// Verifica que el rol del usuario es administrador
let verificaAdmin_Role = (req, res, next) => {
    // req.usuario viene del middleware anterior, que debe especificarse siempre
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.json({
            ok: false,
            err: {
                message: "El usuario no es administrador"
            }
        });
    } else {
        next();
    }
};

// Verificación del token pasado por URL por páginas HTML
let verificaTokenImg = (req, res, next) => {
    // parámetro ?token= de la URL
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no válido"
                }
            });
        }

        // Si el token es válido, se devuelve todo el usuario (payload)
        req.usuario = decoded.usuario;

        // Llama al contenido de la llamada (al contenido del app.get, app.post, ...)
        next();
    });
};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}