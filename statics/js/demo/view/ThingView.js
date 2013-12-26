var ThingView = (function(){
    "use strict";
    
    var FLASH_DURATION = 200;
    
    function ThingView(subject, demoView) {
        this.subject = subject;
        this.demoView = demoView;
        subject.hasView(this);
    }
    
    ThingView.prototype.find = function(selector) {
        return this.demoView.jDom.find(selector);
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
    }
    
    ThingView.prototype.flash = function( jEle, klass ) {
    
        addClass( jEle, klass );
    
        window.setTimeout(function(){
            removeClass( jEle, klass );
        }, FLASH_DURATION);
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
    };

    return ThingView;
}());
