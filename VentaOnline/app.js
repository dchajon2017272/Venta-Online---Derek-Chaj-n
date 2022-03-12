// IMPORTACIONES
const express = require('express');
const cors = require('cors');
var app = express();

// IMPORTACIONES RUTAS
const ProductoRutas = require('./src/routes/producto.routes');
const UsuarioRutas = require('./src/routes/usuario.routes');
const CategoriaRutas =require('./src/routes/categoria.routes');


// MIDDLEWARES -> INTERMEDIARIOS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CABECERAS
app.use(cors());

// CARGA DE RUTAS localhost:3000/api/obtenerProductos
app.use('/api', ProductoRutas, UsuarioRutas, CategoriaRutas);


module.exports = app;