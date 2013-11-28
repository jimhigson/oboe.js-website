/* allow svg properties to be set like css by jQuery */
$.cssHooks[ "circleX" ] = {
    get: function( elem, computed, extra ) {
        return elem.getAttribute('cx') || 0;
    },
    set: function( elem, value ) {
        return elem.setAttribute('cx', value);
    }
};
$.cssHooks[ "circleY" ] = {
    get: function( elem, computed, extra ) {
        return elem.getAttribute('cy') || 0;
    },
    set: function( elem, value ) {
        return elem.setAttribute('cy', value);
    }
};


function stampFromTemplate(templateId) {
    return $('template#' + templateId).children().clone();
}

Packet.new.on( function(newPacket){
    
    console.log('__new packet created', newPacket);
    
    new PacketView(newPacket);   
    
});

function PacketView(packet) {

    var jPacket = stampFromTemplate('packet');
    jPacket.attr('class', 'packet ' + packet.name);
    PacketView.container.append(jPacket);

    packet.events('move').on(function( fromXY, toXY, duration ){
        console.log(fromXY, toXY, duration);
        
        jPacket.css({
            circleX:fromXY.x,
            circleY:fromXY.y
        });
        jPacket.animate({
            circleX:toXY.x,
            circleY:toXY.y
        },
            {duration:duration}
        );
    });    
    
    packet.events('done').on(function(){
        jPacket.remove();        
    });
}

PacketView.container = $('.packets');


function PacketHolderView(locations) {
    this.locations = locations;
}

var WireView = extend(PacketHolderView, function(subject, upstreamLocation, downstreamLocation){

    PacketHolderView.call(this, {
        upstream:   upstreamLocation,
        downstream: downstreamLocation
    });
    
    subject.packetMove.on(function(packet, fromLocation, toLocation){
        var fromXY = this.locations[fromLocation]; 
        var toXY   = this.locations[toLocation]; 
                
        packet.events('move').emit(fromXY, toXY, subject.latency);
    }.bind(this));
});

var ServerView = extend(PacketHolderView, function(){
});

var ClientView = extend(PacketHolderView, function(){
});