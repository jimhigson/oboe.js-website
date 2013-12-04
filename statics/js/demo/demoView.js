/* allow svg properties to be set like css by jQuery. Apply a simple
 * idea of SVG transforms that ignores order and other transforms */
 $.cssHooks.translateX = {
    get: function( elem, computed, extra ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            return 0;
        }
        return baseVal.getItem(0).matrix.e;
    },
    set: function( elem, value ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            elem.setAttribute('transform', 'translate(0,0)')
        }
        baseVal.getItem(0).matrix.e = value; 
    }
};
$.cssHooks.translateY = {
    get: function( elem, computed, extra ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            return 0;
        }        
        return baseVal.getItem(0).matrix.f;
    },
    set: function( elem, value ) {
        var baseVal = elem.transform.baseVal;
        if( !baseVal.numberOfItems ) {
            elem.setAttribute('transform', 'translate(0,0)')
        }
        baseVal.getItem(0).matrix.f = value;
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
    
    var jCopy = jTemplate.children().clone();
    // jQuery doesn't like addClass on SVG...
    if( klass )
        addClass(jCopy, klass);
    
    return jCopy;
}

function transformToLocation(location){
    return 'translate(' + location.x + ',' + location.y + ')';
}

function ThingView(subject, demoView) {
    this.subject = subject;
    this.demoView = demoView;
}

ThingView.prototype.initDomFromTemplate = function(containerName, templateName, className) {
    this.jDom = stampFromTemplate($('#' + templateName), className);
    
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
    
    var containerDiv = $("[data-demo=" + subject.name + "]"),
        jControls = this.jDom.find('.controls'),
        jLightbox = jControls.find('.lightbox'),
        jReset = jControls.find('.reset').hide();
    
    containerDiv.append( this.jDom );

    Packet.new.on( function(newPacket){
        
        if( newPacket.demo == subject )        
            new PacketView(newPacket, this);
        
    }.bind(this));
    
    function listenForPlay(){
        jLightbox.one('click', function(){

            jLightbox.fadeOut();
            jLightbox.promise().done( function(){
                window.setTimeout( function(){
                    subject.start();
                }, 500);
            });

            jReset.fadeIn();

            listenForReset();
        });        
    }
    
    function listenForReset(){
        jReset.one('click', function(){
            
            subject.reset();
            jLightbox.fadeIn();
            jReset.fadeOut();
            listenForPlay();            
        });
    }
        
    listenForPlay();
});

function unitClass(packet) {
    return 'unit-' + (packet.ordering.i % 10);
}

var PacketView = extend(ThingView, function (subject, demoView) {
    ThingView.apply(this,arguments);
    
    function templateName(){
        switch(subject.type) {
            case 'GET':
                return 'getRequest';
            case 'JSON':
                return (   subject.ordering.isFirst
                    ?   'firstPacket'
                    :       (   subject.ordering.isLast
                    ?   'lastPacket'
                    :   'packet'
                    )
                );
        }        
    }
        
    var className = [   
        subject.name
        // since we only have categorical colours...
    ,   unitClass(subject)
    ].join(' ');
    
    this.initDomFromTemplate( 
            'packets', 
            templateName(),
            className
    );

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
    
    this.initDomFromTemplate( 'wires', 'wire', subject.name);
    
    this.jDom.attr('x1', subject.locations.downstream.x );
    this.jDom.attr('y1', subject.locations.downstream.y );
    this.jDom.attr('x2', subject.locations.upstream.x );
    this.jDom.attr('y2', subject.locations.upstream.y );
});

var ServerView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);
    
    this.initDomFromTemplate( 'places', 'server', subject.name);
    
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
});

var ClientView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);
    
    var templateName = 'client-' + subject.page;
    this.initDomFromTemplate( 'places', templateName, subject.name);
    
    this.jDom.attr('transform', transformToLocation(subject.locations.where));
    
    clientPage(subject.page, this.jDom, subject.events);
});

function clientPage(pageName, jDom, events) {
    function singlePageSite(){        
        events('receive').on(function( packet ){
            addClass(jDom, 'received-' + packet.ordering.i);
        });
        
        events('reset').on(function(){
            var ele = jDom[0],
                oldClassAttr = ele.getAttribute('class'),
                newClassAttr = oldClassAttr.replace(/received-\d/g, '');

            ele.setAttribute('class', newClassAttr);
        });        
    }
    
    function twitter(){
        var jTweetTemplate = $('#tweet'),
            jTweetScroll = jDom.find('.tweetsScroll'),
            packetsReceived = 0,
            livePacketsReceived = 0,
            MAX_DISPLAYABLE = 5;

        events('receive').on(function( packet ){

            packetsReceived++;
            
            if( packet.mode == 'live' ) {
                livePacketsReceived++;
            }
            
            var jTweet = stampFromTemplate(jTweetTemplate, unitClass(packet)),                
                tweetOffset = (packetsReceived-1) * 22
                scrollOffset = (livePacketsReceived) * 22
            
            if( packet.mode == 'live' ) {
                jTweetScroll.append(jTweet);
                jTweet.css({'translateY': -scrollOffset});
                jTweetScroll.animate({'translateY': scrollOffset});
            } else {
                jTweetScroll.prepend(jTweet);
                jTweet.css({'translateY': tweetOffset});
            }
            
            // prevent an infinite DOM from being built by removing tweets which
            // will never be seen again:
            if( packetsReceived > MAX_DISPLAYABLE ) {
                jTweetScroll.find('.tweet:first-child').remove();
            }
        });

        events('reset').on(function(){
            packetsReceived = 0;
            livePacketsReceived = 0;
            jTweetScroll
                .stop(true)
                .css({'translateY': 0})
                .empty();
        });
    }
    
    switch(pageName){
        case "twitter":
            return twitter();
        case "singlePageSite":
            return singlePageSite();
        default:
            throw Error("unknown page type " + pageName);
    }
}