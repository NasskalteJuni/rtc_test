/**
 * Created by NasskalteJuni on 18.06.2017.
 */

var rtcHelperFunctions = (function(){
    var createPeerConnection = function(){
        return new RTCPeerConnection({
            'iceServers': [
                {'url': 'stun:stun.1.google.com:19302'},
                {'url': 'stun:stun1.1.google.com:19302'}
            ]
        },{
            'optional': [
                {'DtlsSrtpKeyAgreement': true},
                {'RtpDataChannels': true}
            ]
        });
    };

    var getCameraStream = function(){
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                facingMode: "_user",
                width: {
                    ideal: 640
                },
                height: {
                    ideal: 480
                }
            }
        })
    };

    var createLocalOffer = function(peerConnection){
        return peerConnection.createOffer()
                .then(peerConnection.setLocalDescription)
                .catch(console.log);
    };

    var handleRemoteOffer = function(peerConnection, offer){
        return peerConnection.setRemoteDescription(offer)
                .then(function () {
                    return peerConnection.createAnswer()
                        .then(peerConnection.setLocalDescription)
                        .catch(console.log);
                }).catch(console.log);
    };

    var handleRemoteAnswer = function(peerConnection, answer){
        return peerConnection.setRemoteDescription(answer);
    };

    return {
        createPeerConnection: createPeerConnection,
        getCameraStream: getCameraStream,
        handleRemoteOffer: handleRemoteOffer,
        handleRemoteAnswer: handleRemoteAnswer,
        createLocalOffer: createLocalOffer
    };
})();