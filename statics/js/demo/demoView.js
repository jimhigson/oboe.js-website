
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

function stampFromTemplate(jTemplate, klass) {
    if( !jTemplate.length )
        throw new Error('no template');
    
    var copy = jTemplate.children().clone();
    // jQuery doesn't like addClass on SVG...
    if( klass )
        addClass(copy, klass);
    
    return copy;
}

function transformToLocation(location){
    return 'translate(' + location.x + ',' + location.y + ')';
}

function ThingView(subject, demoView) {
    this.subject = subject;
    this.demoView = demoView;
}

ThingView.prototype.initDomFromTemplate = function(containerName, templateName, subject) {
    this.jDom = stampFromTemplate($('#' + templateName), subject.name);
    
    var jContainer = this.demoView.jDom.find('.' + containerName);
    
    if( jContainer.length != 1 ) {
        throw new Error('no one place to put the thing');
    }
    jContainer.append(this.jDom);
    return this.jDom;
};

var DemoView = extend(ThingView, function(subject){
    ThingView.apply(this,arguments);

    this.jDom = stampFromTemplate($('#demo'));
    
    var containerDiv = $("div[data-demo=" + subject.name + "]"),
        jControls = this.jDom.find('.controls'),
        jLightbox = jControls.find('.lightbox'),
        jReset = jControls.find('.reset').hide();
    
    containerDiv.append( this.jDom );

    Packet.new.on( function(newPacket){
        
        if( newPacket.demo == subject )        
            new PacketView(newPacket, this);
        
    }.bind(this));
    
    jLightbox.one('click', function(){
                
        jLightbox.fadeOut();
        jLightbox.promise().done( function(){
            window.setTimeout( function(){
                subject.start();
            }, 500);
        });

        jReset.fadeIn();
    });

    jReset.click(function(){
        subject.reset();
    });
});

var PacketView = extend(ThingView, function (subject, demoView) {
    ThingView.apply(this,arguments);
    
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

var WireView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);
    
    this.initDomFromTemplate( 'wires', 'wire', subject);
    
    this.jDom.attr('x1', subject.locations.downstream.x );
    this.jDom.attr('y1', subject.locations.downstream.y );
    this.jDom.attr('x2', subject.locations.upstream.x );
    this.jDom.attr('y2', subject.locations.upstream.y );
});

var ServerView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);
    
    this.initDomFromTemplate( 'places', 'server', subject);
    
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
});

var ClientView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);
    
    this.initDomFromTemplate( 'places', 'client', subject);
    
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
    
    subject.events('receive').on(function( packet ){
        addClass(this.jDom, 'received-' + packet.name);        
    }.bind(this));

    subject.events('reset').on(function(){
        var ele = this.jDom[0],
            oldClassAttr = ele.getAttribute('class'),
            newClassAttr = oldClassAttr.replace(/received-response\d/g, '');
        
        this.jDom[0].setAttribute('class', newClassAttr);
    }.bind(this));
});