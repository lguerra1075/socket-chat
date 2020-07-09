const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utils');

let usuarios = new Usuarios();
io.on('connection', (client) => {

    client.on('entrarChat', (usuario, callback) =>{

        if(!usuario.nombre ||  !usuario.sala){
            return callback({
                error: true,
                message:'El nombre/sala es necesario'
            });
        }

        client.join(usuario.sala);

        let personas = usuarios.agregarPersonas(client.id, usuario.nombre, usuario.sala);
        
        client.broadcast.to(usuario.sala).emit('listaPersonas', usuarios.getPersonasBySala(usuario.sala));
        
        callback(usuarios.getPersonasBySala(usuario.sala));
    });

    client.on('crearMensaje', (data) =>{

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje( persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });

    client.on('disconnect', () =>{

        let personaBorrada = usuarios.borrarPersona(client.id);
        
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salio del chat`));
        
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasBySala(personaBorrada.sala));
    })

    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit( 'mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    
    });

});