/**
 * Created by NasskalteJuni on 20.06.2017.
 */

/**
 * A manager that manages connections between users over websockets.
 * A connection can go from one user to another or from one user to everyone (when null is given)
 * */
class SocketConnectionManager{

    /**
     * Creates a new Manager that handles socket connections
     * @param self <String> which user am I.
     * @param url <String> the url of the socket connection server
     * */
    constructor(self, url){
        if(!this._checkUser(self)) throw new Error("self must be a string identifier");
        this._connection = io.connect(url);                                             // the connection to the socket server, by socket io
        this._socketConnections = {};                                                   // dictionary for every connection with the user that is connected to as a key
        this._self = self;                                                              // reference to oneself, which user am I?
    }

    /**
     * Get a connection to the given user. If none exists, create one. There can be only one connection to a user at the same time
     * @param user <String> or <NULL> the name / ID of the user to connect to or null if all messages should be broadcast
     * @return socket connection to the user
     * */
    getSocketConnection(user=null){
        if(!this._checkUser(user)) throw new Error("user musst be a string identifier");                                         // only strings as name / ID allowed
        if(!this._socketConnections[user]) this._socketConnections[user] = new SocketConnection(this._connection);              // create a new connection if one does not exist already
        this._socketConnections[user].user = user;                                                                              // set the user to which this connection goes
        this._socketConnections[user].self = this._self;                                                                        // set oneself, from which user this direction comes
        return this._socketConnections[user];                                                                                   // return the connection belonging to the user
    }

    /**
     * check if the user is valid
     * @param user the user to be checked
     * @return boolean true if the user identifier is a string or null */
    _checkUser(user){
        return typeof user === "string" || typeof user instanceof String || user === null;
    }
}