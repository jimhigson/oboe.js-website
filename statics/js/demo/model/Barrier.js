var Barrier = (function(){
    
    var Barrier = extend(Thing, function(name, locations){
        Thing.apply(this, arguments);
        
        this.events('reset').on(function(){
            this.hasBeenShown = false;
        }.bind(this));
    });
    
    Barrier.prototype.activate = function(){
        this.events('activated').emit();
    };
    
    Barrier.prototype.activateIfNeverShownBefore = function(){
        
        if( !this.hasBeenShown ) {
            this.activate();
        }
        this.hasBeenShown = true;
    };

    Barrier.prototype.deactivate = function(){
        this.events('deactivated').emit();
    };    
    
    return Barrier;
}());
