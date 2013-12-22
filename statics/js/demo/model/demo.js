
var Demo = extend(Thing, function Demo(name, options){
    Thing.apply(this, arguments);

    this.height = options.height;
    
    this.script = pubSub();
    
    // we are our own demo
    this.demo = this;
});
Demo.prototype.start = function(){
    this.startSimulation();
};
Demo.prototype.reset = function(){
    this.events('reset').emit();
};
