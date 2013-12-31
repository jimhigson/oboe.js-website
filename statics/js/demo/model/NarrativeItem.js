var NarrativeItem = (function(){
    
    var NarrativeItem = extend(Thing, function NarrativeItem(scriptEventName){
        Thing.apply(this, arguments);
    });
    
    NarrativeItem.prototype.with = {
        topic: function( topicItem ){
            this.topic = topicItem;
        }
    };    
    
    NarrativeItem.newEvent = 'NarrativeItem';

    NarrativeItem.prototype.popUp = function(){
        this.events('activated').emit(this);
    };

    NarrativeItem.prototype.dismiss = function(){
    };
    
    
    return NarrativeItem;
}());


