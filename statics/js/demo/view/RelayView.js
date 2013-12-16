var RelayView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate( 'places', 'tower', subject.name);
    this.moveTo(subject.locations.where);
});