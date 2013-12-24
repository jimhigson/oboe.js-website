var PacketHolder = (function(){
    "use strict";

    var Super = Thing;
    
    var PacketHolder = extend(Super, function PacketHolder(name, locations){
    
        if( !locations ) {
            throw new Error("don't know where " + name + " is");
        }
    
        Super.apply(this, arguments);
        
        if( !locations ) {
            throw new Error("don't know where " + name + " is");
        }
    
        this.latency = 0;
        this.adjacents = {
            downstream: []
        ,   upstream:   []
        };
    });
    
    PacketHolder.newEvent = 'PacketHolder';
    
    PacketHolder.prototype.accept = abstract;
    
    PacketHolder.prototype.withDownstream = function(downstreamLocation){
    
        this.adjacents.downstream.push(downstreamLocation);
        this.listenToAdjacentForPackets(downstreamLocation, 'downstream');
        downstreamLocation._withUpstream(this);
    
        return this;
    };
    
    PacketHolder.prototype._withUpstream = function(upstreamLocation){
        this.adjacents.upstream.push(upstreamLocation);
        this.listenToAdjacentForPackets(upstreamLocation, 'upstream');        
    };
    
    PacketHolder.prototype.nextLocationsInDirection = function(direction){
        return this.adjacents[direction];
    };
    
    PacketHolder.prototype.createCopiesForDestinations = function(packetSource, destinations) {
    
        return destinations.map( function() {
    
            return packetSource.copy();
        });
    };
    
    PacketHolder.prototype.listenToAdjacentForPackets = function(adjacent, direction) {
        var eventName = oppositeDirectionTo(direction) + 'Packet';
        
        adjacent.events(eventName).on( function( incomingPacket ){
            
            var packetCopy = incomingPacket.copy();
            packetCopy.announce();
            this.accept(packetCopy);
        }.bind(this));
    };

    PacketHolder.prototype.propagate = function(basePacket){
    
        this.events(basePacket.direction + 'Packet').emit(basePacket);
        basePacket.done();
    };
    
    PacketHolder.prototype.movePacket = function(packet){
        var fromLocation = oppositeDirectionTo(packet.direction),
            toLocation = packet.direction,
            fromXY = this.locations[fromLocation],
            toXY   = this.locations[toLocation];
    
        packet.move(fromXY, toXY, this.latency);
    };
    
    return PacketHolder;
}());
