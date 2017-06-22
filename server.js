/**
 * Created by NasskalteJuni on 12.06.2017.
 */
const config = require('./config.json');
const fs = require('fs');
const application = require('./app.js');
const routes = require('./routes.js');
const sockets = require('./sockets.js');
const protocol = require(config.server.protocol);
const port = config.server.port;


// model
const room = {
    name: 'chatroom',
    users: []
};

// create an app by defining basic functionality and configurations
const app = application(room);

// create a server of the given protocol
const server = protocol.createServer({
    key: fs.readFileSync('tls/https_key.pem'),
    cert: fs.readFileSync('tls/https_cert.pem')
}, app);

// define the routes and how to handle requests
routes(app, room);

// define the socket io core
const io = require('socket.io')(server);

// define the sockets and how to handle real time data to the server
sockets(io, room);

// start the server on the given port
server.listen(port, function() {
    console.log('Server is running on port '+port);
});

// handle shutdowns, etc.
process.on('SIGINT',function(){
    process.exit();
});

// handle errors
process.on('error',function (err) {
   console.log(err);
});