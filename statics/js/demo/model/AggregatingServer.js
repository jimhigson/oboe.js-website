var AggregatingServer = (function(){

    var Super = PacketHolder;
    
    var AggregatingServer = extend(Super, function AggregatingServer(name, locations, options){
        Super.apply(this, arguments);
      
        this.parseStrategyName = options.parseStrategy;
    });
    AggregatingServer.newEvent = 'AggregatingServer';
    
    AggregatingServer.prototype.accept = function(receivedPacket, sender){
        
        if( receivedPacket.direction == 'upstream' ) {
    
            this.propagate(receivedPacket);
    
            this.setupResponse();
        } else {
    
            this.parsers[sender.name].read(receivedPacket);
        }
    };
    
    AggregatingServer.prototype.setupResponse = function(){
        
        this.parsers = this.createInputParsersForEachUpstreamNode(this.parseStrategyName);
    
        this.throttledOutput = throttle( 
            functor(500), 
            this.propagate.bind(this),
            this
        );
        
        multiplex(
            this.parseStrategyName,
            this.parsers,
            this.throttledOutput.read
        );
    };
    
    AggregatingServer.prototype.createInputParsersForEachUpstreamNode = function(parseStrategyName){
        var parsers = {},
            nextLocations = this.nextLocationsInDirection('upstream'),
            emitPacketParsed = this.events('packetParsed').emit;
        
        nextLocations.forEach(function(loc){
            parsers[loc.name] = Parser(parseStrategyName, emitPacketParsed); 
        });
         
        return parsers;
    };
    
    return AggregatingServer;
}());
