/**
 * Created by NasskalteJuni on 12.06.2017.
 */
const config = require('./config.json');
const fs = require('fs');
const application = require('./app.js');
const routes = require('./routes.js');
const sockets = require('./sockets.js');
const Room = require('./room.js');
const protocol = require(config.server.protocol);
const port = config.server.port;


// model
const rooms = Room.loadRooms("rooms.json") || [];

// create an app by defining basic functionality and configurations
const app = application(rooms);

// create a server of the given protocol
const server = protocol.createServer({
    key: fs.readFileSync('tls/https_key.pem'),
    cert: fs.readFileSync('tls/https_cert.pem')
},app);

// define the routes and how to handle requests
routes(app, rooms);

// define the socket io core
const io = require('socket.io')(server);

// define the sockets and how to handle real time data to the server
sockets(io, rooms);

// start the server on the given port
server.listen(port, function() {
    console.log('Server is running on port '+port);
});

// handle shutdowns, etc.
process.on('SIGINT',function(){
    app.exit();
    process.exit();
});

// handle errors
process.on('error',function (err) {
   console.log(err);
});