var Cache = (function(){

    var Super = PacketHolder;
    
    var Cache = extend(PacketHolder, function Relay(name, locations, options){
        Super.apply(this, arguments);

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);        
        
        this.cacheContents = [];
        this.requestors = [];
        this.upstreamRequestOngoing = false;
        
        this.events('reset').on(function(){
            this.cacheContents = [];
            this.requestors = [];
            this.upstreamRequestOngoing = false;
        }.bind(this));
    });

    Cache.prototype.acceptFromDownstream = function( packetFromDownstream, source ){
        // got request from client heading to server
        this.addToScript('requestOff', source); 
       
        this.requestors.push(source);
        
        this.cacheContents.forEach(function( cachedPacket ){
            this.propagate(cachedPacket, [source]);
        }.bind(this));
        
        if( !this.upstreamRequestOngoing ) {
            
            this.propagate(packetFromDownstream);

            this.upstreamRequestOngoing = true;
        }
    };

    Cache.prototype.acceptFromUpstream = function( packetFromUpstream ){
        // got response from server heading to client

        this.cacheContents.push(packetFromUpstream.replayedCopy());
        
        this.propagate(packetFromUpstream, this.requestors);
    };
        
    Cache.newEvent = 'Cache';

    return Cache;
}());
