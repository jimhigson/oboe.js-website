var MessageView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate('messages', 'message', subject.name);
    this.jDom.hide();

    subject.events('startMove').on(function(xyFrom, xyTo, duration){
        this.jDom.show();
        this.goToXy(   'lineX2', 'lineY2', xyFrom);
        this.animateXy('lineX1', 'lineY1', xyFrom, xyTo, duration);
    }.bind(this));

    subject.events('endMove').on(function(xyFrom, xyTo, duration){

        this.animateXy('lineX2', 'lineY2', xyFrom, xyTo, duration);
    }.bind(this));
        
    var remove = function(){
        this.jDom.remove();
    }.bind(this);
    
    subject.events('reset').on(remove);
    subject.events('done').on(remove);
});