function Parser (strategyName){

    var events = pubSub(),
        read;
    
    switch(strategyName){
        case 'progressive':
            read = function(packet){
                events('packetParsed').emit(packet);
            };
            break;
    
        case 'discrete':
            var packetsSoFar = [];
            read = function(packet){
                packetsSoFar.push(packet);
    
                if( packet.ordering.isLast ) {
                    packetsSoFar.forEach(function(packet){
                        events('packetParsed').emit(packet);
                    });
                }
            };
            break;
    
        default:
            throw Error('wtf is ' + strategyName + '?');
    } 
    
    return {
        read: read,
        events: events
    };
}
