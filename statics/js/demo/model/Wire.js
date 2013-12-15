var Wire = extend( PacketHolder, function(name, locations, options) {

    PacketHolder.apply(this, arguments);
    this.latency = options.latency;
    this.bandwidth = options.bandwidth;
    this.medium = options.medium;
});
Wire.prototype.accept = function(packet){

    packet.isOn(this);
    this.movePacket(packet);

    this.propagateAfterLatency(packet);
};
Wire.prototype.propagateAfterLatency = function(packet){

    this.schedule(function(){

        this.propagate(packet);

    }.bind(this), this.latency);
};