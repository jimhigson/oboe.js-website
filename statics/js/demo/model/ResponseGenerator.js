
var ResponseGenerator = (function(){

    var ResponseGenerator = extend(Thing, function ResponseGenerator(options) {
        Thing.call(this, 'responseGenerator');

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);
        this.initialDelay = options.initialDelay;
        this.messageSize = options.messageSize;
        this.packetNumberAfter = options.packetSequence;
        this.packetMode = Thing.asFunction(options.packetMode);
    });
    
    ResponseGenerator.prototype.generateResponse = function(startingAt) {

        var self = this,
            firstPacketCreated = false;

        function packetNumbered(curPacketNumber) {
            // unannounced packet to use as a template for others
            var ordering = {
                i:       curPacketNumber,
                isFirst: !firstPacketCreated,
                isLast:  curPacketNumber >= (self.messageSize -1)
            };

            var packet = new Packet(
                'response' + curPacketNumber
                ,   'JSON'
                ,   'downstream'
                ,   ordering
                ,   self.packetMode(curPacketNumber)
            ).inDemo(self.demo);

            firstPacketCreated = true;

            return packet;
        }
        
        
        function sendNext(previousPacketNumber){
    
            var curPacketNumber = this.packetNumberAfter(previousPacketNumber),
                lastPacket = curPacketNumber >= (this.messageSize - 1);
    
            this.events('packetGenerated').emit(packetNumbered(curPacketNumber));
    
            if( lastPacket ) {
                this.events('responseComplete').emit();
    
            } else {
    
                var nextPacketNumber = this.packetNumberAfter(curPacketNumber);
                this.schedule(
                    sendNext.bind(this, curPacketNumber)
                    ,   this.timeBetweenPackets(nextPacketNumber)
                );
            }
        }
    
        this.schedule( sendNext.bind(this, startingAt -1), this.initialDelay );
    };
    
    return ResponseGenerator;
}());
