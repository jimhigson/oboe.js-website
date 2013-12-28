var Scheduler = (function(){
    "use strict";

    var DEFAULT_SCHEDULE_DELAY = 500;
    
    function Scheduler() {
        this.timeouts = [];
    }

    Scheduler.prototype._removeTimeout = function(timeout){

        this.timeouts = this.timeouts.filter(function( storedTimeout ){
            return storedTimeout != timeout;
        });
    };
    
    Scheduler.prototype.cancelTimeouts = function(){
    
        // cancel all scheduled events:
        this.timeouts.forEach(function(timeout){
            window.clearTimeout(timeout);
        });
    
        this.timeouts = [];
    };
    
    Scheduler.prototype.schedule = function(fn, requestedTiming) {
    
        var scheduleTiming  = (requestedTiming === undefined)
                ? DEFAULT_SCHEDULE_DELAY
                : requestedTiming
            ;
    
        if( scheduleTiming == Number.POSITIVE_INFINITY ) {
            // Waiting forever to do someSchedule interpreted
            // as never doing it. The browser would natural
            // schedule it straight away (silly!)
            return undefined;
        }
    
        var timeout = window.setTimeout(function(){
    
            // stop remembering this timeout, it is done now:
            this._removeTimeout(timeout);
            fn();
    
        }.bind(this), scheduleTiming);
    
        this.timeouts.push( timeout );
    
        return timeout;
    };
    
    Scheduler.prototype.unschedule = function(unscheduledTimeout) {
    
        window.clearTimeout(unscheduledTimeout);
        this._removeTimeout(unscheduledTimeout);
    };

    return Scheduler;
})();
