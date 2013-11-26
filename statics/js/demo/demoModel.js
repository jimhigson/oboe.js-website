
function extend(Sup, Sub) {
    Sub.prototype = new Sup();
    Sub.super = Sup;
    return Sub;
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

var Wire = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
    this.latency = 1500;
});
Wire.prototype.accept = function(packet){
    console.log(this.name, 'got', packet);
    window.setTimeout(this.propagate.bind(this, packet), this.latency);
};

var Server = extend( PacketHolder, function(name) {
    PacketHolder.apply(this, arguments);
});
Server.prototype.accept = function(packet){
    console.log(this.name, 'got', packet);
    if( packet.name == 'request' ) {
        this.sendResponse();
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

client.makeRequest();