
var ResponseGenerator = (function(){
   
    var ResponseGenerator = extend(Thing, function ResponseGenerator(options) {
        Thing.call(this, 'responseGenerator');

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);
        this.initialDelay = options.initialDelay;
        this.messageSize = options.messageSize;
        this.packetNumberAfter = options.packetSequence;
        this.packetMode = Thing.asFunction(options.packetMode);
        this.payloads = dataSets[options.payloads];
    });
    
    ResponseGenerator.prototype.packetGenerator = function() {

        var firstPacketCreated = false;

        return function(n) {
            // unannounced packet to use as a template for others
            var ordering = {
                i:       n,
                isFirst: !firstPacketCreated,
                isLast:  n >= (this.messageSize -1)
            };
    
            var packet = new Packet(
                'response' + n
                ,   'JSON'
                ,   'downstream'
                ,   ordering
                ,   this.packetMode(n)
            ).inDemo(this.demo);
    
            firstPacketCreated = true;
    
            return packet;
        }.bind(this)
    };
    
    ResponseGenerator.prototype.generateResponse = function(startingAt) {

        var packets = this.packetGenerator(); 
        
        function sendNext(previousPacketNumber){
    
            var curPacketNumber = this.packetNumberAfter(previousPacketNumber),
                lastPacket = curPacketNumber >= (this.messageSize - 1);
    
            this.events('packetGenerated').emit(packets(curPacketNumber));

            if (!lastPacket) {
                var nextPacketNumber = this.packetNumberAfter(curPacketNumber);
                this.schedule(
                    sendNext.bind(this, curPacketNumber)
                    , this.timeBetweenPackets(nextPacketNumber)
                );
            }
        }
    
        this.schedule( sendNext.bind(this, startingAt -1), this.initialDelay );
    };
    
    return ResponseGenerator;
}());
