/**
 * Created by NasskalteJuni on 20.06.2017.
 */

class PeerConnection extends RTCPeerConnection{

    /**
     * Create a peer connection exactly like a RtcPeerConnection
     * @param server an object with the property iceServers that contains an array of STUN and TURN servers to use by ICE
     * @param option an object specifying under what configurations the connection should be established
     * */
    constructor(servers,options){
        super(servers,options);
    }

    /**
     * set the user to which this peer connection goes
     * @param user the receiving user
     * */
    setUser(user){
        this._user = user;
    }

    /**
     * get the user to which this peer connection goes
     * @param user the receiving user
     * */
    getUser(){
        return this._user;
    }

    /**
     * set the user from which this peer connection comes (one self)
     * @param user one self;
     * */
    setSelf(user){
        this._self = self;
    }

    /**
     * get the user from which this peer connection comes (one self)
     * @param user one self;
     * */
    getSelf(){
        return this._self;
    }

    /**
     * set the local description of the offer answer mechanism
     * @param sessionDescription the session description describing local codecs, etc
     * @return Promise resolves with the session description when set successfully or rejects with the occureing error
     * */
    setLocalDescription(sessionDescription){
        return new Promise((resolve, reject) => {
            super.setLocalDescription(sessionDescription).then(() => resolve(sessionDescription)).catch((err) => reject(err));
        });
    }

    /**
     * set the remote description of the offer answer mechanism
     * @param sessionDescripton the session description describing the remote peers codecs, etc
     * @return Promise resolves with the session description when set successfully or rejects with the occuring error
     * */
    setRemoteDescription(sessionDescription){
        return new Promise((resolve, reject) => {
            super.setRemoteDescription(sessionDescription).then(() => resolve(sessionDescription).catch((err) => reject(err)))
        });
    }
}