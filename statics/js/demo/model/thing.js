
function Thing(name, locations){

    this.name = name;
    this.events = pubSub();
    this.locations = locations || {};
}
Thing.prototype.reset = function(){
};
Thing.prototype.inDemo = function(demo){
    this.demo = demo;
    this.demo.events('reset').on(function(){
        this.reset();
        this.events('reset').emit();
    }.bind(this));
    return this; // chaining
};
Thing.prototype.followingScript = function(script){
    
    for(var eventName in script ){
        var action = script[eventName];
        
        this.demo.script(eventName).on(action.bind(this));
    }
    return this; // chaining
}
Thing.prototype.announce = function() {
    this.constructor.new.emit(this);
    return this;
};
Thing.prototype.addToScript = function(verb, thirdParty) {
    var eventName = [this.name, verb, (thirdParty && thirdParty.name)]
                        .filter(function(a){return !!a})
                        .join('_');
        
    this.demo.script(eventName).emit();
};
