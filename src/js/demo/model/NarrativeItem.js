var NarrativeItem = (function(){
    
    var NarrativeItem = extend(Thing, function NarrativeItem(scriptEventName, _locations, options){
        Thing.apply(this, arguments);
        
        this.text = options.text;
        this.locationOnTopic = options.locationOnTopic;
    });
    
    NarrativeItem.prototype.with = {
        topic: function( topicItem ){
            this.topic = topicItem;
        }
    };    
    
    NarrativeItem.newEvent = 'NarrativeItem';

    NarrativeItem.prototype.popUp = function(){
        this.demo.pause();
        this.events('activated').emit(this);
    };

    NarrativeItem.prototype.dismiss = function(){
        this.demo.unpause();
        this.events('deactivated').emit(this);
    };
    
    return NarrativeItem;
}());


