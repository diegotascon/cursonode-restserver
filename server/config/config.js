// Puerto: o el que defina el servidor o el 8080 en desarrollo
process.env.PORT = process.env.PORT || 8080;

// Entorno de ejecución: Heroku o desarrollo 'dev'
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Vendimiento del token: 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// Semilla de autenticación
process.env.SEED = process.env.SEED || "este-es-el-seed-de-desarrollo";

// URL base de la aplicación: por ahora no es necesario
process.env.URI = process.env.URI || "localhost:8080";

// URL de conexión a Atlas
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://mongo:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

// Se usa una propiedad de process.env para que server.js acceda a la URL
process.env.URLDB = urlDB;

// Google client ID
process.env.CLIENT_ID = process.env.CLIENT_ID || "119472458003-16c4dunn7019jefeo0lcqjnvbuk7ddsj.apps.googleusercontent.com";