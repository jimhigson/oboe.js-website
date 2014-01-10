var Thing = (function(){
    "use strict";
        
    function Thing(name, locations, options){
    
        this.name = name;
        this.events = pubSub();
        this.locations = locations || {};

        this.scheduler = new Scheduler(this, this.events);

       if (options) {
          this.label = options.label;
          this.startHidden = options.startHidden;
       }
        
        this.events('reset').on(function(){
            this.scheduler.cancelTimeouts();
        }.bind(this));
    }

    Thing.newEvent = 'Thing';
    
    Thing.prototype.with = {};
       
    Thing.prototype.inDemo = function(demo){
       
        this.demo = demo;
        
        var thisEvents = this.events,
            demoEvents = demo.events;

        demoEvents('reset').on(     thisEvents('reset').emit    );
        demoEvents('paused').on(    thisEvents('paused').emit   );
        demoEvents('unpaused').on(  thisEvents('unpaused').emit );

        return this; // chaining
    };

    /** for short-lived Things. Unregister listeners */
    Thing.prototype.done = function(){
       
       this.events('done').emit();
       
       var thisEvents = this.events,
           demoEvents = this.demo.events;
       
       // unsubscribe from events on the demo
       demoEvents('reset').un(     thisEvents('reset').emit    );
       demoEvents('paused').un(    thisEvents('paused').emit   );
       demoEvents('unpaused').un(  thisEvents('unpaused').emit );

       return this; // chaining       
    };
    
    Thing.prototype.followingScript = function(scriptItems){

        var self = this,
            script = this.demo.script;

        scriptItems.forEach(function(scriptItem){

            var action = scriptItem.action,
                wrappedAction =
                    scriptItem.delay
                    ?   function(){
                            self.schedule(action, scriptItem.delay);
                        }
                    :   action.bind(self);
            
            script(scriptItem.eventName).on(wrappedAction);
        });
        
        return this; // chaining
    };
    
    Thing.prototype.announce = function() {

        if( !this.constructor.newEvent ) {
            throw new Error('cannot announce type without .newEvent set');
        }
        
        this.demo.events(this.constructor.newEvent).emit(this);
        return this;
    };
    
    function scriptName( firstParty, action, secondParty ) {
        
        function name(thing){
            return (thing && (thing.name || thing.toString()));
        }
        
        return [firstParty, action, secondParty]
            .map(name)
            .filter(function(a){return a !== undefined})
            .join('_');
    }
    
    Thing.prototype.addToScript = function(verb, secondParty) {

       var scriptEventName = scriptName(this, verb, secondParty);
             
       this.demo
            .script(scriptEventName)
            .emit();
    };
    
    Thing.prototype.cancelTimeouts = function(){
        return this.scheduler.cancelTimeouts();
    };
    
    Thing.prototype.schedule = function(fn, requestedTiming) {
        return this.scheduler.schedule(fn.bind(this), requestedTiming, this.demo.paused);
    };
    
    Thing.prototype.unschedule = function(unscheduledTimeout) {
        return this.scheduler.unschedule(unscheduledTimeout);
    };
    
    Thing.asFunction = function (givenValue, defaultValue) {

        if (typeof givenValue == 'function') {
            return givenValue;
        }

        var constantValue = ( givenValue !== undefined )? givenValue : defaultValue;

        return function(){return constantValue};
    };

    return Thing;
}());
