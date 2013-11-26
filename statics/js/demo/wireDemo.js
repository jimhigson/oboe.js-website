// setup the application
var server, wire, client;

server = new Server('webServer')
    .withDownstream(
        wire = new Wire('internet')
            .withDownstream(
                client = new Client('little_jimmy')
            )
    );

client.makeRequest();