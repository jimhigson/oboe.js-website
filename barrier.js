module.exports = function barrier(whenDone) {

    var requiredCallbacks = 0,
        doneCallbacks = 0,
        startTime = Date.now();
   
    var instance = {
        add:function(fn){
            requiredCallbacks++;

            return function(){
                fn.apply(this,arguments);
                doneCallbacks++;

                if( requiredCallbacks === doneCallbacks ) {
                    instance.duration = Date.now() - startTime;
                    whenDone();
                }
            }
        }
    };
   
    return instance;
};
