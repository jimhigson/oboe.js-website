
var express = require('express'),
    slashes = require('connect-slashes'),
    app = express(),
    consolidate = require('consolidate'),
    readContent = require('./read-content.js'),
    readPagesList = require('./read-pages-list.js'),
    barrier = require('./barrier.js'),
    
    PORT = '8888',

    UNMINIFIED_SCRIPTS = [
        "/jquery/jquery.js"
    ,   "/js/jquery.sticky.js"
    ,   "/js/internalNav.js"
    ,   "/js/demo/cssHooks.js"
    ,   "/js/demo/functional.js"
    ,   "/js/demo/lists.js"
    ,   "/js/demo/singleEventPubSub.js"
    ,   "/js/demo/pubSub.js"
    ,   '/js/demo/scenarios.js'
    ,   '/js/demo/demoModel.js'
    ,   "/js/demo/view/viewUtils.js"        
    ,   "/js/demo/view/ThingView.js"
    ,   "/js/demo/view/ClientView.js"
    ,   "/js/demo/view/DemoView.js"
    ,   "/js/demo/view/MessageView.js"
    ,   "/js/demo/view/ServerView.js"
    ,   "/js/demo/view/WireView.js"
    ,   "/js/demo/view/PacketView.js"
    ,   "/js/demo/wire.js"
    ],

    CSS_STYLESHEETS = [
        "all.css"
    ],
        
    LATEST_TAG = 'v1.11.0';

require('colors');

app.engine('handlebars', consolidate.handlebars);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

/* create <template> elements to send to the client side */
function renderClientSideDemoTemplates(res, callback){
    var DEMO_TEMPLATE_OPTIONS = {packetRadius: 15};

    res.render('demoTemplate', DEMO_TEMPLATE_OPTIONS,
        function(err, demoContentHtml) {
            callback(demoContentHtml);
        });
}

function respondWithMarkdown(req, res, markdownFilename, opts){
    
    var view = req.query.mode == 'raw'? 'raw' : 'page';

    opts = opts || {};
    opts.scripts     = UNMINIFIED_SCRIPTS;
    opts.stylesheets = CSS_STYLESHEETS;
    opts.latestTag   = LATEST_TAG;
        
    var bar = barrier(function(){
        res.render(view, opts);
    });
    
    
    readPagesList(bar.add(function(pages){
        
        // mark one as current:
        pages.forEach(function(page){
            console.log(page.path, markdownFilename, page.path == markdownFilename);
            page.current = ( page.path == markdownFilename ); 
        });
        
        opts.pages = pages;
    }));

    readContent(markdownFilename, bar.add(function( outline ){

        opts.content = outline.content;
        opts.heading = outline.heading;
        opts.sections = outline.sections;
        res.status(outline.status);
    }));

    renderClientSideDemoTemplates(res, bar.add(function(templateHtml) {
        
        opts.templates = templateHtml;
    }));    
}

app
   .use(express.static('statics'))
   .use(express.static('bower_components'))
   .use(slashes())    
   .get('/', function(req, res){
        respondWithMarkdown(req, res, 'index', { home:'true' });
   })
   .get('/:page', function(req, res){
       respondWithMarkdown(req, res, req.params.page);
   })    
   .listen(PORT);

console.log('started on port', PORT.cyan);