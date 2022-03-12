const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    rol: String,
    carrito: [{
        nombreProducto: String,
        cantidadComprada: Number,
        precioUnitario: Number,
        subTotalCarrito: Number
    }],
    
    totalCarrito: Number
});

module.exports = mongoose.model('Usuarios', UsuarioSchema);