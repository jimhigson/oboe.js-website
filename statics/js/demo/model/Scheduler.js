var Scheduler = (function(){
    "use strict";

    var DEFAULT_SCHEDULE_DELAY = 500;

    function Scheduler(subject, pauseEventSource) {
        this.tasks = [];
        this.subject = subject;

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
    
    Scheduler.prototype.schedule = function(fn, requestedTiming, startPaused) {

        if( requestedTiming == Number.POSITIVE_INFINITY ) {
            // Waiting forever to do something is interpreted
            // as never doing it. The browser would natural
            // schedule it straight away (silly!)
            return undefined;
        }

        var wait = (requestedTiming === undefined)
                    ? DEFAULT_SCHEDULE_DELAY
                    : requestedTiming,
           
            performTask = function(){
                // stop remembering this timeout, it is done now:
                this._removeTask(task);
                fn();
            }.bind(this),

            task = {
                performTask: performTask,
                wait: wait
            };

        if( !startPaused ) {
            this._scheduleTask(task);
        }
        
        this.tasks.push( task );
    
        return task;
    };

    Scheduler.prototype._pauseTask = function(task){

        window.clearTimeout(task.timeout);
        task.wait = task.performTime - Date.now();
    };
    
    Scheduler.prototype._scheduleTask = function(task){
        task.timeout = window.setTimeout(task.performTask, task.wait);
        task.performTime = Date.now() + task.wait;
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
