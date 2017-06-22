'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by User on 20.06.2017.
 */

/**
 * A real time data message tunnel over a web socket server
 * */
var SocketConnection = function () {

    /**
     * Create a new connection to a user
     * @param connection the connection to the socket server
     * */
    function SocketConnection(connection) {
        _classCallCheck(this, SocketConnection);

        console.log('created a new SocketConnection');
        this._connection = connection;
        this._isBlocked = true;
    }

    /**
     * create a message that is understood by other socket endpoints and the socket server
     * @param data the payload of the message
     * @return object a message that can be send by this socket framework
     * */


    _createClass(SocketConnection, [{
        key: '_createMessage',
        value: function _createMessage(data) {
            return {
                'from': this._self,
                'to': this._user,
                'data': data,
                'time': new Date()
            };
        }

        /**
         * get the user that is the endpoint of this connection
         * @return the user name / ID or null for broadcast
         * */

    }, {
        key: 'getUser',
        value: function getUser() {
            return this._user;
        }

        /**
         * sets the user that should be endpoint of this connection
         * @param user the user name / ID or null for broadcast
         * */

    }, {
        key: 'setUser',
        value: function setUser(user) {
            console.log('set target of socket connection user=' + user);
            this._user = user;
        }

        /**
         * gets which user is set as oneself
         * @return user the user name / ID
         * */

    }, {
        key: 'getSelf',
        value: function getSelf() {
            return this._self;
        }

        /**
         * sets which user is set as oneself
         * @param user the user name / ID
         * */

    }, {
        key: 'setSelf',
        value: function setSelf(user) {
            console.log('set self of socket connection self=' + user);
            this._self = user;
        }

        /**
         * send an offer over the socket connection to establish a peer connection
         * @param sessionDescription a javascript generated sdp datagram
         * @return Promise when the offer is sent
         * */

    }, {
        key: 'sendOffer',
        value: function sendOffer(sessionDescription) {
            var _this = this;

            return new Promise(function (resolve) {
                if (!_this._isBlocked) _this._connection.emit('offer-message', _this._createMessage(sessionDescription));
                _this._isBlocked = true;
                resolve();
            });
        }

        /**
         * receive an offer over the socket connection to establish a peer connection as the remote / called part
         * @return Promise when an offer is received, it is resolved
         * */

    }, {
        key: 'receiveOffer',
        value: function receiveOffer() {
            var _this2 = this;

            return new Promise(function (resolve) {
                _this2._connection.on('offer-message', function (message) {
                    if (!_this2._isBlocked && (message.to === _this2._self || message.to === null)) {
                        _this2._isBlocked = true;
                        resolve(message.data);
                    }
                });
            });
        }

        /**
         * send an answer to establish a peer connection as the remote / called part
         * @param sessionDescription a javascript generated sdp datagram
         * @return Promise when the answer is sent
         * */

    }, {
        key: 'sendAnswer',
        value: function sendAnswer(sessionDescription) {
            var _this3 = this;

            return new Promise(function (resolve) {
                if (_this3._isBlocked) {
                    _this3._connection.emit('answer-message', _this3._createMessage(sessionDescription));
                    _this3._isBlocked = false;
                    resolve();
                }
            });
        }

        /**
         * receive an answer of an offer you sent to a remote / called peer
         * @return Promise when the answer arives it is resolved
         * */

    }, {
        key: 'receiveAnswer',
        value: function receiveAnswer() {
            var _this4 = this;

            return new Promise(function (resolve) {
                _this4._connection.on('answer-message', function (message) {
                    if (_this4._isBlocked && (message.to === _this4._self || message.to === null)) {
                        _this4._isBlocked = false;
                        resolve(message.data);
                    }
                });
            });
        }

        /**
         * send a message to a user with self specified content (Chat message, for example)
         * @param data <String> the data / payload of the message
         * @return Promise just for Promise chaining, when the data is sent
         * */

    }, {
        key: 'sendMessage',
        value: function sendMessage(data) {
            var _this5 = this;

            return new Promise(function (resolve) {
                _this5._connection.emit('user-message', _this5._createMessage(data));
                resolve();
            });
        }

        /**
         * receive a message from a user with self specified content (Chat message, for example)
         * @return Promise when the data is received, it is resolved
         * */

    }, {
        key: 'receiveMessage',
        value: function receiveMessage() {
            var _this6 = this;

            return new Promise(function (resolve) {
                _this6._connection.on('user-message', function (message) {
                    console.log('received user-message ' + message.data);
                    resolve(message);
                });
            });
        }

        /**
         * send a datagram to the user indicating the start of a call
         * @return Promise when the call is sent
         * */

    }, {
        key: 'sendCall',
        value: function sendCall(user) {
            var _this7 = this;

            return new Promise(function (resolve) {
                _this7._connection.emit('call-message', _this7._createMessage(user));
                resolve();
            });
        }

        /**
         * receive a call datagramm and use its receiver and sender name / ID
         * @return Promise when the call message is received, it is resolved to an object with sender and receiver as key
         * */

    }, {
        key: 'receiveCall',
        value: function receiveCall() {
            var _this8 = this;

            return new Promise(function (resolve) {
                _this8._connection.on('call-message', function (message) {
                    resolve({
                        receiver: message.data,
                        sender: message.from
                    });
                });
            });
        }

        /**
         * method primarily to use in broadcasts, when a user enters a room.
         * this methods sends the given data to the users and should be invoked on connection to the room
         * @param data the data to be send. this can be a string like 'hello users! user x connected to room'
         * */

    }, {
        key: 'sendEnter',
        value: function sendEnter(data) {
            this._connection.emit('enter-message', this._createMessage(data));
        }

        /**
         * method that is invoked when an enter message is received
         * @return a Promise that resolves with an Object with the message and users, the current users in the room
         * */

    }, {
        key: 'receiveEnter',
        value: function receiveEnter() {
            var _this9 = this;

            return new Promise(function (resolve) {
                _this9._connection.on('enter-message', function (data) {
                    console.log('enter', data);
                    resolve({
                        message: data.message,
                        users: data.users
                    });
                });
            });
        }

        /**
         * method primarily to use in broadcasts, when a user leaves a room
         * this method sends the given data to the users and should be invoked on connection to the room
         * @param data the data to be send. this can be a string like 'user x left the room'
         * */

    }, {
        key: 'sendLeave',
        value: function sendLeave(data) {
            this._connection.emit('leave-message', this._createMessage(data));
        }

        /**
         * method that is invoked when a leave-message is received
         * @return a Promise that resolves with an Object with the message and users, the current users in the room
         * */

    }, {
        key: 'receiveLeave',
        value: function receiveLeave() {
            var _this10 = this;

            return new Promise(function (resolve) {
                _this10._connection.on('leave-message', function (data) {
                    console.log('leave', data);
                    resolve({
                        message: data.message,
                        users: data.users
                    });
                });
            });
        }
    }]);

    return SocketConnection;
}();