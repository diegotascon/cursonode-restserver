// Fichero de modelo de categoría para Mongoose
const mongoose = require('mongoose');
// mongoose-unique-validator impedía cambiar la descripción
// const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, "La descripción es obligatoria"]
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }
});

/*
// método para obtener una categoría recuperada de BD en formato JSON
categoriaSchema.methods.toJSON = function() {
    // Como se necesita usar "this", no se puede utlizar el formato de flecha
    let categoria = this;
    let categoriaObject = categoria.toObject();

    return categoriaObject;
}

// Transforma el error de categoría duplicada de BD al mensaje que se define aquí
categoriaSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único'
});
*/

// El documento categoriaSchema se exporta como 'Categoria'
module.exports = mongoose.model('Categoria', categoriaSchema);