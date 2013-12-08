module.exports = function barrier(whenDone) {

    var requiredCallbacks = 0,
        doneCallbacks = 0;

    return {
        add:function(fn){
            requiredCallbacks++;

            return function(){
                fn.apply(this,arguments);
                doneCallbacks++;

                if( requiredCallbacks === doneCallbacks ) {
                    whenDone();
                }
            }
        }
    }
};