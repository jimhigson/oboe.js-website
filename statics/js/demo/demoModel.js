
function extend(Sup, Sub) {
    Sub.prototype = Object.create(Sup.prototype);
    Sub.prototype.constructor = Sub;
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
    throw new Error('unknown direction' + dir);
}

function Thing(name){
    this.name = name;
    this.events = pubSub();
}
Thing.prototype.reset = function(){
}
Thing.prototype.inDemo = function(demo){
    this.demo = demo;
    this.demo.events('reset').on(function(){
        this.reset();
        this.events('reset').emit();
    }.bind(this));
    return this; //chaining
}

var Demo = extend(Thing, function(name){
    Thing.apply(this, arguments);
});
Demo.prototype.start = function(){
    this.startSimulation();
};
Demo.prototype.reset = function(){
    this.events('reset').emit();
};

var Packet = extend(Thing, function (name, type, direction, ordering){
    Thing.apply(this, arguments);
    
    this.direction = direction;
    this.isFirst = ordering.isFirst;
    this.isLast = ordering.isLast;
    this.type = type;
});
Packet.prototype.announce = function() {
    Packet.new.emit(this);
    return this;
};
Packet.new = singleEventPubSub('new');
Packet.prototype.move = function(fromXY, toXY, latency){
    this.events('move').emit(fromXY, toXY, latency);
};
Packet.prototype.reset =
Packet.prototype.done = function(){
    this.events('done').emit();
};


var PacketHolder = extend(Thing, function(name, locations){
    Thing.apply(this, arguments);
    if( !locations ) {
        throw new Error("don't know where " + name + " is");
    }

    this.name = name;
    this.latency = 0;
    this.locations = locations || {};
    this.adjacents = {
        downstream: new EventSink('downstream void')
    ,   upstream:   new EventSink('upstream void')
    };
});
PacketHolder.prototype.accept = abstract;

PacketHolder.prototype.withDownstream = function(downstream){
    
    this.adjacents.downstream = downstream;
    downstream.adjacents.upstream = this;
        
    return this;    
};
PacketHolder.prototype.propagate = function(packet){
    this.adjacents[packet.direction].accept(packet);
};
PacketHolder.prototype.movePacket = function(packet){
    var fromLocation = oppositeDirectionTo(packet.direction),
        toLocation = packet.direction,
        fromXY = this.locations[fromLocation];
        toXY   = this.locations[toLocation];

    packet.move(fromXY, toXY, this.latency);
};

function EventSink (name) {
    this.name = name;
}


var Wire = extend( PacketHolder, function(name, locations, options) {
    
    PacketHolder.apply(this, arguments);
    this.latency = options.latency;
    this.bandwidth = options.bandwidth;
    this.timeouts = [];
});
Wire.prototype.accept = function(packet){
        
    this.movePacket(packet);

    this.propagateAfterLatency(packet);
};
Wire.prototype.propagateAfterLatency = function(packet){
    
    var timeout = window.setTimeout(function(){

        this.removeTimeout(timeout);
        this.propagate(packet);

    }.bind(this), this.latency);

    this.timeouts.push( timeout );
}
Wire.prototype.removeTimeout = function(timeout){
    
    this.timeouts = this.timeouts.filter(function( storedTimeout ){
        return storedTimeout != timeout;
    });
};
Wire.prototype.reset = function(){
    // cancel all scheduled events:
    this.timeouts.forEach(function(timeout){
        window.clearTimeout(timeout);
    });
}

var Server = extend( PacketHolder, function(name, locations, options) {
    PacketHolder.apply(this, arguments);
    this.timeBetweenPackets = options.timeBetweenPackets;
    this.initialDelay = options.initialDelay;
    this.messageSize = options.messageSize;
});
Server.prototype.accept = function(packet){
        
    if( packet.name == 'request' ) {
        this.sendResponse();
        packet.done();
    }
};
Server.prototype.sendResponse = function() {
    window.setTimeout(function(){
        var i = 0,
            interval = window.setInterval(function(){
                    var ordering = {
                        isFirst: i == 0,
                        isLast: i == (this.messageSize -1)
                    };

                    var packet =
                        new Packet('response' + i, 'JSON', 'downstream', ordering)
                            .inDemo(this.demo)
                            .announce();  
                
                    this.propagate(packet);
                                
                    if( ordering.isLast ) {
                        window.clearInterval(interval);
                    }
                
                    i++;
                }.bind(this), this.timeBetweenPackets);
        
    }.bind(this), this.initialDelay);
};

var Client = extend( PacketHolder, function(name, locations, options) {
    
    PacketHolder.apply(this, arguments);
    this.parseStrategy = this.makeParseStrategy(options.parseStrategy);
});

Client.prototype.makeParseStrategy = function(strategyName){

    if( !strategyName )
        throw Error('no parsing strategy given');

    var receive = this.events('receive');

    switch(strategyName){
        case 'progressive':
            return function(packet){
                receive.emit(packet);
            }

        case 'discrete':
            var packetsSoFar = [];
            return function(packet){
                packetsSoFar.push(packet);
                
                if( packet.isLast ) {
                    packetsSoFar.forEach(function(packet){
                        receive.emit(packet);
                    });
                }            
            }
        
        default:
            throw Error('what is ' + strategyName + '?');            
    }
}

Client.prototype.makeRequest = function(){
    var packet = 
        new Packet('request', 'GET', 'upstream', {isFirst:true, isLast:true})
            .inDemo(this.demo)
            .announce();
    
    this.propagate(packet);
};
Client.prototype.accept = function(packet){
    
    this.parseStrategy(packet);
        
    packet.done();    
};
