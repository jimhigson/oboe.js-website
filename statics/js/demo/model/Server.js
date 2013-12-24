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

    Server.prototype.sendCopiesOfPacket = function(basePacket, messages, nextLocations){
    
        var packetCopies = this.createCopiesForDestinations( basePacket, nextLocations );
    
        messages.forEach(function( message, i ){
            message.includes(packetCopies[i]);
        });
    
        announceAll(packetCopies);
    
        this.sendPacketsToDestinations(packetCopies, nextLocations);
    };

    Server.prototype.openMessagesToAdjacents = function(adjacentLocations){

        var messages = this.createMessagesToAdjacentDestinations(adjacentLocations),
            packetReadyToDispatchEvent = this.events('packetReadyToDispatch'),

            newPacketForAllOutboundMessages = function(basePacket){

                this.sendCopiesOfPacket(basePacket, messages, adjacentLocations);
                basePacket.done();

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
