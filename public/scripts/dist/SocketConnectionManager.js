"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by NasskalteJuni on 20.06.2017.
 */

/**
 * A manager that manages connections between users over websockets.
 * A connection can go from one user to another or from one user to everyone (when null is given)
 * */
var SocketConnectionManager = function () {

    /**
     * Creates a new Manager that handles socket connections
     * @param self <String> which user am I.
     * @param url <String> the url of the socket connection server
     * */
    function SocketConnectionManager(self, url) {
        _classCallCheck(this, SocketConnectionManager);

        console.log('created a socketConnectionManager for self=' + self);
        if (!this._checkUser(self)) throw new Error("self must be a string identifier");
        this._connection = io.connect(url); // the connection to the socket server, by socket io
        this._socketConnections = {}; // dictionary for every connection with the user that is connected to as a key
        this._self = self; // reference to oneself, which user am I?
    }

    /**
     * Get a connection to the given user. If none exists, create one. There can be only one connection to a user at the same time
     * @param user <String> or <NULL> the name / ID of the user to connect to or null if all messages should be broadcast
     * @return socket connection to the user
     * */


    _createClass(SocketConnectionManager, [{
        key: "getSocketConnection",
        value: function getSocketConnection() {
            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (!this._checkUser(user)) throw new Error("user musst be a string identifier"); // only strings as name / ID allowed
            if (!this._socketConnections[user]) {
                this._socketConnections[user] = new SocketConnection(this._connection); // create a new connection if one does not exist already
                this._socketConnections[user].setUser(user); // set the user to which this connection goes
                this._socketConnections[user].setSelf(this._self);
            } // set oneself, from which user this direction comes
            return this._socketConnections[user]; // return the connection belonging to the user
        }

        /**
         * check if the user is valid
         * @param user the user to be checked
         * @return boolean true if the user identifier is a string or null */

    }, {
        key: "_checkUser",
        value: function _checkUser(user) {
            return typeof user === "string" || (typeof user === "undefined" ? "undefined" : _typeof(user)) instanceof String || user === null;
        }
    }]);

    return SocketConnectionManager;
}();