var Server = (function(){
    "use strict";
    
    var Super = PacketHolder;
    
    var Server = extend( Super, function Server(name, locations, options) {

        Super.apply(this, arguments);
    });

    Server.newEvent = 'Server';

    return Server;
}());
