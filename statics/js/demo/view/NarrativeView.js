var NarrativeView = (function () {

    var NarrativeView = extend(ThingView, function NarrativeView(demo, demoView) {
        ThingView.apply(this, arguments);
        
        this.jDom = 
            demoView.jDom.find('.narrative')
               .add( demoView.jDom.filter('.narrative') )
               .hide();
    });

    NarrativeView.prototype.scaleAt = function( jEle ){
       // bit of a hack here:
       return jEle.parents('[data-scale]').attr('data-scale');
    }

    NarrativeView.prototype.captionPosition = function( highlightPosition ){
       
       var DEMO_WIDTH = 500,// TODO: DRY!
           HIGHLIGHT_SIZE = 100;
           highlightFromLeft = highlightPosition.x,
           highlightFromRight = DEMO_WIDTH - highlightFromLeft; 
       
       if( highlightFromLeft > (DEMO_WIDTH/2) ) {
          //highlight to the right;
          return {
             x:highlightFromRight + HIGHLIGHT_SIZE,
             edge:'right'
          };
       } else {
          //highlight to the left;
          return {
             x:highlightFromLeft + HIGHLIGHT_SIZE,
             edge:'left'
          };
       }
    };
   
    NarrativeView.prototype.positionLightboxHighlightAt = function( location ){
              
       function oppositeDirection(d){
          return d=='left'? 'right' : 'left';
       }
       
       var jLightbox = this.jDom.filter('.lightbox');
       this.putAtXy(jLightbox, 'translateX', 'translateY', location);
      
       var captionLocation = this.captionPosition(location);
       
       var jDemoCaption = this.jDom.filter('div.narrative'),

           // adjust the caption position according to the scale of the highlight:
           scale = this.scaleAt(jLightbox);
       
       jDemoCaption.css( captionLocation.edge, captionLocation.x * scale);
       jDemoCaption.css( oppositeDirection( captionLocation.edge), '' );
       jDemoCaption.css( 'text-align', captionLocation.edge );
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

        this.jDom.filter('.demoCaption').one('click', function(){
           
            narrativeItem.dismiss();
            return false;
        });
    };

    NarrativeView.prototype.hideItem = function(){
        // event handler might still be on the element if narrative was 
        // dismissed in some way other than clicking the 'dismiss' link,
        // for example by clicking 'reset' 
        this.jDom.filter('.demoCaption').off();
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
