/**
 * Created by User on 20.06.2017.
 */

/**
 * A real time data message tunnel over a web socket server
 * */
class SocketConnection{

    /**
     * Create a new connection to a user
     * @param connection the connection to the socket server
     * */
    constructor(connection){
        this._connection = connection;
        this._isBlocked = true;
    }


    /**
     * create a message that is understood by other socket endpoints and the socket server
     * @param receiver who receives the message
     * @param data the payload of the message
     * @return object a message that can be send by this socket framework
     * */
    static _createMessage(data){
        return {
            'from': this._self,
            'to': this._user,
            'data': data,
            'time': new Date()
        }
    }

    /**
     * get the user that is the endpoint of this connection
     * @return the user name / ID or null for broadcast
     * */
    getUser(){
        return this._user;
    }

    /**
     * sets the user that should be endpoint of this connection
     * @param user the user name / ID or null for broadcast
     * */
    setUser(user){
        this._user = user;
    }

    /**
     * gets which user is set as oneself
     * @param user the user name / ID
     * */
    getSelf(user){
        return this._self;
    }

    /**
     * sets which user is set as oneself
     * @param user the user name / ID
     * */
    setSelf(user){
        this._self = user;
    }

    /**
     * send an offer over the socket connection to establish a peer connection
     * @param sessionDescription a javascript generated sdp datagram
     * @return Promise when the offer is sent
     * */
    sendOffer(sessionDescription){
        return new Promise((resolve) => {
            if(!this._isBlocked) this._connection.emit('offer-message', SocketConnection._createMessage(sessionDescription));
            this._isBlocked = true;
            resolve();
        });
    }

    /**
     * receive an offer over the socket connection to establish a peer connection as the remote / called part
     * @return Promise when an offer is received, it is resolved
     * */
    receiveOffer(){
        return new Promise((resolve) => {
            this._connection.on('offer-message', function(message){
                if(!this._isBlocked && (message.to === this._self || message.to === null)){
                    this._isBlocked = true;
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
    sendAnswer(sessionDescription){
        return new Promise((resolve) => {
            if(this._isBlocked){
                this._connection.emit('answer-message', SocketConnection._createMessage(sessionDescription));
                this._isBlocked = false;
                resolve();
            }
        });
    }

    /**
     * receive an answer of an offer you sent to a remote / called peer
     * @return Promise when the answer arives it is resolved
     * */
    receiveAnswer(){
        return new Promise((resolve) => {
            this._connection.on('answer-message', function(message){
                if(this._isBlocked && (message.to === this._self || message.to === null)){
                    this._isBlocked = false;
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
    sendMessage(data){
        return new Promise((resolve) => {
            this._connection.emit('user-message', SocketConnection._createMessage(data));
            resolve();
        })
    }

    /**
     * receive a message from a user with self specified content (Chat message, for example)
     * @return Promise when the data is received, it is resolved
     * */
    receiveMessage(){
        return new Promise((resolve) => {
            this._connection.on('user-message', function(message){
                resolve(message.data);
            });
        })
    }

    /**
     * send a datagram to the user indicating the start of a call
     * @return Promise when the call is sent
     * */
    sendCall(user){
        return new Promise((resolve) => {
            this._connection.emit('call-message', SocketConnection._createMessage(user));
        });
    }

    /**
     * receive a call datagramm and use its receiver and sender name / ID
     * @return Promise when the call message is received, it is resolved to an object with sender and receiver as key
     * */
    receiveCall(){
        return new Promise((resolve) => {
            this._connection.on('call-message', function(message){
                resolve({
                    receiver: message.data,
                    sender: message.from
                });
            })
        });
    }

}