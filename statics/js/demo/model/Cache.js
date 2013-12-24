var Cache = (function(){

    var Super = PacketHolder;
    
    var Cache = extend(PacketHolder, function Relay(name, locations, options){
        Super.apply(this, arguments);
    });
    
    Cache.prototype.accept = function(packet) {
        this.propagate(packet);
    };
    
    Cache.newEvent = 'Cache';

    return Cache;
}());
