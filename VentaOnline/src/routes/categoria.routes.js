// IMPORTACIONES
const express = require('express');
const categoriaController = require('../controllers/categoria.controller');
const md_autenticacion =  require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');


// RUTAS
var api = express.Router();
// CATEGORIAS
api.post('/agregarCategoria',[md_autenticacion.Auth,md_roles.verAdmin], categoriaController.AgregarCategoria);
api.post('/asignarCategoria',[md_autenticacion.Auth,md_roles.verAdmin], categoriaController.AsignarCategoria);
api.get('/categorias', md_autenticacion.Auth,categoriaController.ObtenerCategorias);
api.delete('/eliminarCategorias/:idCategoria', [md_autenticacion.Auth,md_roles.verAdmin],categoriaController.EliminarCategoria);
api.put('/editarCategoria/:idCategoria', [md_autenticacion.Auth,md_roles.verAdmin],categoriaController.EditarCategoria);
api.get('/asignacionCategorias',md_autenticacion.Auth, categoriaController.ObtenerAsignacionCategorias);
api.get('/categoriasNombre/:nombreCategoria',md_autenticacion.Auth, categoriaController.ObtenerCategoriaNombre);




module.exports = api;