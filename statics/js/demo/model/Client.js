var Client = extend( PacketHolder, function Client(name, locations, options) {

    PacketHolder.apply(this, arguments);
    this.page = options.page;
    this.failAfter = options.failAfter;
    this.retryAfter = options.retryAfter;
    this.aspect = options.aspect;

    this.parser = Parser(options.parseStrategy);

    this.parser.events('packetParsed').on( function(packet) {
        this.events('gotData').emit(packet);
        this.receivedUpTo = packet.ordering.i;
    }.bind(this));

    this.attemptNumber = 0;
    this.receivedUpTo = -1;
    
    this.events('reset').on(function(){
        this.attemptNumber = 0;
        this.receivedUpTo = -1;
    }.bind(this));
});

Client.newEvent = 'Client';

Client.prototype.makeRequest = function(){

    this.events('request').emit();
    this.addToScript('requestAttempt', this.attemptNumber);
    
    var packet =
        new Packet('request', 'GET', 'upstream', {isFirst:true, isLast:true, i:0})
            .inDemo(this.demo)
            .startingAt(this.receivedUpTo +1)
            .announce();

    this.scheduleFail();
    
    this.propagate(packet);
    
    this.attemptNumber++; // increment for next time
};

Client.prototype.scheduleFail = function() {
    
    this.giveUpTimeout = this.schedule(function(){
        
        this.events('requestFail').emit();
        
        this.schedule(this.makeRequest.bind(this), this.retryAfter);
        
    }.bind(this), this.failAfter);
};


Client.prototype.acceptFromUpstream = function(packet){

    this.addToScript('accepted', packet);
    
    this.parser.read(packet);

    this.unschedule(this.giveUpTimeout);

    if (packet.ordering.isLast) {
        this.events('requestComplete').emit();
    } else {
        this.scheduleFail();
    }

    packet.done();
};
