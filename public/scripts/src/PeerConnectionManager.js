/**
 * Created by User on 20.06.2017.
 */

/**
 * Manages Peer Connections of a user.
 * Works as a Factory and Singleton, since only one peer connection to a user can exists at a time.
 * This connection is created and configured by this class
 * */
class PeerConnectionManager{

    /**
     * Constructs a Manager that handles peer connections to different users.
     * The manager acts as factory since it creates the connection and as a singleton, since only one connection to a user exists the same time
     * @param self <String> since every user creates its own manager to handle its connections, the manager needs to know who he is (on which logged in users page the script is executed, for example)
     * @param servers <Object> [optional] overwrites the default google servers with own stun and turn server adresses
     * @param options <Object> [optional] overwrites the default rtc options (use data channels and other configurations)
     * */
    constructor(self, servers, options){
        if(!PeerConnectionManager._checkUser(self)) throw new Error("self must be a string identifier");
        this._self = self;                                  // Which name / ID do i have myself as a user?
        this._peerConnections = {};                         // dictionary of connections with the user name / ID as key
        this._servers = servers || {                        // default servers to use if no server configuration is given
            'iceServers': [
                {'url': 'stun:stun.1.google.com:19302'},
                {'url': 'stun:stun1.1.google.com:19302'}
            ]
        };
        this._options = options || {                        // default options for connections
                'optional': [
                    {'DtlsSrtpKeyAgreement': true},
                    {'RtpDataChannels': true}
                ]
        };
    }

    /**
     * Gets the Peer Connection to a user.
     * If no such connection exists, a new connection is created.
     * Only a connection between this peer and a user X can exists at a time.
     * @param user <String> the name / ID of the user which one wants to talk to over the peer connection
     * */
    getPeerConnection(user){
        if(!PeerConnectionManager._checkUser(user)) throw new Error("user musst be a string identifier");                   // only allow Strings as user name / ID
        if(!this._peerConnections[user])  this._peerConnections[user] = new PeerConnection(this._servers, this._options);   // create a new connection, if not already existing
        this._peerConnections[user].user = user;                                                                            // set the remote user to which user this connection goes
        this._peerConnections[user].self = this._self;                                                                      // set oneself, from which user the connection comes
        return this._peerConnections;                                                                                       // return the peer connection
    }

    /**
     * check if the user is valid
     * @param user the user to be checked
     * @return boolean true if the user identifier is a string*/
    static _checkUser(user){
        return typeof user === "string" || user instanceof String
    }
    
}