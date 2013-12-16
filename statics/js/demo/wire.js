
function loadScenario(scenarioId) {
    var scenario = getScenario(scenarioId);
    
    if( !scenario ) {
        console.warn('no scenario for ' + scenarioId);
        return;
    }
    
    console.log('setting up demo', scenario);
    
    var modelItems = {},
        itemViews = {};

    function makeModel(scenarioItem){
        var Type = modelType(scenarioItem.type);

        return new Type(
            scenarioItem.name,
            scenarioItem.locations,
            (scenarioItem.options || {})
        );
    }

    function modelType(scenarioType){
        switch(scenarioType){
            case "server":              return Server;
            case "wire":                return Wire;
            case "client":              return Client;
            case "aggregatingServer":   return AggregatingServer;
            case "barrier":             return Thing;
            case "relay":               return Relay;
        }
        throw new Error('unknown type ' + scenarioType);
    }

    function viewType(scenarioType){
        switch(scenarioType){
            case "aggregatingServer":  
            case "server":  
                    return ServerView;
            case "wire":    
                    return WireView;
            case "client":  
                    return ClientView;
            case "barrier":             
                    return BarrierView;
            case "relay":
                    return RelayView;            
        }
        throw new Error('no view for type ' + scenarioType);
    }

   
    // init the model items
    var demo
        = modelItems.demo
        = new Demo(scenarioId, (scenario.options || {}));
    
    scenario.items.forEach(function (scenarioItem){

        modelItems[scenarioItem.name] = makeModel(scenarioItem).inDemo(demo);
    });
    

    // link up model items to each other
    scenario.items.forEach(function(scenarioItem){
        var modelItem = modelItems[scenarioItem.name];    

        scenarioItem.next.forEach(function( nextScenarioName ){

            modelItem.withDownstream( modelItems[nextScenarioName] );
        });
    });    
    
    
    // make some views:
    var demoView = new DemoView(demo);
    
    scenario.items.forEach(function(scenarioItem){
        var modelItem = modelItems[scenarioItem.name],
            ViewType = viewType(scenarioItem.type);
        
        itemViews[scenarioItem.name] = new ViewType(modelItem, demoView);
    });

    // TODO: get from scenario or something:
    demo.startSimulation = function(){
        modelItems.client.makeRequest();
    }
}

$(function(){
    $('[data-demo]').each(function( _i, element ){
        loadScenario( element.getAttribute('data-demo') );
    })
});