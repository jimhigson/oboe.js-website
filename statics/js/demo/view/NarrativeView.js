var NarrativeView = (function () {

    var NarrativeView = extend(ThingView, function NarrativeView(demo, demoView) {
        ThingView.apply(this, arguments);
        
        this.jDom = demoView.jDom.find('.lightbox').hide();
    });

    NarrativeView.prototype.displayItem = function( narrativeItem ){

        var jLightbox = this.jDom;

        narrativeItem.events('activated').on(function(){
            console.log('NarrativeView: time to show', narrativeItem);
            jLightbox.show();
        });

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
