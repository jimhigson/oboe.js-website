var Client = extend( PacketHolder, function(name, locations, options) {

    PacketHolder.apply(this, arguments);
    this.page = options.page;
    this.parseStrategy = this.makeParseStrategy(options.parseStrategy);
    this.retryAfter = options.retryAfter || Number.POSITIVE_INFINITY;
    this.attemptNumber = 0;
    
    this.events('reset').on(function(){
        this.attemptNumber = 0;
    }.bind(this));
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

Client.prototype.makeRequest = function(){

    this.addToScript('requestAttempt', this.attemptNumber);
    
    var packet =
        new Packet('request', 'GET', 'upstream', {isFirst:true, isLast:true, i:0})
            .inDemo(this.demo)
            .announce();

    this.scheduleRetry();
    
    this.propagate(packet);
};

Client.prototype.scheduleRetry = function() {
    
    this.retryIfNoResponse = this.schedule(function retry(){
        this.attemptNumber++;
        this.makeRequest();
    }.bind(this), this.retryAfter);
};

Client.prototype.accept = function(packet){

    this.addToScript('accepted', packet);
    
    this.parseStrategy(packet);

    this.unschedule(this.retryIfNoResponse);
    
    if( !packet.ordering.isLast ) {
        this.scheduleRetry();
    }

    packet.done();
};
