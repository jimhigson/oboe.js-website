var OriginServer = (function(){

    var Super = Server;

    var OriginServer = extend( Super, function OriginServer(name, locations, options) {

        Super.apply(this, arguments);

        this.responseGenerator = new ResponseGenerator(options);

        this.responseGenerator.events('packetGenerated').on(
            this.propagate.bind(this)
        );
    });

    OriginServer.newEvent = 'OriginServer';

    OriginServer.prototype.accept = function(packet){

        if( packet.direction == 'upstream' ) {
            var startingAt = packet.gotAlreadyUpTo;
            this.responseGenerator.generateResponse(startingAt);
            packet.done();
        }
    };

    OriginServer.prototype.inDemo = function(demo){
        Super.prototype.inDemo.apply(this, arguments);
        this.responseGenerator.inDemo(demo);
        return this;
    };

    return OriginServer;
}());
