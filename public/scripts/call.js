/**
 * Created by User on 20.06.2017.
 */
(function(user, server, $){
    var users = [];
    var conversations = {};

    if(!$.fn.jquery) throw new Error('jQuery required but not found');
    if(!user) throw new Error('no user defined1');

    Conversation.receiveEnter(user, server).then(function(msg) {
        console.log(msg.from+' entered the room');
        users = msg.users;
        htmlHelper.appendMessageOnList('#user-message', msg.data, msg.from, msg.time);
        htmlHelper.setUsersOnList('#user-list',users);
        if(!conversations[msg.from]){
            conversations[msg.from] = new Conversation(user, msg.from);
            conversations[msg.from].onCalled = onCall;
        }
    });

    Conversation.receiveLeave(user, server).then(function(msg){
        console.log(msg.from+' left the room');
        users = msg.users;
        htmlHelper.appendMessageOnList('#user-message', msg.data, msg.from, msg.time);
        htmlHelper.setUsersOnList('#user-list',);
    });

    Conversation.receiveBroadcast(user, server).then(function(msg){
        console.log(msg.from+' broadcasted '+msg.data);
        htmlHelper.appendMessageOnList('#user-message', msg.data, msg.from, msg.time)
    });

    $('#message-field').on('keyup', function(e){
        if(e.which === 13){
            if(this.value.trim().length > 0){
                console.log(user+' sent '+this.value);
                Conversation.sendBroadcast(user, server, this.value);
                this.value = "";
            }
        }
    });

    $(window).on('unload', function () {
        Conversation.sendLeave(user, server, 'Nutzer '+user+' hat den Raum verlassen');
    });

    $('#call-button').on('click', function(){
        for(var con in conversations){
            if(conversations.hasOwnProperty(con)){
                conversations[con].start();
            }
        }
    });

    function onCall(pc, sc){
        console.log(pc, sc);
    }

    console.log(user, server);
    Conversation.sendEnter(user, server, 'Nutzer '+user+' ist dem Chat beigetreten');
    users.forEach(function(callee){
        conversations[callee] = new Conversation(user, callee);
    });

})(user, socketServerUrl, jQuery);