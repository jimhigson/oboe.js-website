// setup the application
function start() {

    var server, wire, client,
        serverView, wireView, clientView,
        serverLocation = {x:40,y:55}, clientLocation = {x:465,y:145};
    
    server = new Server('webServer',
                        {where:serverLocation}
                        , 100, 500
    ).withDownstream(
        wire = new Wire('internet',
                        {downstream: clientLocation, upstream:serverLocation}
        ).withDownstream(
            client = new Client('little_jimmy',
                                {where:clientLocation}
            )
        )
    );
    
    wireView = new WireView(wire);
    clientView = new ClientView(client);
    serverView = new ServerView(server);

    client.makeRequest();    
}

start();