exports.verAdmin = function(req, res, next){
    if(req.user.rol !== "Administrador") return res.status(403).send({mensaje: "Solo puede hacerlo el Administrador"})

    next();
}

exports.verCliente = function(req, res, next){
    if(req.user.rol !== "Cliente") return res.status(403).send({mensaje: "Solo puede hacerlo el Cliente"})

    next();
}