var BarrierView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate( 'barriers', 'barrier', subject.name);
    this.moveTo(subject.locations.where);
    
    var jClipPathContents = this.jDom.find('clipPath').children();
    this.putAtXy(jClipPathContents, 'translateX', 'translateY', subject.locations.where); 
    
    subject.events('activated').on(this.fadeIn.bind(this));
    subject.events('deactivated').on(this.fadeOut.bind(this));
   
    this.initHiding();
});
