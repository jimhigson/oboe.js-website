
Packet.new.on( function(newPacket){
    
    console.log('__new packet created', newPacket);
    
    new PacketView(newPacket);   
    
});

function PacketView(packet) {
    
    packet.events('move').on(function(x, y, dur){
        console.log('__moved:', packet, x, y, dur);
    });
    
    packet.events('done').on(function(){
        console.log('__finished:', packet);        
    });
    
}