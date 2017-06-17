/**
 * Created by NasskalteJuni on 13.06.2017.
 */
// imports
const config = require('./config.json');
const fs = require('fs');
const express = require('express');
const expressWebSockets = require('express-ws')(express());
const app = expressWebSockets.app;
const bodyParser = require('body-parser');

// configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));


// define room functions
const getRoomUserNumber = room => room ? room.users.length : 0;
const getAllUserNumber = rooms => rooms.reduce((acc, room) => acc + getRoomUserNumber(room), 0);
const hasRoomUserWithName = (room, name) => room && room.users.indexOf(name) >= 0;
const getRoomWithId = (rooms, id) => rooms.reduce((acc, val) => (val && val.id === id) ? val : acc, null);
const randomToken = () => Math.random().toString(32).substring(2, 12);
const createRoomId = (rooms, id) => (!id || getRoomWithId(rooms, id)) ? createRoomId(rooms, randomToken()) : id;
const allowAccess = (room, token) => !room.token || room.token === token;
const timeDifference = (date1, date2) => Math.abs(+date2 - +date1);
const dayDifference = (date1, date2) => ~~( timeDifference(date1, date2)/ (1000 * 60 * 60 * 24));
const activeRooms = (rooms, lifespan) => rooms.filter(room => dayDifference(new Date(rooms.created), new Date()) < lifespan);
const loadRooms = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")).map(room => {
    room.created = new Date(room.created);
    return room
}) : null;
const saveRooms = (file, rooms) => fs.writeFileSync(file, JSON.stringify(rooms), "utf-8");
const broadcast = (socketConnections, data) => socketConnections.clients.forEach(connection => connection.send(typeof data === "string" ? data : JSON.stringify(data)));

// model
let rooms = loadRooms("rooms.json") || [];

// middleware for each call
app.use(function (req, res, next) {
    // remove rooms that are older than 7 days
    rooms = activeRooms(rooms, 7);
    // carry on
    next();
});

// Index route
app.get('/', function (req, res) {
    res.render('index.ejs', {
        rooms: rooms.sort((a, b) => a.name - b.name),
        userCount: getAllUserNumber(rooms)
    });
});

// room route
app.get('/room/:id', function (req, res) {
    let id = req.params.id || req.query.id || req.body.id;
    let room = getRoomWithId(rooms, id);
    let user = req.params.user || req.query.user || req.body.user;
    let token = req.params.token || req.query.token || req.body.token;
    let enter = req.params.enter || req.query.enter || req.body.enter;
    if (room) {
        if (allowAccess(room, token)) {
            if (enter && hasRoomUserWithName(room, user)) {
                res.render('error.ejs', {
                    error: "username already in use",
                    code: 401
                });
            } else {
                if (user && enter) {
                    room.users.push(user);
                }
                res.render('room.ejs', {
                    room: room,
                    user: user,
                    server: config.server
                });
            }
        } else {
            res.render('error.ejs', {
                error: "invalid room token",
                code: 401
            })
        }
    } else {
        res.render('error.ejs', {
            error: "No room with this id",
            code: 404
        })
    }
});

// room creation
app.post('/room', function (req, res) {
    if (req.body.name) {
        let room = {
            id: createRoomId(rooms),
            name: req.body.name,
            description: req.body.description,
            created: new Date(),
            token: req.body.access === "private" ? randomToken() : null,
            users: []
        };
        rooms.push(room);
        res.render('name.ejs', {
            room: room,
            token: room.token,
            isCreator: true
        });
    } else {
        res.render('error.ejs', {
            error: 'no name given',
            code: 400
        });
    }
});

// name form
app.get('/name', function (req, res) {
    let id = req.params.id || req.query.id || req.body.id;
    let room = getRoomWithId(rooms, id);
    let token = req.params.token || req.query.token || req.body.token;
    if (room) {
        res.render('name.ejs', {
            room: room,
            token: token,
            isCreator: false
        });
    } else {
        res.render('error.ejs', {
            error: 'no room found with this id',
            code: 404
        });
    }
});

// name creation & entering the room
app.post('/name', function (req, res) {
    let user = req.params.name || req.query.name || req.body.name;
    let id = req.params.room || req.query.room || req.body.room;
    let room = getRoomWithId(rooms, id);
    let token = req.params.token || req.query.token || req.body.token;
    if (room && user) {
        if (hasRoomUserWithName(room, user)) {
            res.render('error.ejs', {
                error: 'username already in use',
                code: 403
            });
        } else {
            res.redirect('/room/' + id + (token ? "?token=" + token + "&" : "?") + "user=" + user + "&enter=1");
        }
    } else if (user) {
        res.render('error.ejs', {
            error: 'no room found with this id',
            code: 404
        })
    } else {
        res.render('error.ejs', {
            error: 'no username given',
            code: 401
        })
    }
});

// websocket stuff
app.ws('/ping', function (ws) {
    ws.on('message', function (data) {
        data = JSON.parse(data);
        if(!data){
            ws.send(JSON.stringify({
                error: 'connection to server established but no ping data received'
            }));
        }else if(!data.time){
            ws.send(JSON.stringify({
                error: 'ping data must be an object containing the time it was sent'
            }));
        }else{
            ws.send(JSON.stringify({
                ping: timeDifference(new Date(), new Date(data.time))
            }));
        }
    })
});

app.param('id', (req,res,next, id) => {req.id = id; return next()});
app.ws('/chat/:id', function (ws, req) {
    let id = req.param.id || req.body.id || req.query.id || req.id;
    let room = getRoomWithId(rooms, id);
    let socketConnections = expressWebSockets.getWss('/chat/'+id);


    ws.on('message', function (data) {
        data = JSON.parse(data);
        if(data){
                if(data.type === 'user-message' && hasRoomUserWithName(room, data.user) && data.message){
                    broadcast(socketConnections, data);
                }

                if(data.type === 'enter-message'){
                    data.type = 'user-message';
                    broadcast(socketConnections, data);
                    broadcast(socketConnections, {
                        type: 'client-refresh',
                        target: 'users',
                        users: room.users
                    });
                }

                if(data.type === 'leave-message' && data.user && hasRoomUserWithName(room, data.user)){
                    data.type = 'user-message';
                    room.users = room.users.filter(name => name !== data.user);
                    broadcast(socketConnections, data);
                    broadcast(socketConnections, {
                        type: 'client-refresh',
                        target: 'users',
                        users: room.users
                    });
                }
        }
    });
});


app.exit = function () {
    rooms.forEach(room => room.users = []);
    saveRooms("rooms.json", rooms);
};

module.exports = app;
