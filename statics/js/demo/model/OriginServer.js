var OriginServer = (function(){

    var Super = PacketHolder;

    var OriginServer = extend( Super, function OriginServer(name, locations, options) {

        Super.apply(this, arguments);

        this.responseGenerator = new ResponseGenerator(options);

        this.responseGenerator.events('packetGenerated').on(function(packet, recipient){
           
           this.addToScript('sent', packet);
           this.propagate(packet, [recipient]);
        }.bind(this));
    });

    OriginServer.newEvent = 'OriginServer';

    OriginServer.prototype.acceptFromDownstream = function(packet, source){
       
        this.addToScript('gotRequest');
        this.responseGenerator.generateResponse(
            packet.gotAlreadyUpTo, 
            packet.requestingUpto, 
            source
        );
        packet.done();
    };

    OriginServer.prototype.inDemo = function(demo){
        Super.prototype.inDemo.apply(this, arguments);
        this.responseGenerator.inDemo(demo);
        return this;
    };

    return OriginServer;
}());
