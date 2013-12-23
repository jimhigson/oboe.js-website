
var PacketHolder = extend(Thing, function PacketHolder(name, locations){

    if( !locations ) {
        throw new Error("don't know where " + name + " is");
    }

    Thing.apply(this, arguments);
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
    downstreamLocation._withUpstream(this);

    return this;
};

PacketHolder.prototype._withUpstream = function(upstreamLocation){
    this.adjacents.upstream.push(upstreamLocation);
};

PacketHolder.prototype.nextLocationsInDirection = function(direction){
    return this.adjacents[direction];
};

PacketHolder.prototype.createCopiesForDestinations = function(packetSource, destinations) {

    return destinations.map( function(place, i) {

        return packetSource.copy(i);
    });
};
PacketHolder.prototype.sendPacketsToDestinations = function(packets, destinations){
    destinations.forEach(function( destination, i){
        destination.accept( packets[i], this );
    }.bind(this))
};

PacketHolder.prototype.propagate = function(basePacket){

    var nextPacketHolders = this.nextLocationsInDirection(basePacket.direction),
        packetCopies = this.createCopiesForDestinations( basePacket, nextPacketHolders );

    announceAll(packetCopies);

    this.sendPacketsToDestinations(packetCopies, nextPacketHolders);

    basePacket.done();

    return packetCopies;
};
PacketHolder.prototype.movePacket = function(packet){
    var fromLocation = oppositeDirectionTo(packet.direction),
        toLocation = packet.direction,
        fromXY = this.locations[fromLocation];
    toXY   = this.locations[toLocation];

    packet.move(fromXY, toXY, this.latency);
};
