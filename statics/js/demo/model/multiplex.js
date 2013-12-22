/*  Receive parsed packets from multiple streams, output all according to our parse strategy: either straight
    away or when all parsers have finished.
*/

var multiplex = (function(){

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

        if( strategyName == 'progressive' ) {
            multiplexProgressively(parsers, output);
        } else {
            multiplexDiscretely(parsers, output);
        }
    };
    
}());
