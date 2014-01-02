var ThingView = (function(){
    "use strict";
    
    var FLASH_DURATION = 200;
    
    function ThingView(subject, demoView) {
        this.subject = subject;
        this.demoView = demoView;

        var demoEvents = this.subject.demo.events;
        
        demoEvents('paused').on(this.pause.bind(this));
        demoEvents('unpaused').on(this.unpause.bind(this));
    }

    ThingView.prototype.writeLabel = function() {
        if( this.subject.label )
            this.jDom.find('.label').text(this.subject.label);
    }
    
    ThingView.prototype.find = function(selector) {
        return this.demoView.jDom.find(selector);
    };

    ThingView.prototype.pause = function(){
        this.jPausibleElements && this.jPausibleElements.pause();
    };
    
    ThingView.prototype.unpause = function(){
        this.jPausibleElements && this.jPausibleElements.resume();
    };
    
    ThingView.prototype.stampContentsFromTemplate = function(containerSelector, templateName, className) {
        
        var jDom = stampFromTemplate($('#' + templateName), className),
            jContainer = this.find(containerSelector);
    
        if( jContainer.length != 1 ) {
            throw new Error('no one place to put the thing');
        }
        
        jContainer.append(jDom);
        return jDom;
    };
    
    ThingView.prototype.initDomFromTemplate = function(containerClass, templateName, className) {
        this.jDom = this.stampContentsFromTemplate('.' + containerClass, templateName, className);
        this.jPausibleElements = this.jDom;
        return this.jDom;
    };
    
    ThingView.prototype.moveTo = function(where) {
        this.jDom.css({
            translateX: where.x
        ,   translateY: where.y
        });
    
        return this; // chaining
    };

    ThingView.prototype.putAtXy = function(jEle, xProperty, yProperty, xy){
        var cssObject = {};
    
        cssObject[xProperty] = xy.x;
        cssObject[yProperty] = xy.y;
    
        jEle.css(cssObject);
    };
    
    ThingView.flash = function( jEle, klass ) {
    
        addClass( jEle, klass );
    
        window.setTimeout(function(){
            removeClass( jEle, klass );
        }, FLASH_DURATION);
    };
    ThingView.prototype.flash = function( klass ) {

        ThingView.flash(this.jDom, klass);
    };    
    
    ThingView.prototype.goToXy = function( xProperty, yProperty, xy ) {
        this.putAtXy(this.jDom, xProperty, yProperty, xy);
    };
    
    ThingView.prototype.animateXy = function( xProperty, yProperty, xyFrom, xyTo, duration ) {
    
        this.goToXy(xProperty, yProperty, xyFrom);
    
        var toCssObject = {};
        toCssObject[xProperty]   = xyTo.x;
        toCssObject[yProperty]   = xyTo.y;
    
        this.jDom.animate(toCssObject, {duration:duration, queue:false});

        this.pauseAnimationIfDemoPaused(this.jDom);
    };

    ThingView.prototype.pauseAnimationIfDemoPaused = function(jDom) {
        // To be used after a call to .animate() -  
        // If the demo is paused, start the animation as paused 
        // to be started later.
        
        if( this.subject.demo.paused ) {
            jDom.pause();
        }
    };

    return ThingView;
}());
