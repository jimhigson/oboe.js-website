var Server = (function(){

    var Super = PacketHolder;
    
    var Server = extend( Super, function Server(name, locations, options) {

        Super.apply(this, arguments);
    });

    Server.newEvent = 'Server';

    Server.prototype.createMessagesToAdjacentDestinations = function(destinations) {
        return destinations.map(function(){
            return new Message().inDemo(this.demo).sentBy(this);
        }.bind(this));
    };

    Server.prototype.openMessagesToAdjacents = function(adjacentLocations){

        var messages = this.createMessagesToAdjacentDestinations(adjacentLocations),
            packetReadyToDispatchEvent = this.events('packetReadyToDispatch'),

            newPacketForAllOutboundMessages = function(basePacket){

                this.propagate(basePacket);

            }.bind(this),

            stopSending = function() {
                packetReadyToDispatchEvent.un(newPacketForAllOutboundMessages);
            };

        packetReadyToDispatchEvent.on( newPacketForAllOutboundMessages );

        this.events('allPacketsDispatched').on(stopSending);
        this.events('reset').on(stopSending);

        announceAll(messages);        
    };

    return Server;
}());
