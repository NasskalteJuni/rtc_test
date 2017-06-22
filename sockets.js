/**
 * Created by NasskalteJuni on 18.06.2017.
 */
let active = [];
const addActive = (user, socket) => active.push({name: user, id: socket.id});
const findActive = (user) => active.reduce((connected, acc) => acc = connected.name === user ? connected : acc , {name: null, id: null});
const removeActive = (user) => active.filter(con => user !== con.user);


// socket stuff
module.exports = function sockets(io, room) {
    io.on('connection',function(socket){

        const handleMessage = (type, message) => {
            if(!message.to){
                io.to(room.name).emit(type, message.data);
            }else{
                relayToUser(socket, message.to, type, message.data);
            }
        };

        const relayToUser = (user, type, data) =>  {
            let socketId = findActive(user).id;
            if(socketId){
                let receiver = io.sockets.connected[socketId];
                if(receiver) receiver.emit(type, data);
            }else{
                socket.emit('error-message', { error: 'no such user connected', message: data});
            }
        };

        // data sent upon entering a room
        socket.on('enter-message', function(data){
            console.log(data.from + ' entered the room');
            addActive(data.from, socket);
            socket.join(room.name);
            room.users.push(data.from);
            data.users = room.users;
            io.to(room.name).emit('enter-message', data);
        });

        // data sent upon leaving a room
        socket.on('leave-message', function(data){
            console.log(data.from + ' left the room');
            removeActive(data.from);
            room.users = room.users.filter((user) => user !== data.from);
            data.users = room.users;
            socket.leave(room.name);
            io.to(data.room).emit('leave-message', data);
        });

        // first message during a call
        socket.on('call-message', function (data) {
            console.log(data.from + ' called '+data.to);
            handleMessage('call-message', data);
        });

        // data sent upon sending an sdp offer
        socket.on('offer-message', function(data){
            console.log(data.from + ' send offer to ' + data.to);
            handleMessage('offer-message', data);
        });

        // data sent as an answer
        socket.on('answer-message', function (data) {
            console.log(data.from + 'send answer to ' + data.to);
            handleMessage('answer-message', data);
        });

        // data sent upon presenting ice candidates
        socket.on('ice-message', function(data){
            console.log(data.from + ' send ice candidate to ' + data.to);
            handleMessage('ice-message', data);
        });

        socket.on('user-message', function(data){
            console.log(data.from + ' send user message to ' + data.to + ' containing '+data.data);
            handleMessage('user-message', data);
        });

    });
};
