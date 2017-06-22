"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by NasskalteJuni on 20.06.2017.
 */

var PeerConnection = function (_RTCPeerConnection) {
    _inherits(PeerConnection, _RTCPeerConnection);

    /**
     * Create a peer connection exactly like a RtcPeerConnection
     * @param server an object with the property iceServers that contains an array of STUN and TURN servers to use by ICE
     * @param option an object specifying under what configurations the connection should be established
     * */
    function PeerConnection(servers, options) {
        _classCallCheck(this, PeerConnection);

        return _possibleConstructorReturn(this, (PeerConnection.__proto__ || Object.getPrototypeOf(PeerConnection)).call(this, servers, options));
    }

    /**
     * set the user to which this peer connection goes
     * @param user the receiving user
     * */


    _createClass(PeerConnection, [{
        key: "setUser",
        value: function setUser(user) {
            this._user = user;
        }

        /**
         * get the user to which this peer connection goes
         * @param user the receiving user
         * */

    }, {
        key: "getUser",
        value: function getUser() {
            return this._user;
        }

        /**
         * set the user from which this peer connection comes (one self)
         * @param user one self;
         * */

    }, {
        key: "setSelf",
        value: function setSelf(user) {
            this._self = self;
        }

        /**
         * get the user from which this peer connection comes (one self)
         * @param user one self;
         * */

    }, {
        key: "getSelf",
        value: function getSelf() {
            return this._self;
        }

        /**
         * set the local description of the offer answer mechanism
         * @param sessionDescription the session description describing local codecs, etc
         * @return Promise resolves with the session description when set successfully or rejects with the occureing error
         * */

    }, {
        key: "setLocalDescription",
        value: function setLocalDescription(sessionDescription) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _get(PeerConnection.prototype.__proto__ || Object.getPrototypeOf(PeerConnection.prototype), "setLocalDescription", _this2).call(_this2, sessionDescription).then(function () {
                    return resolve(sessionDescription);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }

        /**
         * set the remote description of the offer answer mechanism
         * @param sessionDescripton the session description describing the remote peers codecs, etc
         * @return Promise resolves with the session description when set successfully or rejects with the occuring error
         * */

    }, {
        key: "setRemoteDescription",
        value: function setRemoteDescription(sessionDescription) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _get(PeerConnection.prototype.__proto__ || Object.getPrototypeOf(PeerConnection.prototype), "setRemoteDescription", _this3).call(_this3, sessionDescription).then(function () {
                    return resolve(sessionDescription).catch(function (err) {
                        return reject(err);
                    });
                });
            });
        }
    }]);

    return PeerConnection;
}(RTCPeerConnection);