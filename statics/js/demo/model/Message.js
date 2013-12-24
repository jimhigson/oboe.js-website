var Message = extend(Thing, function Message() {
    Thing.apply(this, arguments);
});

Message.newEvent = 'Message';

Message.prototype.withFirst = function(firstPacket){

    firstPacket.events('move').on(function(){

        this.events('startMove').emit.apply(this, arguments);
    }.bind(this));
    return this; // chaining
};
Message.prototype.withLast = function(lastPacket){

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
        this.withFirst(packet);
    }
    if( ordering.isLast ) {
        this.withLast(packet);
    }
    return this; // chaining
};
