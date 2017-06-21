/**
 * Created by NasskalteJuni on 17.06.2017.
 */
const config = require('./config.json');
const parameter = (req, name) => req.params[name] || req.query[name] || req.body[name];
const randomToken = require('./randomToken.js');
const Room = require('./room.js');

module.exports = function routes(app, rooms){

    // frontpage view
    app.get('/', function (req, res) {
        res.render('index.ejs', {
            rooms: rooms.sort((a, b) => a.name - b.name),
            userCount: Room.getAllUserNumber(rooms)
        });
    });

    // room view
    app.get('/room/:id', function (req, res) {
        let id = parameter(req,'id');
        let room = Room.getRoomWithId(rooms, id);
        let user = parameter(req,'_user');
        let token = parameter(req,'token');
        let enter = parameter(req,'enter');
        if (room) {
            if (Room.allowAccess(room, token)) {
                if (enter && Room.hasRoomUserWithName(room, user)) {
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

    app.get('/room/:id/others', function(req, res){
        let id = parameter(req,'id');
        let room = Room.getRoomWithId(rooms, id);
        let user = parameter(req,'_user');
        let token = parameter(req,'token');
        if (room) {
            if (Room.allowAccess(room, token)) {
                res.json(Room.getOtherUsersOfRoom(room, user));
            } else {
                res.json({
                    error: "invalid room token",
                    code: 401
                })
            }
        } else {
            res.json({
                error: "No room with this id",
                code: 404
            })
        }
    });

    // room creation && going to the name creation
    app.post('/room', function (req, res) {
        if (req.body.name) {
            let room = {
                id: Room.createRoomId(rooms),
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

    // name view
    app.get('/name', function (req, res) {
        let id = parameter(req,'id');
        let room = Room.getRoomWithId(rooms, id);
        let token = parameter(req, 'token');
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
        let user = parameter(req,'name');
        let id = parameter(req, 'room');
        let room = Room.getRoomWithId(rooms, id);
        let token = parameter(req,'token');
        if (room && user) {
            if (Room.hasRoomUserWithName(room, user)) {
                res.render('error.ejs', {
                    error: 'username already in use',
                    code: 403
                });
            } else {
                res.redirect('/room/' + id + (token ? "?token=" + token + "&" : "?") + "_user=" + user + "&enter=1");
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
};
