var scenarios = (function () {
    
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
                    "type": "originServer",
                    "options": {
                        "timeBetweenPackets": 0,
                        "messageSize": 9
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 100,
                        "latency": 1500
                    }
                },
                {
                    "name": "client",
                    "type": "client"
                }
            ]            
        },
        
        "fast-ajax-discrete": {
            "baseOn":"2-node-layout",
            "narrative":[
                {
                    "type":"narrativeItem",
                    "script":[
                        {   eventName:"client_requestAttempt_0",
                            delay:seconds(0.5),
                            action: function(){
                                this.popUp();
                            }
                        }
                    ],
                    "relationships":{
                        "topic":"client"
                    },
                    "text": "hello"
                }
            ],
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
                    "type": "originServer",
                    "options": {
                        "timeBetweenPackets": 0,
                        "packetMode": "historic"
                    },
                    locations:{
                        where: {y: 93}
                    }
                },
                {
                    "name": "internet-wire",
                    "type": "wire",
                    "options": {
                        "bandwidth": 50,
                        "latency": 800
                    }                    
                },
                {
                    "name": "tower",
                    "type": "relay"
                },                
                {
                    "name": "internet-gsm",
                    "type": "wire",
                    "options": {
                        "medium":"mobile",
                        "bandwidth": inconsistent_packet_spacing,
                        "latency": 800
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "page": "map",
                        "deviceType":"mobile"
                    },
                    "next":[]
                }
            ]            
        },
        
        "mobile-discrete": {
            "baseOn":"mobile-layout",
            "extensions":{
                "items": [
                    ,,,,
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
                    ,,,,
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
                    {
                        "locations": {
                            "where":     {x:190, y:80}
                        }
                    }
                    ,
                    {
                        "relationships":{
                            "blockedBy":"tunnel"
                        }
                    }
                    ,
                    {   "options":{
                            "failAfter": seconds(4),
                            "retryAfter": seconds(2)
                        }
                    }
                    ,
                    {
                        "name":"tunnel",
                        "type":"barrier",
                        "script": [
                            {   eventName:"client_accepted_response6",
                                action: function(){
                                    this.activateIfNeverShownBefore();
                                }
                            },
                            {   eventName: "client_requestAttempt_1",
                                delay: seconds(0.5),
                                action: function(){
                                    this.deactivate();
                                }
                            }
                        ]
                    }
                ]
            }            
        },
        
        "mobile-fail-discrete": {
            "baseOn":"mobile-fail",
            "extensions":{
                "items": [
                    ,,,,
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
                    ,,,,
                    {
                        "options": {
                            "parseStrategy": "progressive"
                        }
                    }
                ]
            }
        },

        "aggregated-layout":{
            "options":{
                "height":257,
                "colors":"twoSeries"
            },
            "items": [
                {
                    "name": "origin-slow",
                    "type": "originServer",
                    "options": {
                        "timeBetweenPackets": 2000,
                        "messageSize": 9,
                        "packetSequence": evenNumberedPackets
                    }
                },
                {
                    "name": "origin-slow-wire",
                    "type": "wire",
                    "next":["aggregator"],
                    "options": {
                        "latency": 1200
                    }
                },
                {
                    "name": "origin-fast",
                    "type": "originServer",
                    "options": {
                        "timeBetweenPackets": 750,
                        "initialDelay": 250,
                        "packetSequence": oddNumberedPackets
                    },
                    "locations":{ "where":{x:100, y:200} }
                },
                {
                    "name": "origin-fast-wire",
                    "type": "wire",
                    "options": {
                        "latency": 800
                    }
                },
                {
                    "name": "aggregator",
                    "type": "aggregatingServer",
                    "options": {
                        "timeBetweenPackets": 0,
                        "messageSize": Number.POSITIVE_INFINITY
                    },
                    "locations":{ "where":{x:240, y:125} }
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
                        "page": "graph",
                        "aspect": "landscape"
                    },
                    "locations":{ "where":{x:420, y:125} }
                }
            ]
        },
        
        "aggregated-discrete": {
            
            "baseOn":"aggregated-layout",
            "extensions":{
                "items":[
                    ,,,,
                    {
                        "options": {
                            "parseStrategy": "discrete"
                        }
                    }
                    ,,
                    {
                        "options":{
                            "parseStrategy": "discrete"
                        }
                    }
                ]
            }
        },
        
        "aggregated-progressive": {

            "baseOn":"aggregated-layout",
            "extensions":{
                "items":[
                    ,,,,
                    {
                        "options": {
                            "parseStrategy": "progressive"
                        }
                    }
                    ,,
                    {
                        "options":{
                            "parseStrategy": "progressive"
                        }
                    }
                ]                
            }
        },
        
        "historic-and-live": {
            "items": [
                {
                    "name": "server",
                    "type": "originServer",
                    "options": {
                        "timeBetweenPackets": fastTimingThenStream,
                        "packetMode": historicPacketsThenLive,
                        "messageSize": Number.POSITIVE_INFINITY
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
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
        },

        "caching": {
            "options":{
                "height":257,
                "startSimulation":function(modelItems){
                    modelItems.client1.makeRequest();
                }
            },
            "items": [
                {
                    "name": "server",
                    "type": "originServer",
                    "locations":{where:{y:70}}
                },
                {
                    "name": "server-to-cache-wire",
                    "type": "wire",
                    "options": {
                        "latency": 1000,
                        "bandwidth": 500
                    }
                },
                {
                    "name": "cache",
                    "type": "cache",
                    "locations":{where:{x: 180, y:55}},
                    "next": ["cache-to-client1", "cache-to-client2", "cache-to-client3"]
                },
                
                {
                    "name": "cache-to-client1",
                    "type": "wire",
                    "options":{
                        latency: 750,
                        "bandwidth": 500
                    }
                },
                {
                    "name": "client1",
                    "type": "client",
                    "options": {
                        "parseStrategy": "progressive",
                        "page": "cartogram",
                        "aspect": "landscape"
                    },
                    "locations":{ "where":{x:430, y:67} },
                    "next": []
                }
                ,
                
                
                {
                    "name": "cache-to-client2",
                    "type": "wire",
                    "options":{
                        latency: 1500,
                        "bandwidth": 500
                    }
                },
                {
                    "name": "client2",
                    "type": "client",
                    "options": {
                        "parseStrategy": "progressive",
                        "page": "cartogram",
                        "aspect": "landscape"
                    },
                    "locations":{ "where":{x:375, y:185} },
                    "script": [
                        {   eventName:"client1_accepted_response1",
                            delay:seconds(0.5),
                            action: function(){
                                    this.makeRequest();
                            }
                        }
                    ],
                    "next": []
                }
                
                ,
                {
                    "name": "cache-to-client3",
                    "type": "wire",
                    "options":{
                        latency: 1200,
                        "bandwidth": 500
                    }
                },
                {
                    "name": "client3",
                    "type": "client",
                    "options": {
                        "parseStrategy": "progressive",
                        "page": "cartogram",
                        "aspect": "landscape"
                    },
                    "locations":{ "where":{x:245, y:205} },
                    "script": [
                        {   eventName:"client1_accepted_response9",
                            action: function(){
                                this.makeRequest();
                            }
                        }
                    ]
                }
            ]
        }
    };

    function inconsistent_packet_spacing(i) {

        switch(i){
            case 0:
            case 1:
            case 5:
            case 6:
                return 75; // fast    
        }
        return 600; //slow
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
        return (i === -1)?
            0 : i+=2;
    }

    function oddNumberedPackets(i) {
        return (i === -1)?
            1 : i+=2;
    }
    
    function seconds(s){
        return 1000 * s;
    }
    
})();   
