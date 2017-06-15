/**
 * Created by NasskalteJuni on 13.06.2017.
 */
// imports
const fs = require('fs');
const express = require('express');
const app = express();
const expressWebSockets = require('express-ws')(app);
const bodyParser = require('body-parser');

// configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static('public'));

// define room functions
const getRoomUserNumber = room => room ? room.users.length : 0;
const getAllUserNumber = rooms => rooms.reduce((acc, room) => acc+getRoomUserNumber(room), 0);
const hasRoomUserWithName = (room, name) => room && room.users.indexOf(name) >= 0;
const getRoomWithId = (rooms, id) =>  rooms.reduce((acc, val) => (val && val.id === id) ? val : acc, null);
const randomToken = () => Math.random().toString(32).substring(2,12);
const createRoomId = (rooms, id) => (!id || getRoomWithId(rooms, id)) ? createRoomId(rooms, randomToken()) : id;
const allowAccess = (room, token) => !room.token || room.token === token;
const activeRooms = (rooms, lifespan) => rooms.filter(room => Math.abs(+room.created - +new Date())/(1000 * 60 * 60 * 24) < lifespan);
const getRooms =(file) => fs.existsSync(file) ? fs.readFileSync(file,"utf-8") : null;
const saveRooms = (file, rooms) => fs.writeFileSync(file, JSON.stringify(rooms),"utf-8");

// model
let rooms = getRooms("rooms.json") || [];

// middleware for each call
app.use(function(req, res, next){
    let url = req.url;
    let status = res.statusCode;
    // monitor every request and result
    console.log(url,status);
    // remove rooms that are older than 7 days
    rooms = activeRooms(rooms, 7);
    console.log(getRooms("rooms.json"));
    // carry on
    next();
});

// Index route
app.get('/', function(req, res) {
    res.render('index.ejs',{
        rooms: rooms.sort((a, b) => a.name - b.name),
        userCount: getAllUserNumber(rooms)
    });
});

// room route
app.get('/room/:id', function(req, res){
    let id = req.params.id || req.query.id || req.body.id;
    let room = getRoomWithId(rooms, id);
    let user = req.params.user || req.query.user || req.body.user;
    let token = req.params.token || req.query.token || req.body.token;
    let enter = req.params.token || req.query.token ||  req.body.token;
    if(room){
        if(allowAccess(room, token)){
            if(enter && hasRoomUserWithName(room, user)){
                res.render('error.ejs',{
                    error: "username already in use",
                    code: 401
                });
            }else{
                if(user && enter){
                    room.users.push(user);
                }
                res.render('room.ejs',{
                    room: room,
                    user: user
                });
            }
        }else{
            res.render('error.ejs',{
                error: "invalid room token",
                code: 401
            })
        }
    }else{
        res.render('error.ejs',{
            error: "No room with this id",
            code: 404
        })
    }
});

// room creation
app.post('/room', function (req, res) {
    if(req.body.name){
        let room = {
            id:  createRoomId(rooms),
            name: req.body.name,
            description: req.body.description,
            created: new Date(),
            token: req.body.access === "private" ? randomToken() : null,
            users: []
        };
        rooms.push(room);
        res.render('name.ejs',{
            room: room,
            token: room.token,
            isCreator: true
        });
    }else{
        res.render('error.ejs',{
            error: 'no name given',
            code: 400
        });
    }
});

// name form
app.get('/name', function(req, res){
    let id = req.params.id || req.query.id || req.body.id;
    let room = getRoomWithId(rooms, id);
    let token = req.params.token || req.query.token || req.body.token;
    if(room){
        res.render('name.ejs', {
            room: room,
            token: token,
            isCreator: false
        });
    }else{
        res.render('error.ejs',{
            error: 'no room found with this id',
            code: 404
        });
    }
});

// name creation & entering the room
app.post('/name', function(req, res){
    let user = req.params.name || req.query.name || req.body.name;
    let id = req.params.room || req.query.room || req.body.room;
    let room = getRoomWithId(rooms, id);
    let token = req.params.token || req.query.token || req.body.token;
    if(room && user){
        if(hasRoomUserWithName(room, user)){
            res.render('error.ejs', {
                error: 'username already in use',
                code: 403
            });
        }else{
            room.users.push(user);
            res.redirect('/room/'+id+(token ? "?token="+token+"&" : "?")+"user="+user+"&enter=1");
        }
    }else if(user){
        res.render('error.ejs',{
            error: 'no room found with this id',
            code: 404
        })
    }else{
        res.render('error.ejs',{
            error: 'no username given',
            code: 401
        })
    }
});

// websocket stuff
app.ws('/enter/:id', function(ws, req){
    let id = req.params.id || req.query.id || req.body.id;
    let token = req.params.token || req.query.token || req.body.token;
    let room = getRoomWithId(rooms, id);
    if(room && allowAccess(room, token)){
        let channel = ws.of(room.id);
        channel.on('connection', function(){
            channel.emit({
                user: null,
                message: 'user connected to room'
            });
        });
    }else{
        ws.emit({
            user: null,
            message: 'invalid room token'
        });
    }
});

app.ws('/chat/:id', function(ws, req){
    ws.on('message', function(socket){

    })
});

app.exit = function(){
    rooms.forEach(room => room.users = []);
    saveRooms("rooms.json",rooms);
};

module.exports = app;