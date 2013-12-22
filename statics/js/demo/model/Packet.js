var Packet = extend(Thing, function Packet(name, type, direction, ordering, mode){
    Thing.apply(this, arguments);

    this.direction = direction;
    this.ordering = ordering;
    this.type = type;
    this.mode = mode;
    this.gotAlreadyUpTo = 0;
});

Packet.newEvent = 'Packet';

Packet.prototype.copy = function(additionalName) {

    var orderingCopy = {
        i: this.ordering.i,
        isFirst: this.ordering.isFirst,
        isLast: this.ordering.isLast
    };

    return new Packet(
        this.name,
        this.type,
        this.direction,
        orderingCopy,
        this.mode
    )   
        .inDemo(this.demo)
        .startingAt(this.gotAlreadyUpTo);
};
Packet.prototype.startingAt = function( firstPacketNumber ) {
    this.gotAlreadyUpTo = firstPacketNumber;
    return this; // chaining
};
Packet.prototype.move = function(fromXY, toXY, latency){
    this.events('move').emit(fromXY, toXY, latency);
};
Packet.prototype.isOn = function(holder){
    this.events('isOn').emit(holder);
};
Packet.prototype.reset =
    Packet.prototype.done = function(){
        this.events('done').emit();
    };
