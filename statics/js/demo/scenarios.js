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
    
    var scenarios = {
        "fast-ajax-discrete": new Scenario({   
            "name":"fast-ajax-discrete"
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
                    "type":"client",
                    "options":{
                        "parseStrategy":"discrete",
                        "page":"singlePageSite"
                    }
                }
            ]
        })

    ,   "fast-ajax-progressive": new Scenario({
            "name":"fast-ajax-progressive"
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
                    "type":"client",
                    "options":{
                        "parseStrategy":"progressive",
                        "page":"singlePageSite"
                    }
                }
            ]
        })        
        
    ,   "slow-ajax-discrete": new Scenario({
            "name":"slow-ajax-discrete"
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
                        "latency":3000
                    }
                },
                {
                    "name":"client",
                    "type":"client",
                    "options":{
                        "parseStrategy":"discrete",
                        "page":"singlePageSite"
                    }
                }
            ]
        })
    ,   "slow-ajax-progressive": new Scenario({
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
                    "type":"client",
                    "options":{
                        "parseStrategy":"progressive",
                        "page":"singlePageSite"
                    }                    
                }
            ]
        }),

    "aggregated-progressive": new Scenario({
        "name":"aggregated-progressive"
        ,   "items":[
            {
                "name":"sever",
                "type":"server",
                "options":{
                    "timeBetweenPackets": function( i ){
                        return (i < 6 ? 50 : randomBetween(500,2500));
                    },
                    "packetMode":function(i){
                        return (i < 6 ? 'historic' : 'live');
                    },
                    "initialDelay" : 500,
                    "messageSize"  : Number.POSITIVE_INFINITY
                }
            },
            {
                "name":"internet",
                "type":"wire",
                "options":{
                    "bandwidth":500,
                    "latency":500
                }
            },
            {
                "name":"client",
                "type":"client",
                "options":{
                    "parseStrategy":"progressive",
                    "page":"twitter"
                }
            }]
    })

        ,   "historic-and-live": new Scenario({
        "name":"historic-and-live"
        ,   "items":[
            {
                "name":"sever",
                "type":"server",
                "options":{
                    "timeBetweenPackets": function( i ){
                        return (i < 6 ? 50 : randomBetween(500,2500)); 
                    },
                    "packetMode":function(i){
                        return (i < 6 ? 'historic' : 'live');                            
                    },
                    "initialDelay" : 500,
                    "messageSize"  : Number.POSITIVE_INFINITY
                }
            },
            {
                "name":"internet",
                "type":"wire",
                "options":{
                    "bandwidth":500,
                    "latency":500
                }
            },
            {
                "name":"client",
                "type":"client",
                "options":{
                    "parseStrategy":"progressive",
                    "page":"twitter"
                }
            }]
        })        
    };

    function randomBetween(min, max) {
        var range = (max - min);
        return min + (Math.random() * range);
    }
    
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

        return scenarios[name];
    }
})();   