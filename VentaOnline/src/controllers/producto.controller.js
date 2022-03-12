// IMPORTACIONES
const Productos = require('../models/productos.model');
const bcrypt = require('bcrypt-nodejs');

// AGREGAR PRODUCTOS
function AgregarProducto (req, res){
    // var { nombre, cantidad, precio } = req.body;
    var parametros = req.body;
    var productoModelo = new Productos();

    if( parametros.nombre && parametros.cantidad && parametros.precio ) {
        productoModelo.nombre = parametros.nombre;
        productoModelo.cantidad = parametros.cantidad;
        productoModelo.precio = parametros.precio;
        productoModelo.vendido = 0;

        productoModelo.save((err, productoGuardado) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoGuardado) return res.status(404).send( { mensaje: "Error, no se agrego ningun producto"});

            return res.status(200).send({ producto: productoGuardado });
        })
    }
}


// Obtener datos Productos de Mongo
function ObtenerProductos (req, res) {
    Productos.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        for (let i = 0; i < productosObtenidos.length; i++) {
            console.log(productosObtenidos[i].nombre)
        }

        return res.send({ productos: productosObtenidos })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */ 
    })
}

// OBTENER PRODUCTO POR ID
function ObtenerProductoId(req, res) {
    var idProd = req.params.idProductos;

    Productos.findById(idProd, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ producto: productoEncontrado });
    })
}

// OBTENER PRODUCTO POR NOMBRE
function ObtenerProductoNombre(req, res) {
    var nomProd = req.params.nombreProducto;

    Productos.find( { nombre : { $regex: nomProd, $options: 'i' } }, (err, productoEncontrado) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!productoEncontrado) return res.status(404).send({ mensaje: "Error, no se encontraron productos" });

        return res.status(200).send({ producto: productoEncontrado });
    })
}


// EDITAR PRODUCTO
function EditarProducto (req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    Productos.findByIdAndUpdate(idProd, parametros, { new: true } ,(err, productoActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!productoActualizado) return res.status(404).send( { mensaje: 'Error al Editar el Producto'});

        return res.status(200).send({ producto: productoActualizado});
    });
}

// ELIMINAR PRODUCTO
function EliminarProducto(req, res) {
    var idProd = req.params.idProducto;

    Productos.findByIdAndDelete(idProd, (err, productoEliminado) => {
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!productoEliminado) return res.status(404).send( { mensaje: 'Error al eliminar el Producto'});

        return res.status(200).send({ producto: productoEliminado});
    })
}

// INCREMENTAR/RESTAR LA CANTIDAD DEL PRODUCTO

function stockProducto(req, res) {
    const productoId = req.params.idProducto;
    const parametros = req.body;

    Productos.findById(productoId, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
        if(!productoEncontrado) return res.status(404).send({ mensaje: 'Error al obtener el Producto'});
        if (parametros.cantidad*-1 > productoEncontrado.cantidad) {
            return res.status(500).send({ mensaja: "Productos insuficientes en el stock para realizar esta compra."})
        } else {

    Productos.findOneAndUpdate(productoId, { $inc : { cantidad: parametros.cantidad } }, { new: true },
    (err, productoModificado) => {
       
            
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoModificado) return res.status(500).send({ mensaje: 'Error al editar la cantidad del Producto'});

            return res.status(200).send({ producto: productoModificado});
            
    })
}
})
    
}









// Parametro en ruta obligatorio
function EjemploParametroRuta (req, res) {
    var id = req.params.idKinal;

    res.send("Hola Mundo, el id obtenido es: " + id);
}

// Paramentro en ruta opcional
function EjemploParametroRutaOpcional (req, res) {
    var idOp = req.params.idOpcional;

    if(idOp) {
        res.send("Hola Mundo, el id Opcional obtenido es: " + idOp);
    } else {
        res.send("El correo del Usuario es: " + req.user.email)
    }    
}

/*function TokenProductos(req, res) {
    var parametros = req.body;
    Productos.findOne({ nombre : parametros.nombre }, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(productoEncontrado){
           
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwtProductos.crearToken(productoEncontrado) })
                        } else {
                            return  res.status(200)
                                .send({ usuario: productoEncontrado })
                        }

                  

        }else{
            return res.status(500)
                .send({ mensaje: 'Error, este producto no se encuentra registrado.'})
        }
    })
}*/

function ObtenerProductosAgotados (req, res) {
        
        Productos.find( { cantidad : 0}, (err, productoEncontrado) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoEncontrado) return res.status(404).send({ mensaje: "Error, no se encontraron productos" });
                
            return res.status(200).send({ productosAgotados: productoEncontrado });
        })
        
 
}

module.exports = {
    ObtenerProductos,
    EjemploParametroRuta,
    EjemploParametroRutaOpcional,
    ObtenerProductoId,
    ObtenerProductoNombre,
    AgregarProducto,
    EditarProducto,
    EliminarProducto,
    stockProducto,
    ObtenerProductosAgotados
}