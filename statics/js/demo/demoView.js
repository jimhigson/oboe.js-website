

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

ThingView.prototype.moveTo = function(where) {
    this.jDom.css({
        translateX: where.x
    ,   translateY: where.y
    });
    
    return this; // chaining
};

var DemoView = extend(ThingView, function(subject){
    ThingView.apply(this,arguments);

    this.jDom = stampFromTemplate($('#demo'));
        
    var containerDiv = $("[data-demo=" + subject.name + "]"),
        jControls = this.jDom.find('.controls'),
        jLightbox = jControls.find('.lightbox'),
        jReset = jControls.find('.reset').hide();

    if( subject.height ){
        // this should really be more template-esque
        // but can't find a tempting engine that handles
        // SVG elements well. Need to find a DOM-based engine
        // that starts by doing Element.clone().
        this.jDom.attr('height', subject.height);
        this.jDom.find('.fade').attr('height', subject.height);
        
        // The container div should have the height set on
        // the server-side to avoid the page reflowing.
        containerDiv.css('height', subject.height);
        this.jDom.find('.reset').attr('y', subject.height - 10);
        this.jDom.find('.play').attr('y', subject.height / 2);
    }
    
    containerDiv.append( this.jDom );

    Packet.new.on( function(newPacket){
        
        if( newPacket.demo == subject )        
            new PacketView(newPacket, this);
        
    }.bind(this));
    
    Message.new.on(function(newMessage){
        if( newMessage.demo == subject ) {
            new MessageView(newMessage, this);
        }
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

    subject.events('move').on(function( xyFrom, xyTo, duration ){
        
        animateXy(this.jDom, 'translateX', 'translateY', xyFrom, xyTo, duration)

    }.bind(this));
    
    subject.events('done').on(function(){
        this.jDom.remove();
    }.bind(this));
});

function goToXy( jDom, xProperty, yProperty, xy ) {
    var cssObject = {};
    
    cssObject[xProperty] = xy.x;
    cssObject[yProperty] = xy.y;

    jDom.css(cssObject);
}

function animateXy( jDom, xProperty, yProperty, xyFrom, xyTo, duration ) {

    goToXy(jDom, xProperty, yProperty, xyFrom);
    
    var toCssObject = {};
    toCssObject[xProperty]   = xyTo.x;
    toCssObject[yProperty]   = xyTo.y;

    jDom.animate(toCssObject, {duration:duration, queue:false});
}

var MessageView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate('messages', 'message', subject.name);
    this.jDom.hide();
    
    subject.events('startMove').on(function(xyFrom, xyTo, duration){
        this.jDom.show();        
        goToXy(   this.jDom, 'lineX2', 'lineY2', xyFrom);
        animateXy(this.jDom, 'lineX1', 'lineY1', xyFrom, xyTo, duration);
    }.bind(this));
    
    subject.events('endMove').on(function(xyFrom, xyTo, duration){

        animateXy(this.jDom, 'lineX2', 'lineY2', xyFrom, xyTo, duration);
    }.bind(this));

    subject.events('reset').on(function(){
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
    
    this.moveTo( subject.locations.where );
});

var ClientView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);
    
    var templateName = 'client-' + subject.page;
    this.initDomFromTemplate( 'places', templateName, subject.name);
    
    this.moveTo(subject.locations.where);
    
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