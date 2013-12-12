var MessageView = extend(ThingView, function(subject, demoView){
    ThingView.apply(this,arguments);

    this.initDomFromTemplate('messages', 'message', subject.name);
    this.jDom.hide();

    subject.events('startMove').on(function(xyFrom, xyTo, duration){
        this.jDom.show();
        goToXy(   this.jDom, 'lineX2', 'lineY2', xyFrom);
        animateXy(this.jDom, 'lineX1', 'lineY1', xyFrom, xyTo, duration);
    }.bind(this));

    subject.events('endMove').on(function(xyFrom, xyTo, duration){

        animateXy(this.jDom, 'lineX2', 'lineY2', xyFrom, xyTo, duration);
    }.bind(this));

    subject.events('reset').on(function(){
        this.jDom.remove();
    }.bind(this));
});