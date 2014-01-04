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
Message.prototype._withResponseClose = function(lastPacket){

    lastPacket.events('move').on(function(){

        this.events('responseCloseMove').emit.apply(this, arguments);
    }.bind(this));

    lastPacket.events('done').on(function(){

        this.events('done').emit.apply(this, arguments);
    }.bind(this));    
    
    return this; // chaining
};
Message.prototype.includes = function(packet) {

    if( packet.startsRequest() ) {
        this._withRequestStart(packet);
    }
    if( packet.closesResponse() ) {
        this._withResponseClose(packet);
    }
    return this; // chaining
};
