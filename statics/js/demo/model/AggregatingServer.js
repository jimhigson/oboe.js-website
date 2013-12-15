var AggregatingServer = extend(Server, function(name, locations, options){
    Server.apply(this, arguments);
});

AggregatingServer.prototype.accept = function(receivedPacket){

    if( receivedPacket.direction == 'upstream' ) {

        this.propagate(receivedPacket);
        this.openOutboundMessages('downstream', this.responsePacketGenerator());
    } else {

        this.events('timeForNextPacket').emit(receivedPacket);
    }
};

AggregatingServer.prototype.responsePacketGenerator = function(){

    var numberOfResponsesExpected = this.nextLocationsInDirection('upstream').length,
        numberOfResponsesCompleted = 0,
        responsesStarted = false;

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