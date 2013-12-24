var Server = (function(){

    var Server = extend( PacketHolder, function Server(name, locations, options) {
    
        PacketHolder.apply(this, arguments);

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);
        this.packetMode = Thing.asFunction(options.packetMode);
    
        this.initialDelay = options.initialDelay;
        this.messageSize = options.messageSize;
        this.packetNumberAfter = options.packetSequence;
    });

    Server.newEvent = 'Server';

    Server.prototype.accept = function(packet){
    
        if( packet.direction == 'upstream' ) {
            this.generateResponse(packet.gotAlreadyUpTo);
            packet.done();
        }
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

    Server.prototype.openMessagesToAdjacents = function(nextLocations, createPacket){

        var messages = this.createMessagesToAdjacentDestinations(nextLocations),
            timeToDispatch = this.events('packetReadyToDispatch'),

            newPacketForAllOutboundMessages = function(/* any arguments */){

                var basePacket = createPacket.apply(this, arguments);
                this.sendCopiesOfPacket(basePacket, messages, nextLocations);
                basePacket.done();

            }.bind(this),

            stopSending = function() {
                timeToDispatch.un(newPacketForAllOutboundMessages);
            };

        timeToDispatch.on( newPacketForAllOutboundMessages );

        this.events('messageEnd').on(stopSending);
        this.events('reset').on(stopSending);

        announceAll(messages);        
    };
    
    Server.prototype.openOutboundMessages = function(direction, createPacket){
    
        this.openMessagesToAdjacents(
            this.nextLocationsInDirection(direction),
            createPacket
        );
    };
    
    Server.prototype.responsePacketGenerator = function() {
    
        var firstPacketCreated = false;
    
        return function(curPacketNumber) {
            // unannounced packet to use as a template for others
            var ordering = {
                i:       curPacketNumber,
                isFirst: !firstPacketCreated,
                isLast:  curPacketNumber >= (this.messageSize -1)
            };
    
            var packet = new Packet(
                'response' + curPacketNumber
                ,   'JSON'
                ,   'downstream'
                ,   ordering
                ,   this.packetMode(curPacketNumber)
            ).inDemo(this.demo);
    
            firstPacketCreated = true;
    
            return packet;
        }
    };
    
    /**
     *  Start a new, original response originating from this server
     */ 
    Server.prototype.generateResponse = function(startingAt) {
    
        this.openOutboundMessages('downstream', this.responsePacketGenerator());
    
        function sendNext(previousPacketNumber){
    
            var curPacketNumber = this.packetNumberAfter(previousPacketNumber),
                lastPacket = curPacketNumber >= (this.messageSize - 1);
    
            this.events('packetReadyToDispatch').emit(curPacketNumber);
    
            if( lastPacket ) {
                this.events('messageEnd').emit();
                
            } else {
                
                var nextPacketNumber = this.packetNumberAfter(curPacketNumber);
                this.schedule(
                    sendNext.bind(this, curPacketNumber)
                    ,   this.timeBetweenPackets(nextPacketNumber)
                );
            }
        }
    
        this.schedule( sendNext.bind(this, startingAt -1), this.initialDelay );
    };

    return Server;
}());
