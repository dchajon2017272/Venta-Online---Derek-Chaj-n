const Categoria = require('../models/categoria.model');
const AsignacionCategoria = require('../models/asignacionCategoria.model');
const Producto = require('../models/productos.model');

const res = require('express/lib/response');

function AgregarCategoria(req, res) {
    const parametros = req.body;
    const categoriaModelo = new Categoria();

    if (parametros.nombreCategoria) {
        categoriaModelo.nombreCategoria = parametros.nombreCategoria;

        categoriaModelo.save((err, categoriaGuardada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!categoriaGuardada) return res.status(400).send({ mensaje: "Error, no se agrego ninguna Categoria" });

            return res.status(200).send({ producto: categoriaGuardada });
        })
    } else {
        return res.status(400).send({ mensaje: "Debe enviar los parametros obligatorios" });
    }
}

function AsignarCategoria(req, res) {
    const asignacionCategoriaModel = new AsignacionCategoria();
    const parametros = req.body;

    AsignacionCategoria.find({idProducto: parametros.idProducto}).populate('idCategoria')
    .exec((err,asignacionesEncontradas)=>{
        if(asignacionesEncontradas.length>=1) return res.status(400)
        .send({mensaje:'No se puede asignar un producto a más de 1 categoria.'})

        for(let i=0;i<asignacionesEncontradas.length; i++){
            if(asignacionesEncontradas[i].idCategoria === parametros.idCategoria)
            return res.status(400).send({mensaje:'No puede asignar un producto a la misma categoria 2 veces.'})
        }

        Categoria.findOne({idCategoria: parametros.idCategoria},(err,categoriaEncontrada)=>{
            if(err) return res.status(400).send({mensaje: 'Error en la petición.'});
            if(!categoriaEncontrada) return res.status(400).send({mensaje: 'Esta categoria no existe.'});

    if (parametros.idCategoria && parametros.idProducto) {
        asignacionCategoriaModel.idCategoria = parametros.idCategoria;
        asignacionCategoriaModel.idProducto = parametros.idProducto;

        asignacionCategoriaModel.save((err, asignacionCategoriaGuardada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!asignacionCategoriaGuardada) return res.status(400).send({ mensaje: "Error, no se agrego ninguna Categoria" });

            return res.status(200).send({ producto: asignacionCategoriaGuardada });
        })
    } else {
        return res.status(400).send({ mensaje: "Debe enviar los parametros obligatorios" });
    }
})
    })
}

function ObtenerCategorias(req, res) {
    Categoria.find((err, categoriasObtenidas) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        for (let i = 0; i < categoriasObtenidas.length; i++) {
            console.log(categoriasObtenidas[i].nombreCategoria)
        }

        return res.send({ categorias: categoriasObtenidas })
        /* Esto retornara
            {
                productos: ["array con todos los productos"]
            }
        */
    })
}

function ObtenerAsignacionCategorias(req, res) {
    AsignacionCategoria.find((err, categoriasObtenidas) => {
        if (err) return res.send({ mensaje: "Error: " + err })

        for (let i = 0; i < categoriasObtenidas.length; i++) {
            console.log(categoriasObtenidas[i].idCategoria,categoriasObtenidas[i].idProducto)
        }

        return res.send({ categorias: categoriasObtenidas })
        
    }).populate('idCategoria idProducto', 'nombreCategoria nombre')
    //.populate('idProducto', 'nombre');

    /*AsignacionCategoria.find( (err, categoriasObtenidas) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!categoriasObtenidas) return res.status(500).send({ mensaje: "Error al obtener las Categorias."});

        return res.status(200).send({ encuestas: categoriasObtenidas });
    }).populate('idCategoria', 'nombreCategoria')
        .populate('idProducto', 'nombre');*/
}

function ObtenerCategoriaNombre(req, res) {
    var nomCat = req.params.nombreCategoria;
    
    Categoria.findOne({ nombreCategoria:nomCat}, (err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "error en la peticion" })
        if (!categoriaEncontrada) return res.status(500).send({ mensaje: "no se encontro ninguna categoria parecida a esta" })

        AsignacionCategoria.find({ idCategoria: categoriaEncontrada._id }, (err, asignacionesEncontradas) => {

            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!asignacionesEncontradas.length) return res.status(500).send({ mensaje: "No hay productos en la Categoría" })

            return res.status(200).send({ categorias: asignacionesEncontradas })
        }).populate('idCategoria idProducto', 'nombreCategoria nombre')
    })
}

function EliminarCategoria(req, res){
    const categoriaId = req.params.idCategoria;

    /* Categoria.findOne({_id: categoriaId},(err,cursoMaestro)=>{
         if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
         if(!asignacionCategoriaGuardada) return res.status(400).send( { mensaje: "Error, no se agrego ninguna Categoria"});
     })*/

    Categoria.findOne({ nombreCategoria: 'Por Defecto' }, (err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!categoriaEncontrada) {
            const categoriaModelo = Categoria();
            categoriaModelo.nombreCategoria = 'Por Defecto';

            categoriaModelo.save((err, categoriaGuardada) => {
                if (err) return res.status(400).send({ mensaje: "Error en la peticion de Agregar Categoria" });
                if (!categoriaGuardada) return res.status(500).send({ mensaje: "Error, no se agrego ninguna Categoria" });

                AsignacionCategoria.updateMany({ idCategoria: categoriaId }, { idCategoria: categoriaGuardada._id },
                    (err, asignacionesActualizadas) => {
                        if (err) return res.status(400).send({ mensaje: "Error en la peticion de actualizar actualizaciones" });
                        Categoria.findByIdAndDelete(categoriaId, (err, categoriaEliminada) => {
                            if (err) return res.status(400).send({ mensaje: "Error en la peticion" });
                            if (!categoriaEliminada) return res.status(500).send({ mensaje: "Error al eliminar la categoria" });


                            return res.status(200).send({
                                editado:asignacionesActualizadas,
                                eliminado: categoriaEliminada
                            })
                        })
                    })
            })
        } else {
            AsignacionCategoria.updateMany({idCategoria: categoriaId},{idCategoria:categoriaEncontrada._id},
                (err,asignacionesActualizadas)=>{
                    if(err) return res.status(400).send({mensaje: 'Error en la petición al actualizar las asignaciones'})
                    Categoria.findByIdAndDelete(categoriaId,(err,categoriaEliminada)=>{
                        if(err) return res.status(400).send({mensaje: 'Error en la petición al actualizar las asignaciones'})
                        return res.status(200).send({
                            editado: asignacionesActualizadas,
                            eliminado: categoriaEliminada
                         })
                    })
                })
        }
    })
}

function EditarCategoria (req, res) {
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    Categoria.findByIdAndUpdate(idCat, parametros, { new: true } ,(err, categoriaActualizada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if(!categoriaActualizada) return res.status(404).send( { mensaje: 'Error al Editar la Categoria'});

        return res.status(200).send({ producto: categoriaActualizada});
    });
}

/*function AsignarCategoria (req,res){
    const parametros = req.body;
    //const producto = 

    if(parametros.nombreCategoria){

        asignacionCategoriaModel.find({idProducto: parametros.idProducto}).populate('idCategoria')
        .exec((err,asignacionesEncontradas)=>{
            if(asignacionesEncontradas.length>=1) return res.status(400)
            .send({mensaje:'No se puede asignar un producto a más de 1 categoria.'})

            for(let i=0;i<asignacionesEncontradas.length; i++){
                if(asignacionesEncontradas[i].idCategoria.nombreCategoria === parametros.nombreCategoria)
                return res.status(400).send({mensaje:'No puede asignar un producto a la misma categoria 2 veces.'})
            }

            Categoria.findOne({nombreCategoria: parametros.nombreCategoria},(err,categoriaEncontrada)=>{
                if(err) return res.status(400).send({mensaje: 'error en la petición.'});
                if(!categoriaEncontrada) return res.status(400).send({mensaje: 'Esta categoria no existe.'});


                const asignacionCategoriaModel = new AsignacionCategoria();
                asignacionCategoriaModel.idCategoria = categoriaEncontrada._id;
                asignacionCategoriaModel.idProducto = parametros.idProducto;

                asignacionCategoriaModel.save((err,asignacionCategoriaGuardada)=>{
                    if(err) return res.status(400).send({mensaje: 'error en la petición.'});
                    if(!categoriaEncontrada) return res.status(400).send({mensaje: 'No se pudo guardar la asignacion.'});

                    return res.status(200).send({asignacion: asignacionCategoriaGuardada})

                })
                
            })




        })

    }
}
*/

module.exports = {
    AgregarCategoria,
    AsignarCategoria,
    ObtenerCategorias,
    EliminarCategoria,
    EditarCategoria,
    ObtenerAsignacionCategorias,
    ObtenerCategoriaNombre
}