
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
    return this; //chaining
};
Thing.prototype.announce = function() {
    this.constructor.new.emit(this);
    return this;
};