function Parser (strategyName, callback){

    if( !strategyName )
        throw Error('no parsing strategy given');
    
    switch(strategyName){
        case 'progressive':
            return function(packet){
                callback(packet);
            };
    
        case 'discrete':
            var packetsSoFar = [];
            return function(packet){
                packetsSoFar.push(packet);
    
                if( packet.ordering.isLast ) {
                    packetsSoFar.forEach(function(packet){
                        callback(packet);
                    });
                }
            };
    
        default:
            throw Error('wtf is ' + strategyName + '?');
    } 
}
