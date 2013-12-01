var getScenario = (function(){
    
    /* some more:
        * jQ fast
        * Oboe fast
        * jQ mobile
        * Oboe mobile
        * jQ mobile, failing
        * Oboe mobile, failing
        * streaming + historic together
        * a chat session
        * creating an aggregation (Insight) jQ
        * creating an aggregation (Insight) Oboe
     */
    
    var scenarios = [, // NB: hole in array - there is no item zero
        new Scenario({   
            "name":"fast-ajax"
        ,   "items":[
                {
                    "name":"sever",
                    "type":"server",
                    "options":{
                        "timeBetweenPackets": 100,
                        "initialDelay"      : 500,
                        "messageSize"       : 7
                    }
                },
                {
                    "name":"internet",                    
                    "type":"wire",
                    "options":{
                        "bandwidth":500,
                        "latency":1500,
                        "messageSize" : 7                        
                    }
                },
                {
                    "name":"client",                    
                    "type":"client"
                }
            ]
        })
        
    ,   new Scenario({
            "name":"slow-ajax"
            ,   "items":[
                {
                    "name":"sever",
                    "type":"server",
                    "options":{
                        "timeBetweenPackets": 100,
                        "initialDelay"      : 500
                    }
                },
                {
                    "name":"internet",
                    "type":"wire",
                    "options":{
                        "bandwidth":500,
                        "latency":3000
                    }
                },
                {
                    "name":"client",
                    "type":"client"
                }
            ]
        })        
    ];
    
    function translateLocation( location, delta ){
        return {
            x: location.x + (delta.x | 0 )
        ,   y: location.y + (delta.y | 0 )
        };
    }
    
    function defaultLocationForItem(item) {
        // fill in default positions
        var DEFAULT_SERVER_LOCATION = {x:40,y:55},
            DEFAULT_CLIENT_LOCATION = {x:440,y:145};
        
        switch( item.type ){
            case 'client':
                return {    where:      DEFAULT_CLIENT_LOCATION };
            case 'server':
                return {    where:      DEFAULT_SERVER_LOCATION };
            case 'wire':
                return {    downstream: translateLocation(DEFAULT_CLIENT_LOCATION, {x:-32}), 
                            upstream:   translateLocation(DEFAULT_SERVER_LOCATION, {x: 5})
                }
        }
    }
    
    function Scenario(rawJson) {

        rawJson.items.forEach(function(item, i, items){
            // fill in next property if not explicitly given:
            if( !item.next ) {
                item.next = items[i+1] ? [items[i+1].name] : [];
            }

            // fill in locations json by sensible defaults if not given:
            if( !item.locations ) {
                item.locations = defaultLocationForItem(item);
            }
        });


        
        return rawJson;
    }
    
    return function(name) {
        if( !scenarios[name] ) {
            throw new Error('no scenario called ' + name);
        }
        
        return scenarios[name];
    }
})();   