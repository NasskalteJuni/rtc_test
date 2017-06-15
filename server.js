/**
 * Created by NasskalteJuni on 12.06.2017.
 */


const http = require('http');
const app = require('./app.js');
const port = process.env.port || 8080;

const server = http.createServer(app);
server.listen(port, function() {
    console.log('Server is running on port '+port);
});

process.on('SIGINT',function(){
    app.exit();
    console.log('server shuts down, data is persisted');
    process.exit();
});