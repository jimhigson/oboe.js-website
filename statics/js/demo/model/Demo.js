
var Demo = extend(Thing, function Demo(name, options){
    Thing.apply(this, arguments);

    this.height = options.height;    
    this.width = options.width;    
    this.script = pubSub();
    this.colors = options.colors;
    this.paused = false;
    this.running = false;
    
    if( options.endSimulationEvent ) {
       this.script( options.endSimulationEvent ).on(
          function(){
              this.schedule(this.reset.bind(this), 2500);
          }.bind(this)
       );
    }
    
    this.demo = this;  // we are our own demo
});

Demo.newEvent = 'Demo';

Demo.prototype.start = function(){
    this.startSimulation();
    this.events('started').emit();
    this.running = true;
};
Demo.prototype.reset = function(){
    this.events('reset').emit();
    this.paused = false;
    this.running = false;
};

Demo.prototype.pause = function(){
    this.paused = true;
    this.events('paused').emit();
};
Demo.prototype.unpause = function(){
    this.paused = false;
    this.events('unpaused').emit();
};


