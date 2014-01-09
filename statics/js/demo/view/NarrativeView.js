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
       
       var demoWidth = this.subject.demo.width,
           demoHeight = this.subject.demo.height,
           HIGHLIGHT_SIZE = 100,
           highlightFromLeft = highlightPosition.x,
           highlightFromRight = demoWidth - highlightPosition.x,
           highlightCloserToRight = (highlightPosition.x > (demoWidth / 2)),
           highlightCloserToBottom = (highlightPosition.y > (demoHeight / 2)),
           result = {};
       
       if( highlightCloserToRight ) {

          result.x = highlightFromRight + HIGHLIGHT_SIZE;
          result.horizontalSide = 'right';
       } else {

          result.x = highlightFromLeft + HIGHLIGHT_SIZE;
          result.horizontalSide = 'left';
       }

       if( highlightCloserToBottom ) {
          result.y = '15';
          result.verticalSide = 'bottom';
       } else {
          result.y = '15';
          result.verticalSide = 'top';
       }
       
       return result;
    };
   
    NarrativeView.prototype.positionLightboxHighlightAt = function( location ){
              
       function oppositeHorizontalDirection(d){
          return d=='left'? 'right' : 'left';
       }
       
       var jLightbox = this.jDom.filter('.lightbox');
       this.putAtXy(jLightbox, 'translateX', 'translateY', location);
      
       var captionLocation = this.captionPosition(location);
       
       var jDemoCaption = this.jDom.filter('div.narrative'),

           // adjust the caption position according to the scale of the highlight:
           scale = this.scaleAt(jLightbox);

       jDemoCaption.css( {left:'', right:'', top:'', bottom:''} )
                   .css( 'text-align', captionLocation.horizontalSide )
                   .css( captionLocation.horizontalSide, captionLocation.x * scale)
                   .css( captionLocation.verticalSide, captionLocation.y * scale);
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
