var getScenario = (function () {

    function defaultLocationForItem(item) {
        // fill in default positions
        var DEFAULT_SERVER_LOCATION = {x: 40, y: 55},
            DEFAULT_CLIENT_LOCATION = {x: 440, y: 145};

        switch (item.type) {
            case 'client':
                return DEFAULT_CLIENT_LOCATION;
            case 'server':
                return DEFAULT_SERVER_LOCATION;
        }
    }

    function deepCopy(obj){
        return jQuery.extend(true, {}, obj);
    }

    function extend(base, extension) {
        for( var k in extension ) {
            
            if( extension[k] instanceof Object ) {
                
                // objects, arrays - recursive case
                if( !base[k] ) {
                    base[k] = {};
                }
                
                extend(base[k], extension[k]);
            } else {
                
                // strings, numbers etc
                base[k] = extension[k];
            }
        }
        return base;
    }
    
    function baseOn(templateName, extensions) {
        var copy = deepCopy(scenarios[templateName]);
        
        return extend(copy, extensions);
    }
    
    function fillInScenarioDescription(rawJson) {

        var itemsByName = {};
        
        if(rawJson.baseOn) {
            rawJson = baseOn(rawJson.baseOn, rawJson.extensions);
        }
        
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


            if (!rawItem.locations) {
                rawItem.locations = {};
            }

            // fill in locations json by sensible defaults if not given:
            if( !rawItem.locations.where ) {
                rawItem.locations.where = defaultLocationForItem(rawItem);
            }
        });


        rawJson.items.forEach(function (wire, i, items) {

            if( wire.type == 'wire' ) {

                // wires default to cable (could also be mobile) - the only difference
                // is in the view, work in the same way
                if( !wire.options.medium ) {
                    wire.options.medium = 'cable';
                }

                // give wires their location:
                if( !wire.locations ) {
                    wire.locations = {};
                }

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
        return scenarios[name] && fillInScenarioDescription( scenarios[name] );
    }    

})();   