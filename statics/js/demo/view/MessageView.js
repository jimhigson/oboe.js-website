var MessageView = extend(ThingView, function(message, demoView){
    "use strict";
    
    ThingView.apply(this,arguments);
    
    this.initDomFromTemplate('messages', 'message', message.name);
    this.jDom.hide();

    message.events('startMove').on(function(xyFrom, xyTo, duration){
        this.jDom.show();
        this.goToXy(   'lineX2', 'lineY2', xyFrom);
        this.animateXy('lineX1', 'lineY1', xyFrom, xyTo, duration);
    }.bind(this));

    message.events('endMove').on(function(xyFrom, xyTo, duration){

        this.animateXy('lineX2', 'lineY2', xyFrom, xyTo, duration);
    }.bind(this));
        
    var remove = function(){
        this.jDom.remove();
    }.bind(this);
    
    message.events('reset').on(remove);
    message.events('done').on(remove);
});

MessageView.factory = function( message, demoView ){
    
    // at the moment, message visualisation is only supported on
    // transmissions over cables:
    if( message.holder.medium == 'cable' ) {
        return new MessageView(message, demoView);
    }

}
