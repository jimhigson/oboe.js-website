var ServerView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate( 'places', 'server', subject.name);

    this.moveTo( subject.locations.where );
});