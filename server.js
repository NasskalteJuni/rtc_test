/**
 * Created by NasskalteJuni on 12.06.2017.
 */

const config = require('./config.json');
const app = require('./app.js');
const port = config.server.port || process.env.port || 8080;

app.listen(port, function() {
    console.log('Server is running on port '+port);
});

process.on('SIGINT',function(){
    app.exit();
    process.exit();
});

process.on('error',function (err) {
   console.log(err);
});