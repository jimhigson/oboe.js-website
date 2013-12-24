var Message = extend(Thing, function Message() {
    Thing.apply(this, arguments);
});

Message.newEvent = 'Message';

Message.prototype._withFirst = function(firstPacket){

    firstPacket.events('move').on(function(){

        this.events('startMove').emit.apply(this, arguments);
    }.bind(this));
    return this; // chaining
};
Message.prototype._withLast = function(lastPacket){

    lastPacket.events('move').on(function(){

        this.events('endMove').emit.apply(this, arguments);
    }.bind(this));

    lastPacket.events('done').on(function(){

        this.events('done').emit.apply(this, arguments);
    }.bind(this));    
    
    return this; // chaining
};
Message.prototype.includes = function(packet) {
    var ordering = packet.ordering;

    if( ordering.isFirst ) {
        this._withFirst(packet);
    }
    if( ordering.isLast ) {
        this._withLast(packet);
    }
    return this; // chaining
};
