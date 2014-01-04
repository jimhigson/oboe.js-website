var getScenario = (function () {

    var DEFAULTS = {
        demo: {
            options: {
                colors: 'categorical',
                width: 500,
                height: 200,
                startSimulation: function(modelItems){
                    modelItems.client.makeRequest();
                },
                endSimulationEvent:'client_acceptedAll'
            }
        },
        wire: {
            options:{
                bandwidth: 0, // by default, can accept packets as quickly as received
                latency: 1000,
                medium: 'cable'
            },
            locations: {}
        },
    
        relay: {
            options:{
                "timeBetweenPackets": 500
            },
            locations:{
                where: {x: 235, y: 90}
            }
        },

        cache: {
            options:{
                "timeBetweenPackets": 500
            },
            locations:{
                where: {x: 235, y: 90}
            }
        },        
        
        client: {
            options:{
                retryAfter: Number.POSITIVE_INFINITY,
                failAfter: Number.POSITIVE_INFINITY,
                aspect: 'portrait',
                "page": "singlePageSite",
                "deviceType":"desktop",
                "showProgress":true
            },
            locations:{
                where: {x: 430, y: 145}
            }
        },
        
        barrier: {
            locations:{
                where: {x: 410, y: 145}
            }
        },
        
        originServer: {
            options:{
                packetSequence: function(previousPacketNumber){
                    return previousPacketNumber+1;
                },
                "timeBetweenPackets": 500,
                "initialDelay": 500,
                "messageSize": 10,
                packetMode:'live'
            },
            locations:{
                where: {x: 40, y: 55}
            }
        },

        narrativeItem: {
            script:[
               {  delay:0,
                  action:function () {
                     this.popUp();
                  }
               }
            ],
            options:{
                locationOnTopic:'where'
            }
        }       
       
    };
    
    function setRelativePositions(item) {
        var locations = item.locations;
        var baseXy = locations.where;
        
        switch (item.type) {
            case 'relay':
                locations.upstream   = translate(baseXy, {x:0, y:40});
                break;
            case 'client':
                switch( item.options.deviceType ){
                    case 'mobile':
                        locations.upstream   = translate(baseXy, {x:30, y:-53});
                        break;
                    case 'desktop':
                    default:
                        locations.upstream   = translate(baseXy, {x:-18, y:0});
                }
        }
    }
    
    function translate( xy, xyDelta ) {
        return {
            x: xy.x + xyDelta.x,
            y: xy.y + xyDelta.y
        };
    }

    function deepCopy(obj){
        return jQuery.extend(true, {}, obj);
    }

    function fillInDefaults(obj, defaults) {
        return superimpose(obj, defaults, false);        
    }

    function extend(obj, extension) {
        return superimpose(obj, extension, true);
    }
    
    function superimpose(to, from, overwrite) {
        
        if( !to ) {
            to = {};
        }
        
        for( var k in from ) {
            
            if( from[k] instanceof Function ) {
                
                // functions - copy directly
                if( overwrite || (to[k] === undefined) )
                    to[k] = from[k];
            }
            else if( from[k] instanceof Object ) {
                
                // objects, arrays - recursive case
                if( !to[k] ) {
                    to[k] = new from[k].constructor;
                }
                
                superimpose(to[k], from[k], overwrite);
            } else {
                
                // strings, numbers etc
                if( overwrite || (to[k] === undefined) )
                    to[k] = from[k];
            }
        }
        return to;
    }
    
    function fillInTemplate(template, extensions) {
        var copy = deepCopy(template),
            extendedCopy = extend(copy, extensions);
        
        return extendedCopy;
    }
    
    function fillInFromBaseScenario( name ){
        var rawJson = scenarios[name],
            baseName = rawJson.baseOn;

        if(baseName) {
            var extended = fillInTemplate( fillInFromBaseScenario(baseName), rawJson.extensions);
            
            // narratives are never inherited:
            extended.narrative = rawJson.narrative;
            
            return extended;
        } else {
            return rawJson;
        }
    }
    
    function fillInScenarioDescription(name) {
        
        var rawJson = fillInFromBaseScenario(name);
        
        fillInDefaults(rawJson, DEFAULTS.demo);

        var itemsByName = {};
                
        rawJson.name = name;
        
        rawJson.items.forEach(function (item, i, items) {
            itemsByName[item.name] = item;
        });

        rawJson.items.forEach(function (rawItem, i, items) {
            // fill in next property if not explicitly given:
            if( ! rawItem.next ) {
                rawItem.next 
                    = (i < items.length-1)
                    ? [items[i + 1].name]
                    : [];
            }

            if( DEFAULTS[rawItem.type] ) {
                fillInDefaults(rawItem, DEFAULTS[rawItem.type]);
            }
            
            setRelativePositions(rawItem);
        });

        (rawJson.narrative||[]).forEach(function (rawItem) {
            fillInDefaults(rawItem, DEFAULTS[rawItem.type]);
        });

        return rawJson;
    }

    return function (name) {
        return scenarios[name] && fillInScenarioDescription( name );
    }    

})();   
