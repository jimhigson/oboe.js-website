var OriginServer = (function(){

    var Super = Server;

    var OriginServer = extend( Super, function OriginServer(name, locations, options) {

        Super.apply(this, arguments);

        this.responseGenerator = new ResponseGenerator(options);

        this.responseGenerator.events('packetGenerated').on(
            this.events('packetReadyToDispatch').emit
        );
        this.responseGenerator.events('responseComplete').on(
            this.events('allPacketsDispatched').emit
        );        
    });

    OriginServer.newEvent = 'OriginServer';

    OriginServer.prototype.accept = function(packet){

        if( packet.direction == 'upstream' ) {
            this.generateResponse(packet.gotAlreadyUpTo);
            packet.done();
        }
    };

    OriginServer.prototype.inDemo = function(demo){
        Super.prototype.inDemo.apply(this, arguments);
        this.responseGenerator.inDemo(demo);
        return this;
    };

    /**
     *  Start a new, original response originating from this OriginServer
     */
    OriginServer.prototype.generateResponse = function(startingAt) {
        this.openMessagesToAdjacents(
            this.nextLocationsInDirection('downstream')
        );

        this.responseGenerator.generateResponse(startingAt);
    };

    return OriginServer;
}());
