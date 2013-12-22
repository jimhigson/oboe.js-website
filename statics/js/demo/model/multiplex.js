/*  Receive parsed packets from multiple streams, output all according to our parse strategy: either straight
    away or when all parsers have finished.
*/

var multiplex = (function(){
    
    return function( parsers, output ){

        for( var i in parsers ) {

            parsers[i].events('packetParsed').on(output);
        }
    };
    
}());
