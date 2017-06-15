/**
 * Created by NasskalteJuni on 15.06.2017.
 */
const valid = new Date();
const invalid =  valid.setMonth((valid.getMonth() + 11)% 12 ) // set the date one month back;
const lifespan = 7;
const rooms = [
    {"id":"1","name":"public","description":"room for everyone","created":invalid.toString(),"token":null,"users":[]},     // invalid
    {"id":"2","name":"public","description":"room for everyone","created":valid.toString(),"token":null,"users":[]}      // valid
];
const activeRooms = (rooms, lifespan) => rooms.filter(room => ~~(Math.abs(+room.created - +new Date())/(1000 * 60 * 60 * 24)) < lifespan);

let result = activeRooms(rooms, lifespan);
console.log(result);
if(result.length !== 1){
    console.log('test activeRooms failed: wrong number of rooms');
}else{
    if(result[0].id === "1"){
        console.log('test activeRooms failed: wrong room');
    }else{
        console.log('test activeRooms succeeded');
    }
}