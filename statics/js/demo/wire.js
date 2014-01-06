
function loadScenario(scenarioId) {

    var MODEL_TYPES = {
        "originServer":        OriginServer,
        "wire":                Wire,
        "client":              Client,
        "aggregatingServer":   AggregatingServer,
        "barrier":             Barrier,
        "relay":               Relay,
        "cache":               Cache,
        "narrativeItem":       NarrativeItem
    };
    
    var scenario = getScenario(scenarioId);
    
    if( !scenario ) {
        console.warn('no scenario for ' + scenarioId);
        return;
    }
    
    console.log('setting up demo', scenario);
    
    var modelItems = {};

    function makeModel(jsonDescription){
        var Type = MODEL_TYPES[jsonDescription.type];

        return new Type(
            jsonDescription.name,
            (jsonDescription.locations || {}),
            (jsonDescription.options || {})
        );
    }

    function wireRelationships(modelItem, json) {
        var links = json.relationships || {};

        for (var relationship in links) {
            var otherItemName = links[relationship],
                otherModelItem = modelItems[ otherItemName ];

            modelItem.with[relationship].call(modelItem, otherModelItem);
        }
    }

    function createAndWire(scenarioItem){

        var script = scenarioItem.script || [];

        return makeModel(scenarioItem)
            .inDemo(demo)
            .followingScript(script);
    }

    function createAndWireModelItem(scenarioItem){
        modelItems[scenarioItem.name] = createAndWire(scenarioItem);
    }

    // init the model items
    var demo
        = modelItems.demo
        = new Demo(scenarioId, (scenario.options || {}));

    var demoView = new DemoView(demo);
    
    demoView.withNarrativeView(new NarrativeView(demo, demoView));
    
    scenario.items.forEach(createAndWireModelItem);

    // link up- / downstream model items to each other
    scenario.items.forEach(function(scenarioItem){
        var modelItem = modelItems[scenarioItem.name];    

        scenarioItem.next.forEach(function( nextScenarioName ){

            if( !modelItems[nextScenarioName] ) {
                throw new Error(
                    'no such item as ' + nextScenarioName + 
                    ' given as downstream of ' + scenarioItem.name
                );
            }
            
            modelItem.withDownstream( modelItems[nextScenarioName] );
        });
    });

    // link up model items which refer to each other by name:
    scenario.items.forEach(function(scenarioItem){
        
        var modelItem = modelItems[scenarioItem.name];

        wireRelationships(modelItem, scenarioItem);
    });

    // create and wire the narrative:
    (scenario.narrative || []).forEach(function(narrativeJson){
        
        var narrativeItem = createAndWire(narrativeJson);
        wireRelationships(narrativeItem, narrativeJson);
        narrativeItem.announce();
    });

    // announce all the new model items
    scenario.items.forEach(function(scenarioItem){
        modelItems[scenarioItem.name].announce();
    });
    
    demo.startSimulation = function() {
        scenario.options.startSimulation(modelItems);
    }
}

$(function(){
    $('[data-demo]').each(function( _i, element ){
        loadScenario( element.getAttribute('data-demo') );
    })
    recordHeadingsPosition();
    updateActiveHeading();
});
