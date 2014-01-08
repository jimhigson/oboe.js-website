var NarrativeView = (function () {

    var NarrativeView = extend(ThingView, function NarrativeView(demo, demoView) {
        ThingView.apply(this, arguments);
        
        this.jDom = 
            demoView.jDom.find('.narrative')
               .add( demoView.jDom.filter('.narrative') )
               .hide();
    });

    NarrativeView.prototype.positionLightboxHighlightAt = function( location ){
       
       var jLightbox = this.jDom.filter('.lightbox');
       this.putAtXy(jLightbox, 'translateX', 'translateY', location);

       var jDemoCaption = this.jDom.filter('div.narrative');
       this.putAtXy(jDemoCaption, 'left', 'top', location);       
    };

    NarrativeView.prototype.showText = function( text ){
       this.jDom.find('.label').text(text);
    };   
    
    NarrativeView.prototype.showItem = function( narrativeItem ){
        var text = narrativeItem.text,
            topic = narrativeItem.topic,
            locationOnTopic = narrativeItem.locationOnTopic,
            location = topic.locations[locationOnTopic];
       
        this.showText(text);
        this.positionLightboxHighlightAt(location);
        this.jDom.fadeIn();

        this.jDom.find('.dismiss').one('click', function(){
           
            narrativeItem.dismiss();
            return false;
        });
    };

    NarrativeView.prototype.hideItem = function(){
        // event handler might still be on the element if narrative was 
        // dismissed in some way other than clicking the 'dismiss' link,
        // for example by clicking 'reset' 
        this.jDom.find('.dismiss').off();
        this.jDom.fadeOut();
    };
    
    NarrativeView.prototype.displayItem = function( narrativeItem ){

        narrativeItem.events('activated').on(this.showItem.bind(this));

        narrativeItem.events('reset').on(this.hideItem.bind(this));
        narrativeItem.events('deactivated').on(this.hideItem.bind(this));
    };
    
    NarrativeView.newEvent = 'NarrativeView';

    return NarrativeView;
}());
