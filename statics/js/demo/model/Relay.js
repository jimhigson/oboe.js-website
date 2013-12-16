var Relay = extend(PacketHolder, function(name, locations, options){
    PacketHolder.apply(this, arguments);

    this.timeBetweenPackets = options.timeBetweenPackets;
    this.initBuffers();
    
    this.events('reset').on(function(){
        this.initBuffers();
    }.bind(this));
    
});

Relay.prototype.initBuffers = function(){
    this.buffers = {
        upstream:[]
        ,   downstream:[]
    };
};

Relay.prototype.accept = function(receivedPacket){

    var direction = receivedPacket.direction,
        buffer = this.buffers[direction];
    
    buffer.push(receivedPacket);
    
    if( receivedPacket.ordering.isFirst ) {
        this.slot(direction, 0);
    }
};

Relay.prototype.slot = function(direction, i) {
    
    var buffer = this.buffers[direction],
        frontOfQueuePacket = buffer.shift();
        
    if( frontOfQueuePacket ) {
        this.propagate(frontOfQueuePacket);
    }

    if( !(frontOfQueuePacket && frontOfQueuePacket.ordering.isLast) ) {
        var nextSlotIn = this.timeBetweenPackets(i);    
        
        this.schedule( 
            function(){
                this.slot(direction, i+1);
            },
            nextSlotIn
        );
    }
};
