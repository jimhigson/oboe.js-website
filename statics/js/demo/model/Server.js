var Server = (function(){
    "use strict";
    
    var Super = PacketHolder;
    
    var Server = extend( Super, function Server(name, locations, options) {

        Super.apply(this, arguments);
    });

    Server.newEvent = 'Server';

    Server.prototype.openMessagesToAdjacents = function(adjacentLocations){

        var packetReadyToDispatchEvent = this.events('packetReadyToDispatch'),

            newPacketForAllOutboundMessages = function(basePacket){

                this.propagate(basePacket);

            }.bind(this),

            stopSending = function() {
                packetReadyToDispatchEvent.un(newPacketForAllOutboundMessages);
            };

        packetReadyToDispatchEvent.on( newPacketForAllOutboundMessages );

        this.events('allPacketsDispatched').on(stopSending);
        this.events('reset').on(stopSending);
    };

    return Server;
}());
