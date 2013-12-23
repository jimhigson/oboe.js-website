var getScenario = (function () {

    var DEFAULTS = {
        wire: {
            options:{
                bandwidth: 500,
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
        
        client: {
            locations:{
                where: {x: 440, y: 145}
            }
        },
        
        barrier: {
            locations:{
                where: {x: 410, y: 145}
            }
        },
        
        server: {
            locations:{
                where: {x: 40, y: 55}
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
        return _extend(obj, defaults, false);        
    }

    function extend(obj, extension) {
        return _extend(obj, extension, true);
    }
    
    function _extend(to, from, overwrite) {
        
        if( !to ) {
            to = {};
        }
        
        for( var k in from ) {
            
            if( from[k] instanceof Function ) {
                
                // functions - copy directly
                if( overwrite || !to[k] )
                    to[k] = from[k];
            }
            else if( from[k] instanceof Object ) {
                
                // objects, arrays - recursive case
                if( !to[k] ) {
                    to[k] = {};
                }
                
                _extend(to[k], from[k]);
            } else {
                
                // strings, numbers etc
                if( overwrite || !to[k] )                
                    to[k] = from[k];
            }
        }
        return to;
    }
    
    function fillInTemplate(template, extensions) {
        var copy = deepCopy(template);
        
        return extend(copy, extensions);
    }
    
    function fillInFromBaseScenario( name ){
        var rawJson = scenarios[name],
            baseName = rawJson.baseOn;

        if(baseName) {
            return fillInTemplate( fillInFromBaseScenario(baseName), rawJson.extensions);
        } else {
            return rawJson;
        }
    }
    
    function fillInScenarioDescription(name) {
        
        var rawJson = fillInFromBaseScenario(name);

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


        rawJson.items.forEach(function (wire, i, items) {

            if( wire.type == 'wire' ) {

                if( !wire.locations.upstream ) {
                    var previousItemLocations = items[i - 1].locations;
                    wire.locations.upstream = previousItemLocations.downstream || previousItemLocations.where;
                }

                if( !wire.locations.downstream ) {
                    var nextItemLocations = itemsByName[wire.next[0]].locations;
                    wire.locations.downstream = nextItemLocations.upstream || nextItemLocations.where;
                }
            }
        });

        return rawJson;
    }

    return function (name) {
        return scenarios[name] && fillInScenarioDescription( name );
    }    

})();   
