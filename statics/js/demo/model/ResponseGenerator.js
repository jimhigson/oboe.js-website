
var ResponseGenerator = (function(){

    // order from: 
    //      http://www.theguardian.com/news/datablog/2012/nov/06/time-states-election-results-us#data
    var dataSets = {
        "2012UsElection":[
            {where: 'in', votes:11},
            {where: 'ky', votes:8},
            {where: 'fl', votes:29},
            {where: 'ga', votes:16},
            {where: 'nh', votes:4},
            {where: 'sc', votes:9},
            {where: 'vt', votes:3},
            {where: 'va', votes:13},
            {where: 'nc', votes:15},
            {where: 'oh', votes:18},
            {where: 'wv', votes:5},
            {where: 'al', votes:9},
            {where: 'ct', votes:7},
            {where: 'de', votes:3},
            {where: 'dc', votes:3},
            {where: 'il', votes:20},
            {where: 'ks', votes:6},
            {where: 'me', votes:4},
            {where: 'md', votes:10},
            {where: 'ma', votes:11},
            {where: 'mi', votes:16},
            {where: 'ms', votes:6},
            {where: 'mo', votes:10},
            {where: 'nj', votes:14},
            {where: 'nd', votes:3},
            {where: 'ok', votes:7},
            {where: 'pa', votes:20},
            {where: 'ri', votes:4},
            {where: 'tn', votes:11},
            {where: 'tx', votes:38},
            {where: 'ar', votes:6},
            {where: 'co', votes:9},
            {where: 'la', votes:8},
            {where: 'mn', votes:10},
            {where: 'ne', votes:5},
            {where: 'nm', votes:5},
            {where: 'ny', votes:29},
            {where: 'sd', votes:3},
            {where: 'wi', votes:10},
            {where: 'wy', votes:3},
            {where: 'az', votes:11},
            {where: 'ia', votes:6},
            {where: 'mt', votes:3},
            {where: 'nv', votes:6},
            {where: 'ut', votes:6},
            {where: 'ca', votes:55},
            {where: 'hi', votes:4},
            {where: 'id', votes:4},
            {where: 'or', votes:7},
            {where: 'wa', votes:12},
            {where: 'ak', votes:3}
        ]
    };
    
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
