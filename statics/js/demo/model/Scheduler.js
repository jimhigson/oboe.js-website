var Scheduler = (function(){
    "use strict";

    var DEFAULT_SCHEDULE_DELAY = 500;

    function Scheduler(thing, pauseEventSource) {
        this.tasks = [];
        this.thing = thing;

        pauseEventSource('paused').on(this._pause.bind(this));
        pauseEventSource('unpaused').on(this._unpause.bind(this));
    }

    Scheduler.prototype._pause = function(){
        this.tasks.forEach(this._pauseTask);
    };
    
    Scheduler.prototype._unpause = function(){
        this.tasks.forEach(this._scheduleTask);
    };
        
    Scheduler.prototype._removeTask = function(taskToRemove){

        this.tasks = this.tasks.filter(function( storedTimeout ){
            return storedTimeout !== taskToRemove;
        });
    };
    
    Scheduler.prototype.cancelTimeouts = function(){
    
        // cancel all scheduled events:
        this.tasks.forEach(function(task){
            window.clearTimeout(task.timeout);
        });
    
        this.tasks = [];
    };
    
    Scheduler.prototype.schedule = function(fn, requestedTiming) {

        if( requestedTiming == Number.POSITIVE_INFINITY ) {
            // Waiting forever to do something is interpreted
            // as never doing it. The browser would natural
            // schedule it straight away (silly!)
            return undefined;
        }

        var wait = (requestedTiming === undefined)
                    ? DEFAULT_SCHEDULE_DELAY
                    : requestedTiming,

            performTime = Date.now() + wait,
            
            performTask = function(){
                // stop remembering this timeout, it is done now:
                this._removeTask(task);
                fn();
            }.bind(this),

            task = this._scheduleTask({
                performTask: performTask,
                performTime: performTime,
                wait: wait
            });
        
        this.tasks.push( task );
    
        return task;
    };

    Scheduler.prototype._pauseTask = function(task){
        window.clearTimeout(task.timeout);
        task.wait = task.performTime - Date.now();        
    };
    
    Scheduler.prototype._scheduleTask = function(task){
        task.timeout = window.setTimeout(task.performTask, task.wait);
        return task;
    };
    
    Scheduler.prototype.unschedule = function(unscheduledTask) {
        
        if( unscheduledTask ) {
            window.clearTimeout(unscheduledTask.timeout);
            this._removeTask(unscheduledTask);
        }
    };

    return Scheduler;
})();
