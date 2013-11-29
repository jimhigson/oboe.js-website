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


function stampFromTemplate(templateId, klass) {
    return $('template#' + templateId).children().clone().addClass(klass);
}

function transformToLocation(location){
    return 'translate(' + location.x + ',' + location.y + ')';
}

Packet.new.on( function(newPacket){
    
   
    new PacketView(newPacket);   
    
});

function ThingView(containerName, templateName, subject) {
    this.jDom = stampFromTemplate(templateName, subject.name);
    $('#' + containerName).append(this.jDom);
}

function PacketView(subject) {

    ThingView.call(this, 'packets', 'packet', subject);

    subject.events('move').on(function( fromXY, toXY, duration ){
        
        this.jDom.css({
            circleX:fromXY.x,
            circleY:fromXY.y
        });
        this.jDom.animate({
                circleX:toXY.x,
                circleY:toXY.y
            },
            {   duration:duration}
        );
    }.bind(this));
    
    subject.events('done').on(function(){
        this.jDom.remove();
    }.bind(this));
}

var WireView = extend(ThingView, function(subject){

    ThingView.call(this, 'wires', 'wire', subject);
    this.jDom.attr('x1', subject.locations.downstream.x );
    this.jDom.attr('y1', subject.locations.downstream.y );
    this.jDom.attr('x2', subject.locations.upstream.x );
    this.jDom.attr('y2', subject.locations.upstream.y );
});

var ServerView = extend(ThingView, function(subject){

    ThingView.call(this, 'places', 'server', subject);
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
});

var ClientView = extend(ThingView, function(subject){
    ThingView.call(this, 'places', 'client', subject);
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
});