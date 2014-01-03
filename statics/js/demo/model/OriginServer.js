var OriginServer = (function(){

    var Super = PacketHolder;

    var OriginServer = extend( Super, function OriginServer(name, locations, options) {

        Super.apply(this, arguments);

        this.responseGenerator = new ResponseGenerator(options);

        this.responseGenerator.events('packetGenerated').on(function(packet){
           this.addToScript('sent', packet);
           this.propagate(packet);
        }.bind(this));
    });

    OriginServer.newEvent = 'OriginServer';

    OriginServer.prototype.acceptFromDownstream = function(packet){

        var startingAt = packet.gotAlreadyUpTo;
        this.responseGenerator.generateResponse(startingAt);
        packet.done();
    };

    OriginServer.prototype.inDemo = function(demo){
        Super.prototype.inDemo.apply(this, arguments);
        this.responseGenerator.inDemo(demo);
        return this;
    };

    return OriginServer;
}());
