var BarrierView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate( 'barriers', 'barrier', subject.name);
    this.moveTo(subject.locations.where);
    this.jDom.hide();
    
    subject.events('activated').on(function(){
        this.jDom.show();        
    }.bind(this));

    subject.events('reset').on(function(){
        this.jDom.hide();        
    }.bind(this));
});