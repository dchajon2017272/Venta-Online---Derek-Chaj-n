const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var asignacionCategoriaSchema = Schema({
    idCategoria: {type: Schema.Types.ObjectId,ref:'Categorias'},
    idProducto: {type: Schema.Types.ObjectId,ref:'Productos'}
    
});

module.exports = mongoose.model('AsignacionCategorias', asignacionCategoriaSchema)