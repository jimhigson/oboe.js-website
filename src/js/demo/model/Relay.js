var Relay = (function(){

    var Relay = extend(PacketHolder, function Relay(name, locations, options){
        PacketHolder.apply(this, arguments);
    });
    
    Relay.newEvent = 'Relay';
        
    Relay.prototype.accept = function(receivedPacket){
        this.addToScript('accepted', receivedPacket);
        this.propagate(receivedPacket);
    };
    
    return Relay;
}());
