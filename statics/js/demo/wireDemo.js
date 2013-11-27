// setup the application
var server, wire, client;

server = new Server('webServer')
    .withDownstream(
        wire = new Wire('internet', {x:15,y:55}, {x:440,y:55})
            .withDownstream(
                client = new Client('little_jimmy')
            )
    );

client.makeRequest();