
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

var Demo = extend(Thing, function(name, options){
    Thing.apply(this, arguments);
    
    this.height = options.height; 
});
Demo.prototype.start = function(){
    this.startSimulation();
};
Demo.prototype.reset = function(){
    this.events('reset').emit();
};

var Packet = extend(Thing, function (name, type, direction, ordering, mode){
    Thing.apply(this, arguments);
    
    this.direction = direction;
    this.ordering = ordering;
    this.type = type;
    this.mode = mode;
});
Packet.prototype.copy = function(i) {
    return new Packet(
                this.name + '-' + i,
                this.type, 
                this.direction, 
                this.ordering,
                this.mode
        
           ).inDemo(this.demo);
};
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

    this.timeouts = [];
    this.name = name;
    this.latency = 0;
    this.locations = locations || {};
    this.adjacents = {
        downstream: []
    ,   upstream:   []
    };
});
PacketHolder.prototype.accept = abstract;

PacketHolder.prototype.withDownstream = function(downstream){
    
    this.adjacents.downstream.push(downstream);
    downstream.adjacents.upstream.push(this);
        
    return this;    
};
PacketHolder.prototype.propagate = function(packet){
    
    this.adjacents[packet.direction].forEach( function(adjacent, i){
        var packetCopy = packet.copy(i).announce();
        
        adjacent.accept(packetCopy);        
    }.bind(this));
    
    packet.done();

};
PacketHolder.prototype.movePacket = function(packet){
    var fromLocation = oppositeDirectionTo(packet.direction),
        toLocation = packet.direction,
        fromXY = this.locations[fromLocation];
        toXY   = this.locations[toLocation];

    packet.move(fromXY, toXY, this.latency);
};
PacketHolder.prototype.removeTimeout = function(timeout){

    this.timeouts = this.timeouts.filter(function( storedTimeout ){
        return storedTimeout != timeout;
    });
};
PacketHolder.prototype.cancelTimeouts = function(){

    // cancel all scheduled events:
    this.timeouts.forEach(function(timeout){
        window.clearTimeout(timeout);
    });

    this.timeouts = [];
}
PacketHolder.prototype.schedule = function(fn, time) {
    var timeout = window.setTimeout(function(){
        
        // stop remembering this timeout, it is done now:
        this.removeTimeout(timeout);
        fn();
        
    }.bind(this), time);

    this.timeouts.push( timeout );
};
PacketHolder.prototype.reset = function(){
    this.cancelTimeouts(); 
};



var Wire = extend( PacketHolder, function(name, locations, options) {
    
    PacketHolder.apply(this, arguments);
    this.latency = options.latency;
    this.bandwidth = options.bandwidth;
});
Wire.prototype.accept = function(packet){
        
    this.movePacket(packet);

    this.propagateAfterLatency(packet);
};
Wire.prototype.propagateAfterLatency = function(packet){
    
    this.schedule(function(){

        this.propagate(packet);

    }.bind(this), this.latency);
}

var Server = extend( PacketHolder, function(name, locations, options) {
    
    PacketHolder.apply(this, arguments);
    var timeBetweenPackets = options.timeBetweenPackets; 
    this.timeBetweenPackets = 
            (typeof timeBetweenPackets == 'function')
            ?   timeBetweenPackets    
            :   function(){return timeBetweenPackets}
            ;
    this.packetMode = options.packetMode || function(){return 'live'};

    this.initialDelay = options.initialDelay;
    this.messageSize = options.messageSize;
    this.packetNumberAfter = options.packetSequence || function(previousPacketNumber){
        return      (previousPacketNumber === undefined)
                ?   0
                :   previousPacketNumber+1;
    };
});
Server.prototype.accept = function(packet){
        
    if( packet.direction == 'upstream' ) {
        this.sendResponse();
        packet.done();
    }    
};
Server.prototype.sendResponse = function() {
    
    function next(previousPacketNumber){

        var packetNumber = this.packetNumberAfter(previousPacketNumber);
                
        var ordering = {
            i:packetNumber,
            isFirst: packetNumber == 0,
            isLast: packetNumber >= (this.messageSize -1)
        };

        var packet =
            new Packet('response' + packetNumber, 'JSON', 'downstream', ordering, this.packetMode(previousPacketNumber))
                .inDemo(this.demo)
                .announce();

        this.propagate(packet);

        // schedule the next packet if there is one:
        if( !ordering.isLast ) {
            this.schedule(  next.bind(this, packetNumber)
                         ,  this.timeBetweenPackets(packetNumber)
                         );
        }
    }
    
    this.schedule( next.bind(this), this.initialDelay )
};

var AggregatingServer = extend(Server, function(name, locations, options){
    Server.apply(this, arguments);    
});
AggregatingServer.prototype.accept = function(packet) {
    if( packet.direction == 'upstream' ) {
        this.propagate(packet);
    } else {
        // TODO: this only describes the Oboe case, not the standard case,
        // will need to wait for all inbound messages to complete
        this.propagate(packet); 
    }
};

var Client = extend( PacketHolder, function(name, locations, options) {
    
    PacketHolder.apply(this, arguments);
    this.page = options.page;
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
            };

        case 'discrete':
            var packetsSoFar = [];
            return function(packet){
                packetsSoFar.push(packet);
                
                if( packet.ordering.isLast ) {
                    packetsSoFar.forEach(function(packet){
                        receive.emit(packet);
                    });
                }            
            };
        
        default:
            throw Error('what is ' + strategyName + '?');            
    }
}

Client.prototype.makeRequest = function(){
    var packet = 
        new Packet('request', 'GET', 'upstream', {isFirst:true, isLast:true, i:0})
            .inDemo(this.demo)
            .announce();
    
    this.propagate(packet);
};
Client.prototype.accept = function(packet){
    
    this.parseStrategy(packet);
        
    packet.done();    
};
