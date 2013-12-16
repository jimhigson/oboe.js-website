var Barrier = (function(){
    
    var Barrier = extend(Thing, function(name, locations){
        Thing.apply(this, arguments);
    });
    
    Barrier.prototype.activate = function(){
        this.events('activated').emit();
    };
    
    return Barrier;
}());