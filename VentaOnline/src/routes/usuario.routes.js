const express = require('express');
const usuarioControlador = require('../controllers/usuario.controller');
const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');


const api = express.Router();

api.post('/registrar',[md_autenticacion.Auth,md_roles.verAdmin], usuarioControlador.Registrar);
api.post('/registrarAdministrador', usuarioControlador.RegistrarAdministrador);
api.post('/login', usuarioControlador.Login);
api.put('/editarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.EditarUsuario);
api.put('/agregarProductoCarrito', md_autenticacion.Auth, usuarioControlador.agregarProductoCarrito);
api.put('/carritoAfactura', md_autenticacion.Auth, usuarioControlador.carritoAfactura);
//api.put('/editarRolUsuario/:idUsuario',[md_autenticacion.Auth,md_roles.verAdmin], usuarioControlador.editarRol);
api.delete('/eliminarUsuario/:idUsuario', md_autenticacion.Auth, usuarioControlador.EliminarUsuario);
api.get('/facturasUsuario/:idUsuario',[md_autenticacion.Auth,md_roles.verAdmin],usuarioControlador.ObtenerFacturasUsuario);
api.get('/productosFactura/:idFactura',[md_autenticacion.Auth,md_roles.verAdmin],usuarioControlador.ObtenerProductosFacturas);


module.exports = api;