/**
 * Created by NasskalteJuni on 13.06.2017.
 */
const express = require('express');
const bodyParser = require('body-parser');

// create an app and define some configurations
module.exports = function application(room){
    // create new app
    const app = express();

    // configurations
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.set('view engine', 'ejs');
    app.use(express.static('public'));


    return app;
};
