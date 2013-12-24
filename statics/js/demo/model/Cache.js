var Cache = (function(){

    var Cache = extend(PacketHolder, function Relay(name, locations, options){
        PacketHolder.apply(this, arguments);
    });
    
    Cache.prototype.accept = function(packet) {
        this.propagate(packet);
    };
    
    Cache.newEvent = 'Cache';

    return Cache;
}());
