
function loadScenario(scenarioId) {
    var scenario = getScenario(scenarioId);
    
    console.log(scenario);
    
    var modelItems = {},
        itemViews = {};

    function makeModel(scenarioItem){
        var Type = modelType(scenarioItem.type);

        return new Type(
            scenarioItem.name,
            scenarioItem.locations,
            scenarioItem.options
        );
    }

    function modelType(scenarioType){
        switch(scenarioType){
            case "server":  return Server;
            case "wire":    return Wire;
            case "client":  return Client;
        }
        throw new Error('unknown type ' + scenarioType);
    }

    function viewType(scenarioType){
        switch(scenarioType){
            case "server":  return ServerView;
            case "wire":    return WireView;
            case "client":  return ClientView;
        }
        throw new Error('unknown type ' + scenarioType);
    }

   
    // init the model items
    var demo
        = modelItems.demo
        = new Demo(scenarioId);
    
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

    // TODO: put client requests as script-like things in scenarios
    modelItems.client.makeRequest();
}