var Relay = extend(PacketHolder, function(name, locations, options){
    PacketHolder.apply(this, arguments);
});

Relay.prototype.accept = function(receivedPacket){

    var PROPAGATE_DELAY = 250;
    
    this.schedule( function(){
        this.propagate(receivedPacket);
    }, PROPAGATE_DELAY);
};
