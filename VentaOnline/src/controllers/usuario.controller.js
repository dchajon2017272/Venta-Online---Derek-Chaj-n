const Usuario = require('../models/usuario.model');
const Producto = require('../models/productos.model');
const Factura = require('../models/factura.model')
const PDF = require('pdfkit');
const fs = require('fs');  

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

function Registrar(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuario();

    if(parametros.nombre && parametros.apellido && 
        parametros.email && parametros.password ) {
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.apellido = parametros.apellido;
            usuarioModel.email = parametros.email;
            usuarioModel.rol = "Cliente";
            usuarioModel.totalCarrito = 0;

            Usuario.find({ email : parametros.email }, (err, usuarioEncontrado) => {
                if ( usuarioEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
                }
            })
    }
}

function RegistrarAdministrador(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuario();

            usuarioModel.nombre = 'ADMIN';
            usuarioModel.email = 'admin@gmail.com';
            usuarioModel.rol = 'Administrador';

            Usuario.find({ nombre : 'ADMIN' }, (err, usuarioEncontrado) => {
                if ( usuarioEncontrado.length == 0 ) {

                    bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este nombre de usuario, ya se encuentra utilizado' });
                }
            })
    
}

function Login(req, res) {
    var parametros = req.body;
    Usuario.findOne({ nombre : parametros.nombre }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            // COMPARO CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    // VERIFICO SI EL PASSWORD COINCIDE EN BASE DE DATOS
                    if ( verificacionPassword ) {
                        // SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }

                        
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contrasena no coincide'});
                    }
                })

        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado.'})
        }
    })
}

function agregarProductoCarrito(req, res) {
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

    Producto.findOne({ nombre: parametros.nombre }, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
        if(!productoEncontrado) return res.status(404).send({ mensaje: 'Error al obtener el Producto'});
        if (parametros.cantidad > productoEncontrado.cantidad) {
            return res.status(500).send({ mensaja: "Productos insuficientes en el stock para realizar esta compra."})
        } else {
        
         
        Usuario.findOneAndUpdate(usuarioLogeado,  { carrito: { nombreProducto: parametros.nombre,
            cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio,
            subTotalCarrito: 0
            } } , { new: true}, 
            (err, usuarioActualizado)=>{
                if(err) return res.status(500).send({ mensaje: "Error en la peticion de Usuario"});
                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});


                let subTotalCarritoLocal = 0 ;


                for(let i = 0; i < usuarioActualizado.carrito.length; i++){
                subTotalCarritoLocal = usuarioActualizado.carrito[i].cantidadComprada * usuarioActualizado.carrito[i].precioUnitario;        
                }

                //parametros.subTotalCarrito= subTotalCarritoLocal;

                Usuario.findByIdAndUpdate(usuarioLogeado,{$push: {  carrito: { nombreProducto: parametros.nombre,
                    cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio,
                    subTotalCarrito: subTotalCarritoLocal
                    } } }, { new: true}, 
                    (err, usuarioActualizado)=>{
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Usuario"});
                        if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});
                            

                    
                let totalCarritoLocal = 0;



                for(let i = 0; i < usuarioActualizado.carrito.length; i++){
                     totalCarritoLocal = totalCarritoLocal +  usuarioActualizado.carrito[i].subTotalCarrito;
                    //totalCarritoLocal += usuarioActualizado.carrito[i].precioUnitario;
                }

              
                Usuario.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal  }, {new: true},
                        (err, totalActualizado)=> {
                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                            if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
    
                            return res.status(200).send({ usuario: totalActualizado })
                })
        
             })     
            })   
        }
    })
}

/*function editarRol(req, res) {
    const usuarioId = req.params.idUsuario;
    const rolUsuario = req.params.rol;
    const parametros = req.body;

    Usuario.findByIdAndUpdate(usuarioId, { rol: parametros.rol } , { new: true },
    (err, usuarioModificado) => {
        if(req.user.rol == "Administrador") return res.status(400)
        .send({mensaje:'No se puede modificar al Administrador'})

            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!usuarioModificado) return res.status(500).send({ mensaje: 'Error al editar el rol del Usuario'});

            return res.status(200).send({ usuario: usuarioModificado}); 
    }) 
    
}*/

function carritoAfactura(req, res){
    const parametros = req.body;
    const facturaModel = new Factura();
    const productoId = req.params.idProducto;

     Usuario.findById(req.user.sub, (err, usuarioEncontrado)=>{
        
        if( parametros.nit) {
        facturaModel.nit = parametros.nit;
        facturaModel.listaProductos = usuarioEncontrado.carrito;
        facturaModel.idUsuario = req.user.sub;
        facturaModel.totalFactura = usuarioEncontrado.totalCarrito;
    
        facturaModel.save((err, facturaGuardada) => {
                if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if(!facturaGuardada) return res.status(404).send( { mensaje: "Error, no se agrego ningun producto"});
    
               
                return res.status(200).send({ producto: facturaGuardada });

                
            })
        }

            

        for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
            Producto.findOneAndUpdate(productoId ,{nombre: usuarioEncontrado.carrito[i].nombreProducto} , 
                {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada *-1,
                   vendido: usuarioEncontrado.carrito[i].cantidadComprada }})
        }
    
    }) 

    Usuario.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, 
        (err, carritoVacio)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if(!carritoVacio) return res.status(404).send( { mensaje: "Error, no se agrego ningun producto"});
    
    })

}


function EditarUsuario(req, res) {
    var idUser = req.params.idUsuario
    var parametros = req.body;

    if (req.user.rol == "Cliente") {
        if (idUser !== req.user.sub) {
            return res.status(500).send({ mensaje: "No puede editar a otros Usuarios." })
        } else {
            if (parametros.rol) {
                return res.status(500).send({ mensaje: "Un cliente no puede modificar su rol." })
            } else {
                Usuario.findByIdAndUpdate(req.user.sub, parametros, { new: true }, (err, usuarioActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar el Usuario' })
                    return res.status(200).send({ usuario: usuarioActualizado })
                })
            }
        }

    } else {

        Usuario.findById(idUser, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "No se encontro el Usuario" })

            if (usuarioEncontrado.rol !== "Administrador") {
                Usuario.findByIdAndUpdate(idUser, parametros, { new: true }, (err, usuarioModificado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!usuarioModificado) return res.status(500).send({ mensaje: "Error al Actualizar el Usuario" })

                    return res.status(200).send({ usuario: usuarioModificado })
                })
            } else {
                if(idUser == req.user.sub){
                    if (parametros.rol) {
                        return res.status(500).send({ mensaje: "No puede modificar su rol" })
                    } else {
                        Usuario.findByIdAndUpdate(req.user.sub, parametros, { new: true }, (err, usuarioActualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            if (!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar el usuario' })
                            return res.status(200).send({ usuario: usuarioActualizado })
                        })
                    }

                }else{
                    return res.status(500).send({ mensaje: "No se puede editar un usuario Administrador"})
                }
            }
        })

    } 
}



function EliminarUsuario(req, res) {
    var idUser = req.params.idUsuario

    if (req.user.rol !== "Administrador") {
        if (idUser != req.user.sub) {
            return res.status(500).send({ mensaje: "No puede Eliminar a otros Usuarios." })
        } else {
           
                Usuario.findByIdAndDelete(req.user.sub, { new: true }, (err, usuarioActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al eliminar el Usuario' })
                    return res.status(200).send({ usuario: usuarioActualizado })
                })
            
        }

    } else {

        Usuario.findById(idUser, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "No se encontro el Usuario" })

            if (usuarioEncontrado.rol !== "Administrador") {
                Usuario.findByIdAndDelete(idUser, { new: true }, (err, usuarioModificado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!usuarioModificado) return res.status(500).send({ mensaje: "Error al Eliminar el Usuario" })

                    return res.status(200).send({ usuario: usuarioModificado })
                })
            } else {
                
                    return res.status(500).send({ mensaje: "No se puede eliminar a un usuario Administrador"})
                
            }
        })

    } 
}

function ObtenerFacturasUsuario(req, res) {
    const usuarioId = req.params.idUsuario;

    Factura.find({idUsuario:usuarioId}, (err, facturaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!facturaEncontrada) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        
        const doc = new PDF();

        doc.pipe(fs.createWriteStream('salida.pdf'));

        doc.text(facturaEncontrada);
        
        doc.end();

        return res.status(200).send({ facturas: facturaEncontrada });
    })
}

function ObtenerProductosFacturas(req, res) {
     var idFac = req.params.idFactura;
 
     Factura.findById(idFac, (err, facturaEncontrada) => {
         if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
         if (!facturaEncontrada) return res.status(404).send( { mensaje: 'Error al obtener los datos' });


    
        
         return res.status(200).send({ productos: facturaEncontrada.listaProductos });
     })
 }


module.exports = {
    Registrar,
    Login,
    EditarUsuario,
    agregarProductoCarrito,
    carritoAfactura,
    RegistrarAdministrador,
    EliminarUsuario,
    ObtenerFacturasUsuario,
    ObtenerProductosFacturas
}