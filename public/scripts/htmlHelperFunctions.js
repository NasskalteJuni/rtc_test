/**
 * Created by User on 18.06.2017.
 */

var htmlHelper = (function($){
    if(!$ || !$.fn || !$.fn.jquery) throw new Error("jquery not given, expected as parameter");

    // format date in dd.MM.yyyy
    var dateformat = function(date){
        var to2Digits = function(number){
            return number < 10 ? "0"+number : number;
        };
        if(typeof date === "string"){
            date = new Date(date);
        }
        var day = date.getDay(), month = date.getMonth() +1, year = date.getFullYear();
        return to2Digits(day)+"."+to2Digits(month)+"."+year;
    };

    var appendMessageOnList = function(list, text, user, time){
        var elem = $('' +
            '<li class="user-message card">' +
            '   <div class="text">'+text+'</div>' +
            '   <div class="time">'+dateformat(time)+'</div>' +
            '   <div class="user">'+user+'</div>' +
            '</li>');
        $(list).append(elem);
    };

    var setUsersOnList = function(list, usernames){
        $(list).html(usernames.map(function(user){ return '<li>'+user+'</li>'}));
    };

    var appendVideoOnList = function (list, user, local) {
        var cls = local ? 'local-video' : 'remote-video';
        $(list).append('' +
            '<li class="video-container">' +
            '   <video id="video-'+user+'" class="'+cls+'" autoplay></video>' +
            '</li>');
        return getVideoOfList(list, user);
    };

    var getVideoOfList = function(list, user){
        return $('#video-'+user);
    };

    var setStreamOfVideo = function(video, stream){
        $(video).get(0).srcObject = stream;
    };

    return {
        appendMessageOnList: appendMessageOnList,
        appendVideoOnList: appendVideoOnList,
        setUsersOnList: setUsersOnList,
        setStreamOfVideo: setStreamOfVideo,
        getVideoOfList: getVideoOfList
    }
})(jQuery);