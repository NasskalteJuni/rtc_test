/**
 * Created by NasskalteJuni on 17.06.2017.
 */
const config = require('./config.json');
const querystring = require('querystring');
const parameter = (req, name) => req.params[name] || req.query[name] || req.body[name];

module.exports = function routes(app, room){

    // frontpage view
    app.get('/', function (req, res) {
        // just go to name creation
        res.redirect("/name");
    });

    // room view
    app.get('/chat', function (req, res) {
        let errors = [];
        let username = querystring.unescape(parameter(req,'user'));             // check the request for a username
        if(!username || username.trim().length === 0){
            errors.push('you must give yourself a user name');                  // when no name is given, set this as an error
        }else if(room.users.indexOf(parameter(req, username))  >= 0){
            errors.push('username '+username+' already in use');                // when the name is already in use, this is also an error, since the name should be an ID
        }

        if(!errors || errors.length === 0){                                     // If everything went fine, show the room
            res.render('room.ejs', {
                user: username,
                room: room,
                server: config.server
            });
        }else{
            let query = '?errors='+querystring.escape(JSON.stringify(errors));  // when someone tries to call room wih invalid parameters, send him back to the name creation
            res.redirect('/name'+query);
        }
    });

    // name view
    app.get('/name', function (req, res) {
        let errors = parameter(req, 'errors');                                  // check if the page was called with errors during 'login'
        if(!errors){
            errors = []                                                         // No errors --> empty error list
        }else{
            errors = JSON.parse(querystring.unescape(errors));                  // when the errors are send via querystring, decode them
        }
        let username = parameter(req, 'user');                                  // name parameter that can be optionally in the query
        if(!username){
            username = "";                                                      // default is an empty name: page is visited first --> name is empty
        }
        res.render('name.ejs', {                                                // render the with a list of online users and a list of occured errors
            errors: errors,
            user: username,
            users: room.users
        });
    });

    // name creation & entering the room
    app.post('/name', function (req, res) {
        let errors = [];                                                        // prepare an array for errors that may happen during this 'login'
        let username = parameter(req,'user');                                   // check the request for a username
        if(!username || username.trim().length === 0){
            errors.push('you must give yourself a user name');                  // when no name is given, set this as an error
        }else if(room.users.indexOf(parameter(req, username))  >= 0){
            errors.push('username '+username+' already in use');                // when the name is already in use, this is also an error, since the name should be an ID
        }

        if(errors.length === 0){
            res.redirect("/chat?user="+querystring.escape(username));        // when everything is okay, redirect to the room page
        }else{
            errors.forEach(console.log);
            res.render('name.ejs', {                                            // render the with a list of online users and a list of occured errors
                errors: errors,
                user: username,
                users: room.users
            });
        }
    });

    // all routes not matched until now --> error 404
    app.get('*', function(req, res){
        res.render('error.ejs',{
            code: 404,
            error: 'Hier ist nichts, gehen sie weiter'
        });
    })
};
