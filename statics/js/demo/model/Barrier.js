var Barrier = (function(){
    
    var Barrier = extend(Thing, function(name, locations){
        Thing.apply(this, arguments);
    });
    
    Barrier.prototype.appear = function(){
        console.log(this);
    };
    
    return Barrier;
}());