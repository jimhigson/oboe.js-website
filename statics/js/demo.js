
function extend(Sup, Sub) {
    Sub.prototype = new Sup();
    Sub.super = Sup;
    return Sub;
}
function setter(fieldName) {
    return function(value){
        this[fieldName] = value;
        return this;
    }
}
function abstract(){
    throw new Error('don\'t call me, I\'m abstract');
}

function Packet(name, direction){
    this.direction = direction;
    this.name = name;
}

function PacketHolder(name){
    this.name = name;
    this.adjacents = {
        downstream: new EventSink(),
        upstream:   new EventSink()
    };
}
PacketHolder.prototype.acceptPacket = abstract;

PacketHolder.prototype.withUpstream = function(upstream){
    this.adjacents.upstream = upstream;
    upstream.adjacents.downstream = this;
    return this;
};
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

var Wire = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
});

var Server = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
});

var Client = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
});

Client.prototype.makeRequest = function(){
    this.propagate(new Packet('request', 'upstream'));
};


// setup the application
var server, wire, client;

server = new Server('webServer')
.withDownstream(
    wire = new Wire('internet')
    .withDownstream( 
        client = new Client('little_jimmy') 
    )
);