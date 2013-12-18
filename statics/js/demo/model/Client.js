var Client = extend( PacketHolder, function(name, locations, options) {

    PacketHolder.apply(this, arguments);
    this.page = options.page;
    this.parseStrategy = this.makeParseStrategy(options.parseStrategy);
    this.retryAfter = options.retryAfter || Number.POSITIVE_INFINITY;
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
};

Client.prototype.makeRequest = function( attemptNumber ){
    attemptNumber = attemptNumber || 0;

    this.addToScript('requestAttempt', attemptNumber);
    
    var packet =
        new Packet('request', 'GET', 'upstream', {isFirst:true, isLast:true, i:0})
            .inDemo(this.demo)
            .announce();

    this.retryIfNoResponse = this.schedule(function retry(){
        this.makeRequest( attemptNumber +1 );
    }.bind(this), this.retryAfter);
    
    this.propagate(packet);
};
Client.prototype.accept = function(packet){

    this.addToScript('accepted', packet);
    
    this.parseStrategy(packet);
    
    if( packet.ordering.isLast ) {
        this.unschedule(this.retryIfNoResponse);
    }

    packet.done();
};
