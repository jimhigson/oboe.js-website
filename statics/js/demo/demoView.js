
function stampFromTemplate(templateId) {
    return $('template#' + templateId).children().clone();
}

Packet.new.on( function(newPacket){
    
    console.log('__new packet created', newPacket);
    
    new PacketView(newPacket);   
    
});

function PacketView(packet) {

    var packetDom = stampFromTemplate('packet');
    packetDom.attr('class', 'packet ' + packet.name);
    PacketView.container.append(packetDom);
        
    packet.events('done').on(function(){
        packetDom.remove();        
    });
}

PacketView.container = $('.packets');


function PacketHolderView(locations) {
    this.locations = locations;
}

var WireView = extend(PacketHolderView, function(wire, upstreamLocation, downstreamLocation){

    PacketHolderView.call(this, {
        upstream:   upstreamLocation,
        downstream: downstreamLocation
    });
    
    wire.packetMove.on(function(packet, location){
        console.log('__move', packet, location);
        console.log('__move', this.locations[location], wire.latency );
    }.bind(this));
});

var ServerView = extend(PacketHolderView, function(){
});

var ClientView = extend(PacketHolderView, function(){
});