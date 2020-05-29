// Puerto: o el que defina el servidor o el 8080 en desarrollo
process.env.PORT = process.env.PORT || 8080;

// Entorno de ejecución: Heroku o desarrollo 'dev'
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// URL de conexión a Atlas
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://mongo:27017/cafe';
} else {
    urlDB = 'mongodb+srv://cafe-user:cafepassword@udemy-nodejs-cj64f.mongodb.net/cafe?retryWrites=true&w=majority';
}

// Se usa una propiedad de process.env para que server.js acceda a la URL
process.env.URLDB = urlDB;