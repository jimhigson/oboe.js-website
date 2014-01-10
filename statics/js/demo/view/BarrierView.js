var BarrierView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate( 'barriers', 'barrier', subject.name);
    this.moveTo(subject.locations.where);
    
    var jClipPathContents = this.jDom.find('clipPath').children();
    this.putAtXy(jClipPathContents, 'translateX', 'translateY', subject.locations.where); 
    
    this.hide();
       
    subject.events('activated').on(function(){
        this.jDom.show();
    }.bind(this));

    subject.events('deactivated').on(this.hide.bind(this));
    subject.events('reset').on(this.hide.bind(this));
});
