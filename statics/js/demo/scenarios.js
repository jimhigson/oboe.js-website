var scenarios = (function () {

   return {
      "2-node-layout": {
         "items": [
            {
               "name": "sever",
               "type": "originServer",
               "options": {
                  "timeBetweenPackets": 0,
                  "messageSize": 10,
                  "label":"Server"
               },
               locations:{where:{x:65,y:70}}
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
               "type": "client",
               "options":{
                  label:"Client"
               },
               locations:{where:{x:415,y:130}}
            }
         ]
      },

      "fast-ajax-discrete": {
         "baseOn": "2-node-layout",
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_requestAttempt_0",
                     delay: seconds(0.35)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "Our client makes a GET request for a page-worth of data",
                  "locationOnTopic": "upstream"
               }
            }
         ],
         "extensions": {
            "items": [
               ,
               ,
               {
                  options: {
                     parseStrategy: "discrete"
                  }
               }
            ]
         }
      },
      
      "fast-ajax-progressive": {
         "baseOn": "2-node-layout",
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_accepted_response0"
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "Because it parses the stream the webapp can render progressively",
                  "locationOnTopic": "where"
               }
            }
         ],         
         "extensions": {
            "items": [
               ,
               ,
               {
                  options: {
                     parseStrategy: "progressive"
                  }
               }
            ]
         }
      },

      "streaming-ajax-progressive": {
         baseOn: "fast-ajax-progressive",
         extensions:{
            items: [
               {
                  "options": {
                     "timeBetweenPackets": inconsistentlyTimed
                  }
               }
            ]
         }
      },

      "mobile-layout": {
         "items": [
            {
               "name": "sever",
               "type": "originServer",
               "options": {
                  "timeBetweenPackets": 0,
                  "packetMode": "historic"
               },
               locations: {
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
                  "medium": "mobile",
                  "bandwidth": fastAndSlow,
                  "latency": 800
               }
            },
            {
               "name": "client",
               "type": "client",
               "options": {
                  "page": "map",
                  "deviceType": "mobile",
                  "zoom":1.25
               },
               locations:{
                  where: {x:415, y:135}
               },
               "next": []
            }
         ]
      },

      "mobile-discrete": {
         "baseOn": "mobile-layout",
         "extensions": {
            "items": [
               ,
               ,
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "discrete"
                  }
               }
            ]
         },
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "tower_accepted_response9",
                     delay: seconds(0.2)
                  }
               ],
               "relationships": {
                  "topic": "tower"
               },
               "options": {
                  "text": "On mobile networks the traffic often arrives in bursts.",
                  "locationOnTopic": "upstream"
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_accepted_response6",
                     delay: seconds(0.2)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "By now the webapp has already received most of the data but " +
                     "the user won't be shown anything until the last bit arrives..."
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_accepted_response9",
                     delay: seconds(0.5)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "The user didn't see anything until all the data was downloaded"
               }
            }            
         ]
      },

      "mobile-progressive": {
         "baseOn": "mobile-layout",
         "extensions": {
            "items": [
               ,
               ,
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "progressive"
                  }
               }
            ]
         },
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_accepted_response2",
                     delay: seconds(0.2)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "The client has only the first pieces of data but already we're displaying " +
                     "useful content."
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_accepted_response9",
                     delay: seconds(0.5)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "The time taken to display the" +
                     " data completely is the same but the client could show pieces of it" +
                     " much earlier"
               }
            }            
         ]
      },

      "mobile-fail": {
         "baseOn": "mobile-layout",
         "extensions": {
            "items": [
               ,
               ,
               {
                  "locations": {
                     "where": {x: 190, y: 80}
                  }
               }
               ,
               {
                  "relationships": {
                     "blockedBy": "tunnel"
                  }
               }
               ,
               {   "options": {
                  "failAfter": seconds(4),
                  "retryAfter": seconds(2)
               }
               }
               ,
               {
                  "name": "tunnel",
                  "type": "barrier",
                  options:{
                     startHidden: true
                  },
                  "script": [
                     {  
                        eventName: "client_accepted_response6",
                        action: function () {
                           this.activateIfNeverShownBefore();
                        }
                     },
                     {  
                        eventName: "client_requestAttempt_1",
                        delay: seconds(2),
                        action: function () {
                           this.deactivate();
                        }
                     }
                  ]
               }
            ]
         }
      },

      "mobile-fail-discrete": {
         "baseOn": "mobile-fail",
         "extensions": {
            "items": [
               ,
               ,
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "discrete"
                  }
               }
            ]
         },
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "tunnel_activated"
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "At this point the mobile client is blocked from reaching the tower and loses connection."
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_requestFail_1"
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "When the request times out the data received so far is discarded."
               }
            },            
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "tunnel_deactivated"
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "Some time later the obstruction is gone and signal returns"
               }
            }
         ]
      },

      "mobile-fail-progressive": {
         "baseOn": "mobile-fail",
         "extensions": {
            "items": [
               ,
               ,
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "progressive"
                  }
               }
            ]
         },
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_requestAttempt_2",
                     delay: seconds(0.2)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "Now that signal has returned the client is smart enough to only re-request" +
                     " the data that it missed the first time"
               }
            }
         ]
      },

      "aggregated-layout": {
         "options": {
            "height": 257,
            "colors": "twoSeries"
         },
         "items": [
            {
               "name": "origin-slow",
               "type": "originServer",
               "options": {
                  "timeBetweenPackets": 2000,
                  "messageSize": 9,
                  "packetSequence": evenNumberedPackets,
                  label: 'Origin 1'
               },
               "locations": { "where": {x: 60, y:50} }
            },
            {
               "name": "origin-slow-wire",
               "type": "wire",
               "next": ["aggregator"],
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
                  "packetSequence": oddNumberedPackets,
                  label: 'Origin 2'
               },
               "locations": { "where": {x: 120, y: 160} }
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
                  "messageSize": Number.POSITIVE_INFINITY,
                  label: 'Aggregator'
               },
               "locations": { "where": {x: 265, y: 115} }
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
                  "aspect": "landscape",
                  "showProgress": false
               },
               "locations": { "where": {x: 420, y: 115} }
            }
         ]
      },

      "aggregated-discrete": {

         "baseOn": "aggregated-layout",
         "extensions": {
            "items": [
               ,
               ,
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "discrete"
                  }
               }
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "discrete"
                  }
               }
            ]
         }
      },

      "aggregated-progressive": {

         "baseOn": "aggregated-layout",
         "extensions": {
            "items": [
               ,
               ,
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "progressive"
                  }
               }
               ,
               ,
               {
                  "options": {
                     "parseStrategy": "progressive"
                  }
               }
            ]
         }
      },

      "historic-and-live": {
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "server_sent_response6",
                     delay: seconds(0.15)
                  }
               ],
               "relationships": {
                  "topic": "server"
               },
               "options": {
                  "text": "Once the historic messages have been sent the server " +
                     "keeps the same connection open, writing out " +
                     "new messages as they happen."
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client_accepted_response6",
                     delay: seconds(0.2)
                  }
               ],
               "relationships": {
                  "topic": "client"
               },
               "options": {
                  "text": "The client handles live messages the same as historic, displaying them as HTML."
               }
            }
         ],         
         "items": [
            {
               "name": "server",
               "type": "originServer",
               "options": {
                  "timeBetweenPackets": fastTimingThenStream,
                  "packetMode": historicPacketsThenLive,
                  "messageSize": Number.POSITIVE_INFINITY,
                  "label":"Message server"
               },
               locations:{where:{x:95,y:70}}
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
                  "page": "twitter",
                  "showProgress": false
               },
               locations:{where:{x:400,y:130}}
            }
         ]
      },

      "caching": {
         "options": {
            "height": 257,
            "startSimulation": function (modelItems) {
               modelItems.client1.makeRequest();
            },
            "colors": "political",
            endSimulationEvent:'client3_acceptedAll'
         },
         "narrative": [
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "cache_requestOff_cache-to-client1"
                  }
               ],
               "relationships": {
                  "topic": "cache"
               },
               "options": {
                  "text": "This is the first client to request the results" +
                     " so it is a cache hit. REST streaming doesn't rely" +
                     " on bypassing caching so the cache can propagate and store" +
                     " as per usual."
               }
            },            
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client2_requestAttempt_0",
                     delay: seconds(0.18)
                  }
               ],
               "relationships": {
                  "topic": "client2"
               },
               "options": {
                  "text":"A second client behind the same proxy comes" +
                     " online and requests the results."
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "cache_requestOff_cache-to-client2"
                  }
               ],
               "relationships": {
                  "topic": "cache"
               },
               "options": {
                  "text": "The http cache already has a connection " +
                     "to the server for this URL and is partially " +
                     "populated. It doesn't need to hit the server again " +
                     "and can send what it has already"
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "cache_accepted_response19"
                  ,  delay: 0.2
                  }
               ],
               "relationships": {
                  "topic": "cache"
               },
               "options": {
                  "text": "As streaming data arrives the cache treats it " +
                     "like normal traffic and propagate to all requesters"
               }
            },            
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "server_sent_response50",
                     delay: seconds(0.1)
                  }
               ],
               "relationships": {
                  "topic": "server"
               },
               "options": {
                  "text": "The server sends the last result and" +
                     " closes the JSON normally. Although the response was" +
                     " written slowly as a stream, the content ultimately " +
                     " forms a valid JSON document."
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "client3_requestAttempt_0",
                     delay: seconds(0.3)
                  }
               ],
               "relationships": {
                  "topic": "client3"
               },
               "options": {
                  "text": "A third client comes online after all the " +
                     "results have been announced.",
                  "locationOnTopic": "upstream"
               }
            },
            {
               "type": "narrativeItem",
               "script": [
                  {  eventName: "cache_requestOff_cache-to-client3"
                  }
               ],
               "relationships": {
                  "topic": "cache"
               },
               "options": {
                  "text": "This request can be served straight from cache. At this" +
                     " time it is essentially a static resource."
               }
            }
         ],
         "items": [
            {
               "name": "server",
               "type": "originServer",
               "locations": {where: {y: 70}},
               options: {
                  "payloads": '2012UsElection',
                  "timeBetweenPackets": inconsistentlyTimed,
                  "packetMode": 'live',
                  "label":"Results Server"
               }
            },
            {
               "name": "server-to-cache-wire",
               "type": "wire",
               "options": {
                  "latency": 400,
                  "bandwidth": 100
               }
            },
            {
               "name": "cache",
               "type": "cache",
               "locations": {where: {x: 180, y: 55}},
               "next": ["cache-to-client1", "cache-to-client2", "cache-to-client3"],
               options: {
                  label: 'HTTP cache'
               }
            },

            {
               "name": "cache-to-client1",
               "type": "wire",
               "options": {
                  latency: 800,
                  "bandwidth": 100
               }
            },
            {
               "name": "client1",
               "type": "client",
               "options": {
                  "parseStrategy": "progressive",
                  "page": "cartogram",
                  "aspect": "landscape",
                  zoom:1.5
               },
               "locations": { "where": {x: 375, y: 185} },
               "next": []
            }
            ,


            {
               "name": "cache-to-client2",
               "type": "wire",
               "options": {
                  latency: 600,
                  "bandwidth": 20,
                  startHidden:true
               }
            },
            {
               "name": "client2",
               "type": "client",
               "options": {
                  "parseStrategy": "progressive",
                  "page": "cartogram",
                  "aspect": "landscape",
                  startHidden:true,
                  zoom:1.15
               },
               "locations": { "where": {x: 430, y: 67} },               
               "script": [
                  {  eventName: "client1_accepted_response12",
                     delay: seconds(0.5),
                     action: function () {
                        this.activate();
                        this.adjacents.upstream.forEach(function(adj){
                           adj.activate();
                        });
                     }
                  },
                  {  eventName: "client1_accepted_response12",
                     delay: seconds(1),
                     action: function () {
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
               "options": {
                  latency: 800,
                  "bandwidth": 20,
                  startHidden:true
               }
            },
            {
               "name": "client3",
               "type": "client",
               "options": {
                  "parseStrategy": "progressive",
                  "page": "cartogram",
                  "aspect": "landscape",
                  startHidden:true,
                  zoom:1.15
               },
               "locations": { "where": {x: 245, y: 205} },
               "script": [
                  {  eventName: "client1_accepted_response50",
                     delay: seconds(0.5),
                     action: function () {
                        this.activate();
                        this.adjacents.upstream.forEach(function(adj){
                           adj.activate();
                        });
                     }
                  },
                  {  eventName: "client1_accepted_response50",
                     delay: seconds(2),
                     action: function () {
                        this.makeRequest();
                     }
                  }                  
               ]
            }
         ]
      }
   };

   function fastAndSlow(i) {

      switch (i) {
         case 0:
         case 1:
         case 5:
         case 6:
            return 75; // fast    
      }
      return 600; //slow
   }

   function inconsistentlyTimed() {
      return randomBetween(75, 1500);
   }

   function randomBetween(min, max) {
      var range = (max - min);
      return min + (Math.random() * range);
   }

   function fastTimingThenStream(i) {

      return (i < 6 ? 100 : randomBetween(750, 2500));
   }

   function historicPacketsThenLive(i) {
      return (i < 6 ? 'historic' : 'live');
   }

   function evenNumberedPackets(i) {
      return (i === -1) ?
         0 : i += 2;
   }

   function oddNumberedPackets(i) {
      return (i === -1) ?
         1 : i += 2;
   }

   function seconds(s) {
      return 1000 * s;
   }

})();   
