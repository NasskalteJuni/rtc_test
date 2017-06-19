/**
 * Created by NasskalteJuni on 13.06.2017.
 */
const express = require('express');
const bodyParser = require('body-parser');
const Room = require('./room.js');


// create an app and define some configurations
module.exports = function application(rooms){
    // create new app
    const app = express();

    // configurations
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.set('view engine', 'ejs');
    app.use(express.static('public'));


    // middleware for each call
    app.use(function (req, res, next) {
        // remove rooms that are older than 7 days
        rooms = Room.activeRooms(rooms, 7);
        // carry on
        next();
    });

    // clearing function on shutdown
    app.exit = function () {
        rooms.forEach(room => room.users = []);
        Room.saveRooms("rooms.json", rooms);
    };

    return app;
};
