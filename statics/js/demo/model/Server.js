var Server = (function(){

    var Server = extend( PacketHolder, function Server(name, locations, options) {
    
        PacketHolder.apply(this, arguments);

        this.timeBetweenPackets = asFunction(options.timeBetweenPackets);
        this.packetMode = asFunction( options.packetMode, 'live' );
    
        this.initialDelay = options.initialDelay;
        this.messageSize = options.messageSize;
        this.packetNumberAfter = options.packetSequence || function(previousPacketNumber){
            return      (previousPacketNumber === -1)
                ?   0
                :   previousPacketNumber+1;
        };
    });
    
    function asFunction(givenValue, defaultValue) {
        
        if (typeof givenValue == 'function') {
            return givenValue;
        }
        
        var constantValue = ( givenValue !== undefined )? givenValue : defaultValue;
        
        return function(){return constantValue};
    }
    
    Server.prototype.accept = function(packet){
    
        if( packet.direction == 'upstream' ) {
            this.sendResponse(packet.gotAlreadyUpTo);
            packet.done();
        }
    };
    Server.prototype.createMessagesOut = function(direction) {
        var destinations = this.nextLocationsInDirection(direction);
    
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
    
    Server.prototype.openOutboundMessages = function(direction, createPacket){
    
        var nextLocations = this.nextLocationsInDirection(direction),
            messages = this.createMessagesOut(direction),
            packetReadyToDispatch = this.events('packetReadyToDispatch'),
    
            newPacketForAllOutboundMessages = function(/* any arguments */){
    
                var basePacket = createPacket.apply(this, arguments);
                this.sendCopiesOfPacket(basePacket, messages, nextLocations);
                basePacket.done();
        
            }.bind(this),
            
            stopSending = function() {
                packetReadyToDispatch.un(newPacketForAllOutboundMessages);
            };
    
        packetReadyToDispatch.on( newPacketForAllOutboundMessages );

        this.events('messageEnd').on(stopSending);
        this.events('reset').on(stopSending);
    
        announceAll(messages);
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
    
    Server.prototype.sendResponse = function(startingAt) {
    
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
