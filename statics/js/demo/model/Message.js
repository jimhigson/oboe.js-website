var Message = extend(Thing, function Message() {
    Thing.apply(this, arguments);
});

Message.newEvent = 'Message';

Message.prototype.transmittedOver = function(packetHolder){
    this.holder = packetHolder;
    return this;
};

Message.prototype._withRequestStart = function(firstPacket){

    firstPacket.events('move').on(function(){

        this.events('requestStartMove').emit.apply(this, arguments);
    }.bind(this));
    return this; // chaining
};
Message.prototype._withResponseEnd = function(lastPacket){

    lastPacket.events('move').on(function(){

        this.events('responseEndMove').emit.apply(this, arguments);
    }.bind(this));

    lastPacket.events('done').on(function(){

        this.events('done').emit.apply(this, arguments);
    }.bind(this));    
    
    return this; // chaining
};
Message.prototype.includes = function(packet) {
    var ordering = packet.ordering;

    if( packet.direction == Direction.upstream && ordering.isFirst ) {
        this._withRequestStart(packet);
    }
    if( packet.direction == Direction.downstream && ordering.isLast ) {
        this._withResponseEnd(packet);
    }
    return this; // chaining
};
