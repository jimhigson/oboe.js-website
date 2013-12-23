var Wire = (function(){

    var Wire = extend( PacketHolder, function Wire(name, locations, options) {
    
        PacketHolder.apply(this, arguments);
        this.latency = options.latency;
        this.bandwidth = options.bandwidth;
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
    
        this.events('deliveryStarted').emit(packet);
        this.movePacket(packet);
    
        if( !this.blockage )
            this.propagateAfterLatency(packet);
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
