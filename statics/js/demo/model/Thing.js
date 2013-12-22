var Thing = (function(){
    function Thing(name, locations){
    
        this.name = name;
        this.events = pubSub();
        this.locations = locations || {};
        this.timeouts = [];
        
        this.events('reset').on(function(){
            this.cancelTimeouts();
        }.bind(this));
    }
    Thing.prototype.with = {};
    
    Thing.prototype.hasView = function(view){
        this.view = view;
    };
    
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
    };
    
    Thing.prototype.announce = function() {

        this.demo.events(this.constructor.name).emit(this);
        return this;
    };
    
    function scriptName( firstParty, action, secondParty ) {
        
        function name(thing){
            return (thing && (thing.name || thing.toString()));
        }
        
        return eventName = [firstParty, action, secondParty]
            .map(name)
            .filter(function(a){return !!a})
            .join('_');
    }
    
    Thing.prototype.addToScript = function(verb, secondParty) {
        
        this.demo
            .script(scriptName(this, verb, secondParty))
            .emit();
    };

    Thing.prototype.removeTimeout = function(timeout){

        this.timeouts = this.timeouts.filter(function( storedTimeout ){
            return storedTimeout != timeout;
        });
    };
    Thing.prototype.cancelTimeouts = function(){

        // cancel all scheduled events:
        this.timeouts.forEach(function(timeout){
            window.clearTimeout(timeout);
        });

        this.timeouts = [];
    }
    Thing.prototype.schedule = function(fn, time) {

        if( time == Number.POSITIVE_INFINITY ) {
            // Waiting forever to do something interpreted
            // as never doing it. The browser would natural
            // schedule it straight away (silly!)
            return undefined;
        }

        var timeout = window.setTimeout(function(){

            // stop remembering this timeout, it is done now:
            this.removeTimeout(timeout);
            fn.apply(this);

        }.bind(this), time);

        this.timeouts.push( timeout );

        return timeout;
    };
    Thing.prototype.unschedule = function(unscheduledTimeout) {

        window.clearTimeout(unscheduledTimeout);
        this.removeTimeout(unscheduledTimeout);
    };    
    
    return Thing;
}());
