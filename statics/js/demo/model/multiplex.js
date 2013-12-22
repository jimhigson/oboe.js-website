/*  Receive parsed packets from multiple streams, output all according to our parse strategy: either straight
    away or when all parsers have finished.
*/

var multiplex = (function(){

    /* Packets from multiple sources will not have .isFirst and .isLast correctly set
       after multiplexing unless these properties are changed. Do that. 
     */
    function resequence(numberOfResponsesExpected){
        var numberOfResponsesCompleted = 0,
            responsesStarted = false;

        /* Takes packets. Returns packets which are very similar but have had the ordering
         changed, so that their isFirst/isLast is set to be correct post-multiplexing
         (only one first, only one last, even if read from multiple streams where each 
         stream yielded a first and last packet)
         */
        return function(incomingPacket){

            var outgoing = incomingPacket.copy();
            incomingPacket.done();

            if( incomingPacket.ordering.isLast ) {
                numberOfResponsesCompleted++;
            }

            outgoing.ordering.isFirst = !responsesStarted;
            outgoing.ordering.isLast  = ( numberOfResponsesCompleted == numberOfResponsesExpected );

            responsesStarted = true;

            return outgoing;
        }
    }
    
    function multiplexProgressively(parsers, output) {
        for (var i in parsers) {

            parsers[i].events('packetParsed').on(output);
        }
    }

    function multiplexDiscretely(parsers, output) {
        var numberOfCompletedRequired = 0,
            numberCompleted = 0,
            buffer = [];
        
        function outputWhenAllHaveCompleted(packet) {
            if( packet.ordering.isLast ) {
                numberCompleted++;
            }

            buffer.push(packet);            
            
            if( numberCompleted == numberOfCompletedRequired ) {
                buffer.forEach(function(packet){
                    output(packet);
                });
            }
        }
        
        for (var i in parsers) {
            numberOfCompletedRequired++;
            
            parsers[i].events('packetParsed').on(outputWhenAllHaveCompleted);
        }
    }

    return function( strategyName, parsers, output ){
        var numberOfResponsesExpected = Object.keys(parsers).length,
            reseq = resequence(numberOfResponsesExpected);
        
        function renumberedOutput(packet){
            output(reseq(packet));
        }
        
        if( strategyName == 'progressive' ) {
            multiplexProgressively(parsers, renumberedOutput);
        } else {
            multiplexDiscretely(parsers, renumberedOutput);
        }
    };
    
}());
