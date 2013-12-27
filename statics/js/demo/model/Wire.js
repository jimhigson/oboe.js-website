var Wire = (function(){

    var Super = PacketHolder;
    
    var Wire = extend( Super, function Wire(name, locations, options) {
    
        Super.apply(this, arguments);
        this.latency = options.latency;
        this.bandwidth = Thing.asFunction(options.bandwidth);
        this.medium = options.medium;
        
        if( !options.medium ) {
            throw new Error('no medium for wire ' + name);
        }
        
        this.events('reset').on(function(){
            this.blockage = undefined;
        }.bind(this));
    });
    
    Wire.newEvent = 'Wire';
    
    Wire.prototype.accept = function(packet){
    
        packet.isOn(this);
        
        if( packet.ordering.isFirst ) {
            this.message = new Message()
                            .inDemo(this.demo)
                            .transmittedOver(this)
                            .announce();
        }
        
        this.message.includes(packet);
        
        if( packet.ordering.isLast ) {
            // end of that message, don't prevent Message
            // from being GC'd anymore:
            this.message = null;
        }
    
        this.events('deliveryStarted').emit(packet);
        this.movePacket(packet);
    
        if( !this.blockage )
            this.propagateAfterLatency(packet);
    };
    
    Wire.prototype.inputThrottle = function(handler){
        var t = throttle( this.bandwidth, handler, this);
        
        this.events('reset').on(t.reset);
        
        return t.read;
    };

    Wire.prototype.withDownstream = function(downstreamLocation){
        Super.prototype.withDownstream.call(this, downstreamLocation);
        
        var downstreamLocations = downstreamLocation.locations;
        this.locations.downstream = downstreamLocations.upstream || downstreamLocations.where; 

        return this; // chaining
    };

    Wire.prototype._withUpstream = function(upstreamLocation){
        Super.prototype._withUpstream.call(this, upstreamLocation);

        var upstreamLocations = upstreamLocation.locations;
        this.locations.upstream = upstreamLocations.downstream || upstreamLocations.where;


        return this; // chaining
    };
    
    Wire.prototype.with = {
        'blockedBy':function( barrier ){
            
            barrier.events('activated').on(function(){
                
                this.blockage = barrier;            
            }.bind(this));
    
            barrier.events('deactivated').on(function(){
    
                this.blockage = null;
            }.bind(this));        
        }
    };
    Wire.prototype.propagateAfterLatency = function(packet){
    
        this.schedule(function(){
    
            if( !this.blockage ) {
                this.propagate(packet);
                this.events('delivered').emit(packet);
            }
    
        }.bind(this), this.latency);
    };
    
    return Wire;    
    
}());
