var MessageView = extend(ThingView, function(message, demoView){
    "use strict";
    
    ThingView.apply(this,arguments);
    
    var jContainer = this.find('.messages');
   
    // jDom is two-element selection of inner and outer part
    this.jDom = stampFromTemplate($('#message'), message.name);
    this.jPausibleElements = this.jDom;

    jContainer.find('.inners').append(this.jDom.filter('.messageInner'));
    jContainer.find('.outers').append(this.jDom.filter('.messageOuter'));
   
    this.jDom.hide();

    message.events('requestStartMove').on(function(xyFrom, xyTo, duration){
        this.jDom.show();
        this.goToXy(   'lineX1', 'lineY1', xyFrom);
        this.animateXy('lineX2', 'lineY2', xyFrom, xyTo, duration);
    }.bind(this));

    message.events('responseCloseMove').on(function(xyFrom, xyTo, duration){

        this.animateXy('lineX2', 'lineY2', xyFrom, xyTo, duration);
    }.bind(this));
        
    var remove = function(){
        this.jDom.remove();
    }.bind(this);
    
    message.events('done').on(remove);
});

MessageView.factory = function( message, demoView ){
    
    // at the moment, message visualisation is only supported on
    // transmissions over cables:
    if( message.holder.medium == 'cable' ) {
        return new MessageView(message, demoView);
    }
};
