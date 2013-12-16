var Relay = extend(PacketHolder, function(name, locations, options){
    PacketHolder.apply(this, arguments);
});

Relay.prototype.accept = function(receivedPacket){

    this.schedule( function(){
        this.propagate(receivedPacket);
    }, 500);
};
