var scenarios = (function () {

    function inconsistent_packet_spacing(i) {

        switch(i){
            case 0:
            case 1:
            case 5:
            case 6:
                return 50; // fast    
        }
        return 500; //slow
    }

    function randomBetween(min, max) {
        var range = (max - min);
        return min + (Math.random() * range);
    }
    
    function fastTimingThenStream(i){

        return (i < 6 ? 100 : randomBetween(750, 2500));
    }

    function historicPacketsThenLive(i) {
        return (i < 6 ? 'historic' : 'live');
    }

    function evenNumberedPackets(i) {
        return (i === undefined)?
            0 : i+=2;
    }

    function oddNumberedPackets(i) {
        return (i === undefined)?
            1 : i+=2;
    }
    
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

    return {
        "2-node-layout":{            
            "items": [
                {
                    "name": "sever",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": 100,
                        "initialDelay": 500,
                        "messageSize": 7
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 1500
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "page": "singlePageSite"
                    }
                }
            ]            
        },
        
        "fast-ajax-discrete": {
            "baseOn":"2-node-layout",
            "extensions":{
                "items":[
                    ,,{
                        options:{
                            parseStrategy:"discrete"
                        }
                    }
                ]
            }
        }, 
        
        "fast-ajax-progressive": {
            "baseOn":"2-node-layout",
            "extensions":{
                "items":[
                    ,,{
                        options:{
                            parseStrategy:"progressive"
                        }
                    }
                ]
            }
        },

        "mobile-layout":{
            "items": [
                {
                    "name": "sever",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": inconsistent_packet_spacing,
                        "initialDelay": 500,
                        "messageSize": 7
                    },
                    locations:{
                        where: {x: 40, y: 93}
                    }
                },
                {
                    "name": "internet-wire",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 800,
                        "messageSize": 7
                    },
                    locations:{
                        downstream: {x: 235, y: 90}
                    }                    
                },
                {
                    "name": "internet-gsm",
                    "type": "wire",
                    "options": {
                        "medium":"mobile",
                        "bandwidth": 500,
                        "latency": 800,
                        "messageSize": 7
                    },
                    locations:{
                        upstream: {x: 250, y: 40}
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "page": "singlePageSite"
                    },
                    "locations":{
                        "upstream":{x: 467, y: 90}
                    },
                    "next":[]
                }
            ]            
        },
        
        "mobile-discrete": {
            "baseOn":"mobile-layout",
            "extensions":{
                "items": [
                    ,,,
                    {
                        "options": {
                            "parseStrategy": "discrete"
                        }
                    }
                ]
            }
        },

        "mobile-progressive": {
            "baseOn":"mobile-layout",
            "extensions":{
                "items": [
                    ,,,
                    {
                        "options": {
                            "parseStrategy": "progressive"
                        }                    
                    }
                ]
            }
        },

        "mobile-fail":{
            "baseOn":"mobile-layout",
            "extensions":{
                "items": [
                    ,,
                    {   "locations": {
                            "upstream":{x:190, y:80}
                        }
                    }
                    ,,
                    {
                        "name":"barrier",
                        "type":"barrier"
                    }
                ]
            }            
        },
        
        "mobile-fail-discrete": {
            "baseOn":"mobile-fail",
            "extensions":{
                "items": [
                    ,,,
                    {
                        "options": {
                            "parseStrategy": "discrete"
                        }
                    }
                ]
            }
        },

        "mobile-fail-progressive": {
            "baseOn":"mobile-fail",
            "extensions":{
                "items": [
                    ,,,
                    {
                        "options": {
                            "parseStrategy": "progressive"
                        }
                    }
                ]
            }
        },        
        
        "aggregated-progressive": { 
            "options":{"height":257},
            "items": [
                {
                    "name": "origin-slow",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": 2000,
                        "initialDelay": 500,
                        "messageSize": 7,
                        "packetSequence": evenNumberedPackets
                    }
                },
                {
                    "name": "origin-slow-wire",
                    "type": "wire",
                    "next":["aggregator"],
                    "options": {
                        "bandwidth": 500,
                        "latency": 1200
                    }
                },                
                {
                    "name": "origin-fast",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": 750,
                        "initialDelay": 250,
                        "messageSize": 5,
                        "packetSequence": oddNumberedPackets
                    },
                    "locations":{ "where":{x:100, y:200} }                    
                },                
                {
                    "name": "origin-fast-wire",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 800
                    }
                },                
                {
                    "name": "aggregator",
                    "type": "aggregatingServer",
                    "options": {
                        "timeBetweenPackets": 1000,
                        "initialDelay": 500,
                        "messageSize": Number.POSITIVE_INFINITY
                    },
                    "locations":{ "where":{x:240, y:100} }
                },
                {
                    "name": "client-internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 1000
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "parseStrategy": "progressive",
                        "page": "singlePageSite"
                    }
                }
            ]
        },
        
        "historic-and-live": {
            "items": [
                {
                    "name": "sever",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": fastTimingThenStream,
                        "packetMode": historicPacketsThenLive,
                        "initialDelay": 500,
                        "messageSize": Number.POSITIVE_INFINITY
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 1000
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "parseStrategy": "progressive",
                        "page": "twitter"
                    }
                }
            ]
        }
    };
    
})();   