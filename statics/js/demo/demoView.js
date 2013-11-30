
/* allow svg properties to be set like css by jQuery. Apply a simple
 * idea of SVG transforms that ignores order and other transforms */
 $.cssHooks.translateX = {
    get: function( elem, computed, extra ) {
        return elem.transform.baseVal.getItem(0).matrix.e;
    },
    set: function( elem, value ) {
        elem.transform.baseVal.getItem(0).matrix.e = value; 
    }
};
$.cssHooks.translateY = {
    get: function( elem, computed, extra ) {
        return elem.transform.baseVal.getItem(0).matrix.f;
    },
    set: function( elem, value ) {
        elem.transform.baseVal.getItem(0).matrix.f = value;
    }
};
$.cssNumber.translateX = true;
$.cssNumber.translateY = true;

/* jQuery doesn't like adding classes to SVG elements */
function addClass(jEle, klass) {
    var ele = jEle[0];
    ele.setAttribute('class', ele.getAttribute('class') + ' ' + klass);
}

function stampFromTemplate(templateId, klass) {
    var copy = $('template#' + templateId).children().clone();
    // jQuery doesn't like addClass on SVG...
    addClass(copy, klass);
    return copy;
}

function transformToLocation(location){
    return 'translate(' + location.x + ',' + location.y + ')';
}

Packet.new.on( function(newPacket){
    
    new PacketView(newPacket);
});

function ThingView(containerName, templateName, subject) {    
}
ThingView.prototype.initDomFromTemplate = function(containerName, templateName, subject) {
    this.jDom = stampFromTemplate(templateName, subject.name);
    var jContainer = $('#' + containerName);
    if( !jContainer.length ) {
        throw new Error('nowhere to put the thing');
    }
    jContainer.append(this.jDom);
    return this.jDom;
};

var PacketView = extend(ThingView, function (subject) {
    function templateName(){
        switch(subject.type) {
            case 'GET':
                return 'getRequest';
            case 'JSON':
                return (   subject.isFirst
                    ?   'firstPacket'
                    :       (   subject.isLast
                    ?   'lastPacket'
                    :   'packet'
                    )
                );
        }        
    }
    
    this.initDomFromTemplate( 'packets', templateName(), subject);

    subject.events('move').on(function( fromXY, toXY, duration ){
        
        this.jDom.css({
            translateX:fromXY.x,
            translateY:fromXY.y
        });
        this.jDom.animate({
                translateX:toXY.x,
                translateY:toXY.y
            },
            {   duration:duration}
        );
    }.bind(this));
    
    subject.events('done').on(function(){
        this.jDom.remove();
    }.bind(this));
});

var WireView = extend(ThingView, function(subject){

    this.initDomFromTemplate( 'wires', 'wire', subject);
    
    this.jDom.attr('x1', subject.locations.downstream.x );
    this.jDom.attr('y1', subject.locations.downstream.y );
    this.jDom.attr('x2', subject.locations.upstream.x );
    this.jDom.attr('y2', subject.locations.upstream.y );
});

var ServerView = extend(ThingView, function(subject){

    this.initDomFromTemplate( 'places', 'server', subject);
    
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
});

var ClientView = extend(ThingView, function(subject){
    this.initDomFromTemplate( 'places', 'client', subject);
    
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
    
    subject.events('receive').on(function( packet ){
        addClass(this.jDom, 'received-' + packet.name); 
    }.bind(this));
});