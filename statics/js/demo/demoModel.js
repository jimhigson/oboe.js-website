
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
Packet.prototype.move = function(location, duration){
    this.events('move').emit(location, duration);
};
Packet.prototype.done = function(location, duration){
    this.events('done').emit();
};

function PacketHolder(name){
    this.name = name;
    this.adjacents = {
        downstream: new EventSink('downstream void')
    ,   upstream:   new EventSink('upstream void')
    };
}
PacketHolder.prototype.accept = abstract;

PacketHolder.prototype.withDownstream = function(downstream){
    this.adjacents.downstream = downstream;
    downstream.adjacents.upstream = this;
    return this;    
};
PacketHolder.prototype.propagate = function(packet){
    this.adjacents[packet.direction].accept(packet);
};

function EventSink (name) {
    this.name = name;
}


var Wire = extend( PacketHolder, function(name, upstreamEndLocation, downstreamEndLocation) {
    this.locations = {
        downstream: downstreamEndLocation
    ,   upstream:   upstreamEndLocation
    };
    
    PacketHolder.apply(this, arguments);
    this.latency = 1500;
});
Wire.prototype.accept = function(packet){
    console.log(this.name, 'got', packet);
    window.setTimeout(this.propagate.bind(this, packet), this.latency);
    
    packet.move( this.locations[ oppositeDirectionTo(packet.direction) ], this.latency );
};

var Server = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
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
            }.bind(this), 1000);
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

