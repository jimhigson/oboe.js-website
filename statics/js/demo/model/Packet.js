var Packet = extend(Thing, function (name, type, direction, ordering, mode){
    Thing.apply(this, arguments);

    this.direction = direction;
    this.ordering = ordering;
    this.type = type;
    this.mode = mode;
});
Packet.prototype.copy = function(additionalName) {

    var orderingCopy = {
        i: this.ordering.i,
        isFirst: this.ordering.isFirst,
        isLast: this.ordering.isLast
    };

    var copyName =  ( additionalName !== undefined )
        ?   this.name + '-' + additionalName
        :   this.name;

    return new Packet(
        copyName,
        this.type,
        this.direction,
        orderingCopy,
        this.mode
    ).inDemo(this.demo);
};
Packet.new = singleEventPubSub('new');
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
