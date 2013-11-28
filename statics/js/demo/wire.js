// setup the application
var server, wire, client,
    serverView, wireView, clientView;

server = new Server('webServer')
    .withDownstream(
        wire = new Wire('internet')
            .withDownstream(
                client = new Client('little_jimmy')
            )
    );

wireView = new WireView(wire, {x:15,y:55}, {x:440,y:55});

client.makeRequest();