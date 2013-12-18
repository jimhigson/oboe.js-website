function ParseStrategy (strategyName, emitter){

    if( !strategyName )
        throw Error('no parsing strategy given');
    
    switch(strategyName){
        case 'progressive':
            return function(packet){
                //this.receivedUpTo = packet.ordering.i;
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
                    //this.receivedUpTo = packetsSoFar.length -1;
                }
            };
    
        default:
            throw Error('wtf is ' + strategyName + '?');
    } 
}
