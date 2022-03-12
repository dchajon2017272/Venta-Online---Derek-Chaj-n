// IMPORTACIONES
const express = require('express');
const productoController = require('../controllers/producto.controller');
const md_autenticacion =  require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');


// RUTAS
var api = express.Router();
// PRODUCTOS
api.post('/agregarProductos',[md_autenticacion.Auth,md_roles.verAdmin], productoController.AgregarProducto);
api.get('/productos', md_autenticacion.Auth,productoController.ObtenerProductos);
api.get('/productos/:idProductos',md_autenticacion.Auth, productoController.ObtenerProductoId);
api.get('/buscarNombreProducto/:nombreProducto',md_autenticacion.Auth,productoController.ObtenerProductoNombre);
api.put('/editarProductos/:idProducto', [md_autenticacion.Auth,md_roles.verAdmin],productoController.EditarProducto);
api.delete('/eliminarProducto/:idProducto', [md_autenticacion.Auth,md_roles.verAdmin],productoController.EliminarProducto);
api.put('/stockProducto/:idProducto',[md_autenticacion.Auth,md_roles.verAdmin], productoController.stockProducto);
//api.post('/obtenerTokenProductos', productoController.TokenProductos);
api.get('/productosAgotados',productoController.ObtenerProductosAgotados);



module.exports = api;