"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by NasskalteJuni on 21.06.2017.
 */

/**
 * Conversations to users. If no conversation is created, no call can be received.
 * Therefore, it makes sence to create conversations to every user and start the call after this
 * */
var Conversation = function () {
    _createClass(Conversation, null, [{
        key: "_getSocketConnectionManager",


        /**
         * get a socket connection manager of this client (one for every connection, does not work if this client has more users)
         * */
        value: function _getSocketConnectionManager(self, server) {
            if (Conversation._socketConnectionManager === undefined) Conversation._socketConnectionManager = new SocketConnectionManager(self, server);
            return Conversation._socketConnectionManager;
        }

        /**
         * get a peer connection manager of this client (one for every connection, does not work if this client has more users)
         * */

    }, {
        key: "_getPeerConnectionManager",
        value: function _getPeerConnectionManager(self) {
            if (Conversation._peerConnectionManager === undefined) Conversation._peerConnectionManager = new PeerConnectionManager(self);
            return Conversation._peerConnectionManager;
        }

        /**
         * Send a message that you entered the room
         * @param self who am I
         * @param server the server to send the broadcast to
         * @param message the message to send upon entering the room
         * */

    }, {
        key: "sendEnter",
        value: function sendEnter(self, server, message) {
            Conversation._getSocketConnectionManager(self, server).getSocketConnection().sendEnter(message);
        }

        /**
         * receive an Enter Message when someone enters the room
         * @return Promise a Promise that resolves with a message and users, the users currently in the room
         * */

    }, {
        key: "receiveEnter",
        value: function receiveEnter(self, server) {
            return Conversation._getSocketConnectionManager(self, server).getSocketConnection().receiveMessage();
        }

        /**
         * Send a message that you left the room
         * @param self who am I
         * @param server the server to send the broadcast to
         * @param message the message to send upon entering the room
         * */

    }, {
        key: "sendLeave",
        value: function sendLeave(self, server, message) {
            Conversation._getSocketConnectionManager(self, server).getSocketConnection().sendLeave(message);
        }

        /**
         * receive a Leave Message when someone leaves the room
         * @return Promise a Promise that resovles with a message and users, the users currently in the room
         * */

    }, {
        key: "receiveLeave",
        value: function receiveLeave(self, server) {
            return Conversation._getSocketConnectionManager(self, server).getSocketConnection().receiveLeave();
        }

        /**
         * Send some message to everyone in the room
         * @param self who am I
         * @param server the server to send the broadcast to
         * @param message the message to send upon entering the room
         * */

    }, {
        key: "sendBroadcast",
        value: function sendBroadcast(self, server, message) {
            Conversation._getSocketConnectionManager(self, server).getSocketConnection().sendMessage(message);
        }

        /**
         * Send some message to everyone in the room
         * @param self who am I
         * @param server the server to send the broadcast to
         * @param message the message to send upon entering the room
         * */

    }, {
        key: "receiveBroadcast",
        value: function receiveBroadcast(self, server) {
            return Conversation._getSocketConnectionManager(self, server).getSocketConnection().receiveMessage();
        }

        /**
         * create a connection between this user, one self, and a remote user
         * */

    }]);

    function Conversation(self, partner) {
        _classCallCheck(this, Conversation);

        this._peerConnectionManager = Conversation._getPeerConnectionManager(self); // manages every peer connection this user has to other users
        this._socketConnectionManager = Conversation._getSocketConnectionManager(self, server); // manages every socket connection this user has to other users
        this.bc = this._socketConnectionManager.getSocketConnection(); // broadcast channel to every other user
        this._self = self; // which user am I
        this._partner = partner; // which user is called or calls me
        this.onCalled = null; // callback function that is triggered when a call is received
        this._participate();
    }

    /**
     * start a call to a remote peer. errors are logged
     * @param partner <String> the name / ID peer that is to be called
     * */


    _createClass(Conversation, [{
        key: "start",
        value: function start() {
            this.pc = this._peerConnectionManager.getPeerConnection(this._partner); // create the peer connection to the user called
            this.sc = this._socketConnectionManager.getSocketConnection(this._partner); // cretae the socket connection to the user called

            this.bc.sendCall(this._self) // call the user over a broadcast. The one that is called will filter this message out
            .then(this.pc.createOffer) // create an offer describing the informations about this user             //
            .then(this.pc.setLocalDescription) // set the offer as the local description. After this, ice candidates will be gathered
            .then(this.sc.sendOffer) // send the offer as client description to the called partner
            .then(this.sc.receiveAnswer) // then, after some time you may receive an answer
            .then(this.pc.setRemoteDescription) // set the answer as a description of the remote peer
            .catch(console.log); // catch possible errors during this process
            if (typeof this.onCalled === "function") this.onCalled(pc, sc); // give the onCalled callback the active socket and peer connection
        }

        /**
         * receive a call from a remote peer. errors are logged
         * (this is the passive version of starting a call that is possibly called by other peer connections and handles these subsequent calls)
         * */

    }, {
        key: "_participate",
        value: function _participate() {
            this.pc = null;
            this.sc = null;

            this.bc.receiveCall() // when a user sends that he intends to call over broadcast
            .then(function (call) {
                // check if it he wants to call you and if it is not your own call
                return new Promise(function (resolve, reject) {
                    // create a private peer and socket connection between you and the user
                    if (call.sender !== this._self && call.receiver === this._self && call.sender === this._partner) {
                        this.pc = this._peerConnectionManager.getPeerConnection(this._partner);
                        this.sc = this._socketConnectionManager.getSocketConnection(call.this._partner);
                        resolve();
                    } else {
                        reject(false); // if the broadcast was not for this user, skipp every setup step and try again
                    }
                });
            }).then(this.sc.receiveOffer) // receive the offer, set it, create the answer set it and send it
            .then(this.pc.setRemoteDescription).then(this.pc.createAnswer).then(this.pc.setLocalDescription).then(this.sc.sendAnswer) // on any error, check if it was a call not for you --> restart or a real error
            .catch(function (err) {
                err === false ? this._participate() : console.log(err);
            });
            if (typeof this.onCalled === "function") this.onCalled(pc, sc); // give the onCalled callback the active socket and peer connection
        }
    }]);

    return Conversation;
}();