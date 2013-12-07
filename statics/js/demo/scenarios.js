var getScenario = (function () {

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
        "fast-ajax-discrete": {
            "name": "fast-ajax-discrete", "items": [
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
                        "latency": 1500,
                        "messageSize": 7
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "parseStrategy": "discrete",
                        "page": "singlePageSite"
                    }
                }
            ]
        }, 
        
        "fast-ajax-progressive": {
            "name": "fast-ajax-progressive", 
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
                        "latency": 1500,
                        "messageSize": 7
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

        "mobile-discrete": {
            "name": "mobile-discrete",
            "items": [
                {
                    "name": "sever",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": inconsistent_packet_spacing,
                        "initialDelay": 500,
                        "messageSize": 7
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 800,
                        "messageSize": 7
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "parseStrategy": "discrete",
                        "page": "singlePageSite"
                    }
                }
            ]
        },

        "mobile-progressive": {
            "name": "mobile-progressive",
            "items": [
                {
                    "name": "sever",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": inconsistent_packet_spacing,
                        "initialDelay": 500,
                        "messageSize": 7
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 800,
                        "messageSize": 7
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
        
        "slow-ajax-discrete": {
            "name": "slow-ajax-discrete", 
            "items": [
                {
                    "name": "server",
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
                        "latency": 3000
                    }
                },
                {
                    "name": "client",
                    "type": "client",
                    "options": {
                        "parseStrategy": "discrete",
                        "page": "singlePageSite"
                    }
                }
            ]
        },
    
        "slow-ajax-progressive": {
            "name": "slow-ajax", 
            "items": [
                {
                    "name": "sever",
                    "type": "server",
                    "options": {
                        "timeBetweenPackets": 100,
                        "initialDelay": 500
                    }
                },
                {
                    "name": "internet",
                    "type": "wire",
                    "options": {
                        "bandwidth": 500,
                        "latency": 3000
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

        "aggregated-progressive": {
            "name": "aggregated-progressive", 
            "options":{"height":300},
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
            "name": "historic-and-live",
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

    function randomBetween(min, max) {
        var range = (max - min);
        return min + (Math.random() * range);
    }

    function translateLocation(location, delta) {
        return {
            x: location.x + (delta.x | 0 ), y: location.y + (delta.y | 0 )
        };
    }

    function defaultLocationForItem(item) {
        // fill in default positions
        var DEFAULT_SERVER_LOCATION = {x: 40, y: 55},
            DEFAULT_CLIENT_LOCATION = {x: 440, y: 145};

        switch (item.type) {
            case 'client':
                return {    where: DEFAULT_CLIENT_LOCATION };
            case 'server':
                return {    where: DEFAULT_SERVER_LOCATION };
        }
    }
    
    function fillInScenarioDescription(rawJson) {

        var itemsByName = {};
 
        rawJson.items.forEach(function (item, i, items) {
            itemsByName[item.name] = item;
        });
        
        rawJson.items.forEach(function (rawItem, i, items) {
            // fill in next property if not explicitly given:
            if( ! rawItem.next ) {
                rawItem.next    = (i < items.length-1)
                                ? [items[i + 1].name] 
                                : [];
            }
            
            // fill in locations json by sensible defaults if not given:
            if (!rawItem.locations) {
                rawItem.locations = defaultLocationForItem(rawItem);
            }
        });

        // give wires their location:
        rawJson.items.forEach(function (item, i, items) {

            if( item.type == 'wire' ) {
                var upstreamItem   = items[i - 1].locations.where,
                    downstreamItem = itemsByName[item.next[0]].locations.where;

                item.locations = {
                    upstream:   upstreamItem,                    
                    downstream: downstreamItem
                }
            }
        });

        return rawJson;
    }

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

    return function (name) {

        return scenarios[name] && fillInScenarioDescription( scenarios[name] );
    }
})();   