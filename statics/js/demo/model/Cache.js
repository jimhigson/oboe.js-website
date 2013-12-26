var Cache = (function(){

    var Super = PacketHolder;
    
    var Cache = extend(PacketHolder, function Relay(name, locations, options){
        Super.apply(this, arguments);

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);        
        
        this.cacheContents = [];
        this.requestors = [];
        this.onGoingRequest = false;
        
        this.events('reset').on(function(){
            this.cacheContents = [];
            this.requestors = [];
            this.onGoingRequest = false;
        }.bind(this));
    });

    Cache.prototype.acceptFromDownstream = function( packetFromDownstream, source ){

        if( this.cacheContents.length ) {
            
            var t = throttle(this.timeBetweenPackets, function( cachedPacket ){
                this.propagate(cachedPacket, [source]);
            }, this );
            
            this.cacheContents.forEach(t.read);
        }
        
        if( !this.onGoingRequest ) {

            this.requestors.push(source);
            
            this.propagate(packetFromDownstream);

            this.onGoingRequest = true;
        }
    };

    Cache.prototype.acceptFromUpstream = function( packetFromUpstream ){

        this.cacheContents.push(packetFromUpstream.replayedCopy());
        
        this.propagate(packetFromUpstream, this.requestors);
    };
        
    Cache.newEvent = 'Cache';

    return Cache;
}());
