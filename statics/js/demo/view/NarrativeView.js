var NarrativeView = (function () {

    var NarrativeView = extend(ThingView, function NarrativeView(demo, demoView) {
        ThingView.apply(this, arguments);        
    });

    NarrativeView.displayItem = function( narrativeItem ){
    };
    
    NarrativeView.newEvent = 'NarrativeView';

    return NarrativeView;
}());
