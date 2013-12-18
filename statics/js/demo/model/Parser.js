function Parser (strategyName, emitter){

    if( !strategyName )
        throw Error('no parsing strategy given');
    
    switch(strategyName){
        case 'progressive':
            return function(packet){
                emitter(packet);
            };
    
        case 'discrete':
            var packetsSoFar = [];
            return function(packet){
                packetsSoFar.push(packet);
    
                if( packet.ordering.isLast ) {
                    packetsSoFar.forEach(function(packet){
                        emitter(packet);
                    });
                }
            };
    
        default:
            throw Error('wtf is ' + strategyName + '?');
    } 
}
