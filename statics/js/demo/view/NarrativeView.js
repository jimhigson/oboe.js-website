var NarrativeView = (function () {

    var NarrativeView = extend(ThingView, function NarrativeView(demo, demoView) {
        ThingView.apply(this, arguments);
        
        this.jDom = demoView.jDom.find('.lightbox').hide();
    });

    NarrativeView.prototype.positionHighlightAt = function( location ){
        this.goToXy('translateX', 'translateY', location);
    };
    
    NarrativeView.prototype.showItem = function( narrativeItem ){
        this.positionHighlightAt(narrativeItem.topic.locations.where);
        this.jDom.show();
    };
    
    NarrativeView.prototype.displayItem = function( narrativeItem ){

        var jLightbox = this.jDom;

        narrativeItem.events('activated').on(this.showItem.bind(this));

        narrativeItem.events('deactivated').on(function(){
            jLightbox.hide();
        });

        jLightbox.click(function(){
            narrativeItem.dismiss();
        });
    };
    
    NarrativeView.newEvent = 'NarrativeView';

    return NarrativeView;
}());
