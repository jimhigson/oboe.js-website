
var Demo = extend(Thing, function(name, options){
    Thing.apply(this, arguments);

    this.height = options.height;
});
Demo.prototype.start = function(){
    this.startSimulation();
};
Demo.prototype.reset = function(){
    this.events('reset').emit();
};
