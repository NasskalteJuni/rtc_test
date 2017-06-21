/**
 * Created by User on 20.06.2017.
 */
(function(){
    var call = [null, null];
    var peerConnections = {};
    var socketConnection = io();
    var createMessage = function(message){
        return {'user': user, 'message': message, time: new Date(), room: roomId}
    };
    var getNotConnectedPeers = function(peerConnections, roomUsers){
        let connectedUsers = [];
        for(var connection in peerConnections){
            if(peerConnections.hasOwnProperty(connection)){
                connectedUsers.push(connection);
            }
        }
        return roomUsers.filter(roomUser => connectedUsers.indexOf(roomUser) === -1);
    };
    var negotiating;
    var calling = function(callee){
        // create a peer connection
        peerConnections[callee] = rtcHelperFunctions.createPeerConnection();
        var peerConnection = peerConnections[callee];

        // handle peer connection stuff
        peerConnection.onaddStream = function(event){
            var video = htmlHelper.appendVideoOnList(list,Math.random().toString(32).substring(2,8));
            htmlHelper.setStreamOfVideo(video, event.streams[0]);
        };

        // check if currently negotiating
        peerConnection.onsignalingstatechange = function(){
            negotiating = peerConnection.signalingState !== "stable";
        }

        peerConnection.onnegotiationneeded = function(){
            if(negotiating) return;
            // create an offer and send it to the peer
            rtcHelperFunctions.createLocalOffer(peerConnection)
                .then(function(sdp){
                    console.log('set local offer');
                    var sdpMessage = createMessage(sdp);
                    socketConnection.emit('sdp-message', sdpMessage);
                    console.log('send local offer to peer')
                }).catch(console.log);
        }

        peerConnection.onicecandidate = function(event){
            if(event.candidate === null){
                var candidateMessage = createMessage(event.candidate);
                socketConnection.emit('ice-message',candidateMessage);
            }
        };

        return peerConnection;
    };

    // handle Socket stuff (chatting, real time data transfer to the server...)
    socketConnection.on('connect', function(){
        var welcome = createMessage("the _user <%= _user %> entered the room <%= room.name %>");
        socketConnection.emit('enter-message', welcome);
    });

    socketConnection.on('error', function(event){
        console.log(event.data);
    });

    socketConnection.on('_user-message', function(data){
        htmlHelper.appendMessageOnList('#message-list', data.message, data._user, data.time);
    });

    socketConnection.on('enter-message', function(data){
        htmlHelper.appendMessageOnList('#message-list',data.message, data._user, data.time);
        htmlHelper.setUsersOnList('#_user-list', data.users);
    });

    socketConnection.on('leave-message', function(data){
        htmlHelper.appendMessageOnList('#message-list',data.message, data._user, data.time);
        htmlHelper.setUsersOnList('#_user-list', data.users);
    });

    socketConnection.on('sdp-message', function(data){
        if(data._user === user) return;
        if(data.message.type === "offer"){
            console.log('received remote offer');
            rtcHelperFunctions.getCameraStream().then(function(stream){
                var peerConnection = calling(data._user);
                peerConnection.addStream(stream);
                rtcHelperFunctions.handleRemoteOffer(peerConnection, data.message)
                    .then(function (sdp) {
                        console.log('created sdp answer',sdp);
                        var sdpMessage = createMessage(sdp);
                        socketConnection.emit('sdp-message', sdpMessage);
                        console.log('send answer to peer');
                    }).catch(console.log);
            });
        }else if(data.message.type === "answer"){
            var peerConnection = peerConnections[data._user];
            rtcHelperFunctions.handleRemoteAnswer(peerConnection, data.message)
                .then(function(){
                    console.log('set remote answer')
                }).catch(console.log)
        }

    });

    socketConnection.on('ice-message', function(data){
        if(data._user === user) return;
        peerConnections[data._user].addIceCandidate(new RTCIceCandidate(data.message))
            .then(function(){
                console.log('added candidate',data.message);
            }).catch(console.log);
    });

    // bind events on input elements
    $('#message-field').on('keypress', function(event){
        if(event.which === 13 && this.value && this.value.trim()){
            var userMessage = createMessage(this.value.trim());
            socketConnection.emit('_user-message', userMessage);
            this.value = "";
        }
    });


    // User initiates call
    $('#call-button').on('click', function(){
        call[0] = new Promise(function (resolve, reject) {
            $.get('/room/<%= room.id %>/others?token=<%= room.token %>&_user=<%= _user %>').done(resolve).fail(reject);
        });
        call[1] = rtcHelperFunctions.getCameraStream();

        // resolve when having media stream and users to call (this synchronizes the 2 promises)
        Promise.all(call).
        then(function(callResults){
            var users =  getNotConnectedPeers(peerConnections, callResults[0]);
            var localStream = callResults[1];
            users.forEach(function(user){
                var peerConnection = calling(user);
                peerConnection.addStream(localStream);
            });
        })
            .catch(console.log);
    });

    $(window).on('beforeunload', function(){
        var bye = createMessage("_user <%= _user %> has left the room <%= room.name %>");
        socketConnection.emit('leave-message', bye);
    })

})();