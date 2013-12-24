var Server = (function(){

    var Super = PacketHolder;
    
    var Server = extend( Super, function Server(name, locations, options) {

        Super.apply(this, arguments);

        this.responseGenerator = new ResponseGenerator(options);
        
        this.responseGenerator.events('packetGenerated').on(
            this.events('packetReadyToDispatch').emit
        );
    });

    Server.newEvent = 'Server';

    Server.prototype.accept = function(packet){
    
        if( packet.direction == 'upstream' ) {
            this.generateResponse(packet.gotAlreadyUpTo);
            packet.done();
        }
    };

    Server.prototype.inDemo = function(demo){
        Super.prototype.inDemo.apply(this, arguments);
        this.responseGenerator.inDemo(demo);
        return this;
    };

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

    Server.prototype.openMessagesToAdjacents = function(nextLocations){

        var messages = this.createMessagesToAdjacentDestinations(nextLocations),
            readyToDispatch = this.events('packetReadyToDispatch'),

            newPacketForAllOutboundMessages = function(basePacket){

                this.sendCopiesOfPacket(basePacket, messages, nextLocations);
                basePacket.done();

            }.bind(this),

            stopSending = function() {
                readyToDispatch.un(newPacketForAllOutboundMessages);
            };

        readyToDispatch.on( newPacketForAllOutboundMessages );

        this.responseGenerator.events('messageEnd').on(stopSending);
        this.events('reset').on(stopSending);

        announceAll(messages);        
    };
    
    Server.prototype.openOutboundMessages = function(direction){
    
        this.openMessagesToAdjacents(
            this.nextLocationsInDirection(direction)
        );
    };
        
    /**
     *  Start a new, original response originating from this server
     */ 
    Server.prototype.generateResponse = function(startingAt) {
        this.openOutboundMessages('downstream');
        
        this.responseGenerator.generateResponse(startingAt);
    };

    return Server;
}());
