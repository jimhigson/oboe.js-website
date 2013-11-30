var getScenario = (function(){
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
                return {    downstream: DEFAULT_CLIENT_LOCATION, 
                            upstream:   DEFAULT_SERVER_LOCATION }
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