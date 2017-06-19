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
                facingMode: "user",
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
        return new Promise(function (resolve, reject) {
            peerConnection.createOffer()
                .then(function(offer){
                    peerConnection.setLocalDescription(offer);
                    resolve(offer)
                })
                .catch(reject);
        });
    };

    var handleRemoteOffer = function(peerConnection, offer){
        return new Promise(function(resolve, reject){
            peerConnection.setRemoteDescription(offer)
                .then(function () {
                    peerConnection.createAnswer()
                        .then(function (answer) {
                            peerConnection.setLocalDescription(answer);
                            resolve(answer);
                        })
                        .catch(reject);
                }).catch(reject);
        });
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