var Thing = (function(){
    var DEFAULT_SCHEDULE_DELAY = 500;
    
    function Thing(name, locations){
    
        this.name = name;
        this.events = pubSub();
        this.locations = locations || {};
        this.timeouts = [];
        
        this.events('reset').on(function(){
            this.cancelTimeouts();
        }.bind(this));
    }

    Thing.newEvent = 'Thing';
    
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
    };
    
    Thing.prototype.schedule = function(fn, requestedTiming) {

        scheduleTiming  = (requestedTiming === undefined)
                        ? DEFAULT_SCHEDULE_DELAY 
                        : requestedTiming
                        ;
        
        if( scheduleTiming == Number.POSITIVE_INFINITY ) {
            // Waiting forever to do something interpreted
            // as never doing it. The browser would natural
            // schedule it straight away (silly!)
            return undefined;
        }

        var timeout = window.setTimeout(function(){

            // stop remembering this timeout, it is done now:
            this.removeTimeout(timeout);
            fn.apply(this);

        }.bind(this), scheduleTiming);

        this.timeouts.push( timeout );

        return timeout;
    };
    
    Thing.prototype.unschedule = function(unscheduledTimeout) {

        window.clearTimeout(unscheduledTimeout);
        this.removeTimeout(unscheduledTimeout);
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
