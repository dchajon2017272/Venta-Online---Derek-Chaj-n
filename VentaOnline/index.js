const mongoose = require('mongoose');
const app = require('./app');
const Usuario = require('./src/models/usuario.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('./src/services/jwt');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ProyectoVentaOnline', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {

    app.listen(3000, function () {
        console.log("Se encuentra conectado a la base de datos.");
        console.log("La base de datos esta corriendo en el puerto 3000!");
        Usuario.find({ nombre: 'ADMIN' }, (err, usuarioEcontrado) => {
            if (usuarioEcontrado == 0) {

                bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                    Usuario.create({
                        nombre: 'ADMIN',
                        email: 'admin@gmail.com',
                        rol: 'Administrador',
                        password: passwordEncriptada
                        
                    })

                });
            } else {

            }

        })
    })


}).catch(error => console.log(error))