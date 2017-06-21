/**
 * Created by NasskalteJuni on 18.06.2017.
 */
const Room = require('./room.js');

// socket stuff
module.exports = function sockets(io, rooms) {
    io.on('connection',function(socket){

        // data sent upon entering a room
        socket.on('enter-message', function(data){
            let room = Room.getRoomWithId(rooms, data.room);
            if(room){
                if(!Room.hasRoomUserWithName(room, data._user)) Room.addUserToRoom(room, data._user);
                socket.join(data.room);
                data.users = room.users;
                io.to(data.room).emit('enter-message', data);
            }
        });

        // data sent upon leaving a room
        socket.on('leave-message', function(data){
            let room = Room.getRoomWithId(rooms, data.room);
            if(room) {
                if(Room.hasRoomUserWithName(room, data._user)) Room.removeUserFromRoom(room, data._user);
                socket.leave(data.room);
                data.users = room.users;
                io.to(data.room).emit('leave-message', data);
            }
        });

        // data sent upon sending an sdp offer
        socket.on('sdp-message', function(data){
            io.to(data.room).emit('sdp-message', data);
        });

        // data sent upon presenting ice candidates
        socket.on('ice-message', function(data){
            io.to(data.room).emit('ice-message', data);
        });

        socket.on('_user-message', function(data){
            io.to(data.room).emit('_user-message', data);
        });

    });
};

