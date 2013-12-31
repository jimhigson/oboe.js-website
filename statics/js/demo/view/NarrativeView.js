var NarrativeView = (function () {

    var NarrativeView = extend(ThingView, function NarrativeView(demo, demoView) {
        ThingView.apply(this, arguments);        
    });

    NarrativeView.prototype.displayItem = function( narrativeItem ){
        
        narrativeItem.events('activated').on(function( narrativeItem ){
            console.log('NarrativeView: time to show', narrativeItem);
        });
    };
    
    NarrativeView.newEvent = 'NarrativeView';

    return NarrativeView;
}());
