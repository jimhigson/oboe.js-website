function throttle(timeBetweenPackets, send, scheduler){
    
    if( !timeBetweenPackets ) {
        throw new Error('no timing given');
    }
    
    var buffer = [];
    
    function read(receivedPacket){

        buffer.push(receivedPacket);

        if( receivedPacket.ordering.isFirst ) {
            slot(0);
        }
    }

    function slot(i) {

        var frontOfQueuePacket = buffer.shift();

        if( frontOfQueuePacket ) {
            send.call(scheduler, frontOfQueuePacket);
        }

        if( !(frontOfQueuePacket && frontOfQueuePacket.ordering.isLast) ) {
            var nextSlotIn = timeBetweenPackets(i);

            scheduler.schedule(
                function(){
                    slot(i+1);
                },
                nextSlotIn
            );
        }
    }
    
    return {
        read: read
    }
}
