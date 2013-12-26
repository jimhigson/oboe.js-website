var BarrierView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    var hide = function () {
        this.jDom.hide();
    }.bind(this);    
    
    this.initDomFromTemplate( 'barriers', 'barrier', subject.name);
    this.moveTo(subject.locations.where);
    
    var jClipPathContents = this.jDom.find('clipPath').children();
    this.putAtXy(jClipPathContents, 'translateX', 'translateY', subject.locations.where); 
    
    hide();
       
    subject.events('activated').on(function(){
        this.jDom.show();
    }.bind(this));

    subject.events('deactivated').on(hide);
    subject.events('reset').on(hide);
});
