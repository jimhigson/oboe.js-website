// setup the application
var server, wire, client,
    serverView, wireView, clientView,
    serverLocation = {x:15,y:55}, clientLocation = {x:440,y:85};

server = new Server('webServer',
                    {where:serverLocation}
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

client.makeRequest();