
function loadScenario(scenarioId) {

    var MODEL_TYPES = {
        "server":              Server,
        "wire":                Wire,
        "client":              Client,
        "aggregatingServer":   AggregatingServer,
        "barrier":             Barrier,
        "relay":               Relay,
        "cache":               Cache
    };
    
    var scenario = getScenario(scenarioId);
    
    if( !scenario ) {
        console.warn('no scenario for ' + scenarioId);
        return;
    }
    
    console.log('setting up demo', scenario);
    
    var modelItems = {};

    function makeModel(scenarioItem){
        var Type = MODEL_TYPES[scenarioItem.type];

        return new Type(
            scenarioItem.name,
            scenarioItem.locations,
            (scenarioItem.options || {})
        );
    }
   
    // init the model items
    var demo
        = modelItems.demo
        = new Demo(scenarioId, (scenario.options || {}));

    new DemoView(demo);
    
    scenario.items.forEach(function (scenarioItem){

        var script = scenarioItem.script || {};
        
        modelItems[scenarioItem.name] = makeModel(scenarioItem)
                                            .inDemo(demo)
                                            .followingScript(script);
    });
    

    // link up- / downstream model items to each other
    scenario.items.forEach(function(scenarioItem){
        var modelItem = modelItems[scenarioItem.name];    

        scenarioItem.next.forEach(function( nextScenarioName ){

            modelItem.withDownstream( modelItems[nextScenarioName] );
        });
    });

    // link up model items which refer to each other by name:
    scenario.items.forEach(function(scenarioItem){
        
        var modelItem = modelItems[scenarioItem.name],
            links = scenarioItem.relationships || {};
        
        for( var relationship in links ){
            var otherItemName = links[relationship],
                otherModelItem = modelItems[ otherItemName ];
            
            modelItem.with[relationship].call(modelItem ,otherModelItem);
        }
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
});
