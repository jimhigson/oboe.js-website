var AggregatingServer = extend(Server, function AggregatingServer(name, locations, options){
    Server.apply(this, arguments);
  
    this.parseStrategyName = options.parseStrategy;
});

AggregatingServer.prototype.accept = function(receivedPacket, sender){
    
    if( receivedPacket.direction == 'upstream' ) {

        this.propagate(receivedPacket);
        this.openOutboundMessages('downstream', this.responsePacketGenerator());

        this.parsers = this.createInputParsersForEachUpstreamNode(this.parseStrategyName);

        multiplex(parsers, this.events('packetReadyToDispatch').emit);
        
    } else {

        this.parsers[sender.name].read(receivedPacket);
    }
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


AggregatingServer.prototype.responsePacketGenerator = function(){

    var numberOfResponsesExpected = this.nextLocationsInDirection('upstream').length,
        numberOfResponsesCompleted = 0,
        responsesStarted = false;

    /* Takes packets. Returns packets which are very similar but have had the ordering
       changed, so that their isFirst/isLast is set to be correct post-aggregation
       (only one first, only one last, even if read from multiple streams where each 
       stream yielded a first and last packet)
     */
    return function(incomingPacket){

        var outgoing = incomingPacket.copy();
        incomingPacket.done();

        if( incomingPacket.ordering.isLast ) {
            numberOfResponsesCompleted++;
        }

        outgoing.ordering.isFirst = !responsesStarted;
        outgoing.ordering.isLast  = ( numberOfResponsesCompleted == numberOfResponsesExpected );

        responsesStarted = true;

        return outgoing;
    }
};
