var Client = extend( PacketHolder, function Client(name, locations, options) {

    PacketHolder.apply(this, arguments);
    this.page = options.page;
    this.retryAfter = options.retryAfter;
    this.parser = Parser(options.parseStrategy);
    this.aspect = options.aspect;

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

    this.scheduleRetry();
    
    this.propagate(packet);
};

Client.prototype.scheduleRetry = function() {
    
    this.retryIfNoResponse = this.schedule(function retry(){
        this.attemptNumber++;
        this.makeRequest();
    }.bind(this), this.retryAfter);
};

Client.prototype.acceptFromUpstream = function(packet){

    this.addToScript('accepted', packet);
    
    this.parser.read(packet);

    this.unschedule(this.retryIfNoResponse);

    if (packet.ordering.isLast) {
        this.events('requestComplete').emit();
    } else {
        this.scheduleRetry();
    }

    packet.done();
};
