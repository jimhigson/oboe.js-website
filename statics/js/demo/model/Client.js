var Client = extend( PacketHolder, function(name, locations, options) {

    PacketHolder.apply(this, arguments);
    this.page = options.page;
    this.retryAfter = options.retryAfter || Number.POSITIVE_INFINITY;
    this.parseStrategy = this.makeParseStrategy(options.parseStrategy);

    this.events('gotData').on(function(packet){
        this.receivedUpTo = packet.ordering.i;
    }.bind(this));

    this.attemptNumber = 0;
    this.receivedUpTo = -1;
    
    this.events('reset').on(function(){
        this.attemptNumber = 0;
        this.receivedUpTo = -1;
    }.bind(this));
});

Client.prototype.makeParseStrategy = function(strategyName){

    return Parser(strategyName, this.events('gotData').emit);
};

Client.prototype.makeRequest = function(){

    this.addToScript('requestAttempt', this.attemptNumber);
    
    var packet =
        new Packet('request', 'GET', 'upstream', {isFirst:true, isLast:true, i:0})
            .inDemo(this.demo)
            .startingAt(this.receivedUpTo +1)
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
