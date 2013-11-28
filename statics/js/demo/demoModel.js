
function extend(Sup, Sub) {
    Sub.prototype = new Sup();
    Sub.super = Sup;
    return Sub;
}
function abstract(){
    throw new Error('don\'t call me, I\'m abstract');
}

function oppositeDirectionTo(dir) {
    switch(dir){
        case 'upstream':
            return 'downstream';
        case 'downstream':
            return 'upstream';
    }
}

function Packet(name, direction){
    this.direction = direction;
    this.name = name;
    this.events = pubSub();
    Packet.new.emit(this);    
}
Packet.new = singleEventPubSub('new');

Packet.prototype.done = function(){
    this.events('done').emit();
};

function PacketHolder(name){
    this.name = name;
    this.latency = 0;    
    this.adjacents = {
        downstream: new EventSink('downstream void')
    ,   upstream:   new EventSink('upstream void')
    };
}
PacketHolder.prototype.accept = abstract;

PacketHolder.prototype.withDownstream = function(downstream){
    
    this.adjacents.downstream = downstream;
    downstream.adjacents.upstream = this;
    this.packetMove = singleEventPubSub('packetMove');
        
    return this;    
};
PacketHolder.prototype.propagate = function(packet){
    this.adjacents[packet.direction].accept(packet);
};
PacketHolder.prototype.movePacket = function(packet, fromLocation, toLocation){
    this.packetMove.emit(packet, fromLocation, toLocation);    
};

function EventSink (name) {
    this.name = name;
}


var Wire = extend( PacketHolder, function(name) {
    
    PacketHolder.apply(this, arguments);
    this.latency = 1500;
});
Wire.prototype.accept = function(packet){
    var self = this;
    
    console.log(this.name, 'got', packet);
    
    this.movePacket(packet, oppositeDirectionTo(packet.direction), packet.direction);

    window.setTimeout(function(){
        self.propagate(packet);
    }, this.latency);
};

var Server = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
    this.timeBetweenPackets = 100;
});
Server.prototype.accept = function(packet){
    console.log(this.name, 'got', packet);
    if( packet.name == 'request' ) {
        this.sendResponse();
        packet.done();
    }
};
Server.prototype.sendResponse = function() {
    var times = 0,
        interval = window.setInterval(function(){
                this.propagate(new Packet('response' + times, 'downstream'));
                times++;
                if( times == 7 ) {
                    window.clearInterval(interval);
                }        
            }.bind(this), this.timeBetweenPackets);
};

var Client = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
});

Client.prototype.makeRequest = function(){
    this.propagate(new Packet('request', 'upstream'));
};
Client.prototype.accept = function(packet){
    console.log(this.name, 'got', packet);
    packet.done();    
};

