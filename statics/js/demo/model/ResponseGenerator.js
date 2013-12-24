
var ResponseGenerator = (function(){

    var ResponseGenerator = extend(Thing, function ResponseGenerator(options) {
        Thing.call(this, 'responseGenerator');

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);
        this.initialDelay = options.initialDelay;
        this.messageSize = options.messageSize;
        this.packetNumberAfter = options.packetSequence;        
    });
    
    ResponseGenerator.prototype.generateResponse = function(startingAt) {
    
        function sendNext(previousPacketNumber){
    
            var curPacketNumber = this.packetNumberAfter(previousPacketNumber),
                lastPacket = curPacketNumber >= (this.messageSize - 1);
    
            this.events('packetGenerated').emit(curPacketNumber);
    
            if( lastPacket ) {
                this.events('messageEnd').emit();
    
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
