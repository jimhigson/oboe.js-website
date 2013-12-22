
var Demo = extend(Thing, function Demo(name, options){
    Thing.apply(this, arguments);

    this.height = options.height;    
    this.script = pubSub();
    this.colors = options.colors || 'categorical';
    
    this.demo = this;  // we are our own demo
});

Demo.newEvent = 'Demo';

Demo.prototype.start = function(){
    this.startSimulation();
};
Demo.prototype.reset = function(){
    this.events('reset').emit();
};
