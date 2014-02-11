
var ResponseGenerator = (function(){
   
    var ResponseGenerator = extend(Thing, function ResponseGenerator(options) {
        Thing.call(this, 'responseGenerator');

        var packetPayloads = dataSets[options.payloads];
        
        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);
        this.initialDelay = options.initialDelay;
        this.messageSize = packetPayloads? packetPayloads.length : options.messageSize;
        this.packetNumberAfter = options.packetSequence;
        this.packetMode = Thing.asFunction(options.packetMode);
        this.packetPayloads = packetPayloads;
    });
    
    ResponseGenerator.prototype.packetGenerator = function(lastPacketNumber) {

        var firstPacketCreated = false;

        return function(n) {
            // unannounced packet to use as a template for others
            var ordering = {
                i:       n,
                isFirst: !firstPacketCreated,
                isLast:  n >= (lastPacketNumber)
            };
           
            if( ordering.isFirst && Number.isFinite(this.messageSize) ) {
               ordering.expectedSize = lastPacketNumber +1;
            }
    
            var packet = new Packet(
                'response' + n
                ,   'JSON'
                ,   'downstream'
                ,   ordering
                ,   this.packetMode(n)
            ).inDemo(this.demo);
            
            packet.payload = this.packetPayloads && this.packetPayloads[n];
    
            firstPacketCreated = true;
    
            return packet;
        }.bind(this)
    };
    
    ResponseGenerator.prototype.generateResponse = function(startingAt, endingAt, intendedRecipient) {

        var lastPacketNumber = Math.min(this.messageSize - 1, endingAt),
            packets = this.packetGenerator( lastPacketNumber );
        
        function sendNext(previousPacketNumber){
    
            var curPacketNumber = this.packetNumberAfter(previousPacketNumber),
                lastPacket = curPacketNumber >= lastPacketNumber;
    
            this.events('packetGenerated').emit(packets(curPacketNumber), intendedRecipient);

            if (!lastPacket) {
                var nextPacketNumber = this.packetNumberAfter(curPacketNumber);
                this.schedule(
                    sendNext.bind(this, curPacketNumber, intendedRecipient)
                    , this.timeBetweenPackets(nextPacketNumber)
                );
            }
        }
    
        this.schedule( sendNext.bind(this, startingAt -1), this.initialDelay );
    };
    
    return ResponseGenerator;
}());
