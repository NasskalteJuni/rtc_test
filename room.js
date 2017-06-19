/**
 * Created by NasskalteJuni on 18.06.2017.
 */

const timeDifference = require('./timeDifference.js');
const fs = require('fs');
const randomToken = require('./randomToken.js');

// define room functions
const getRoomUserNumber = room => room ? room.users.length : 0;
const getAllUserNumber = rooms => rooms.reduce((acc, room) => acc + getRoomUserNumber(room), 0);
const hasRoomUserWithName = (room, name) => room && room.users.indexOf(name) >= 0;
const addUserToRoom = (room, name) => room.users.push(name);
const removeUserFromRoom = (room, name) => room.users = room.users.filter(user => name !== user)
const getRoomWithId = (rooms, id) => rooms.reduce((acc, val) => (val && val.id === id) ? val : acc, null);
const createRoomId = (rooms, id) => (!id || getRoomWithId(rooms, id)) ? createRoomId(rooms, randomToken()) : id;
const allowAccess = (room, token) => !room.token || room.token === token;
const activeRooms = (rooms, lifespan) => rooms.filter(room => timeDifference(new Date(rooms.created), new Date(),'day') < lifespan);
const loadRooms = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")).map(room => {
    room.created = new Date(room.created);
    return room
}) : null;
const saveRooms = (file, rooms) => fs.writeFileSync(file, JSON.stringify(rooms), "utf-8");


module.exports = {
    getRoomUserNumber: getRoomUserNumber,
    getAllUserNumber: getAllUserNumber,
    hasRoomUserWithName: hasRoomUserWithName,
    getRoomWithId: getRoomWithId,
    createRoomId: createRoomId,
    activeRooms: activeRooms,
    loadRooms: loadRooms,
    saveRooms: saveRooms,
    allowAccess: allowAccess,
    addUserToRoom: addUserToRoom,
    removeUserFromRoom: removeUserFromRoom
};