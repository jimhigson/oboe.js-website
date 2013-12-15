
var express = require('express'),
    gzippo = require('gzippo'),
    slashes = require('connect-slashes'),
    app = express(),
    consolidate = require('consolidate'),
    readContent = require('./read-content.js'),
    readPagesList = require('./read-pages-list.js'),
    barrier = require('./barrier.js'),
    environment = require('optimist')
                    .demand(['env'])
                    .argv.env,
    
    PORT = '8888',

    SCRIPTS = environment == 'prod'? ['/js-concat/all.js'] : require('./sourceList.js'),

    CSS_STYLESHEETS = environment == 'prod'? ["all-min.css"] : ["all.css"],
        
    LATEST_TAG = 'v1.11.0';

require('colors');

console.log('starting up for environment', environment.cyan );

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
    opts.scripts     = SCRIPTS;
    opts.stylesheets = CSS_STYLESHEETS;
    opts.latestTag   = LATEST_TAG;
        
    var bar = barrier(function(){
        res.render(view, opts);
    });
    
    
    readPagesList(bar.add(function(pages){
        
        // mark one as current:
        pages.forEach(function(page){
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
   .use(gzippo.staticGzip('statics'))
   .use(gzippo.staticGzip('bower_components'))
   .use(slashes())    
   .get('/', function(req, res){
        respondWithMarkdown(req, res, 'index', { home:'true' });
   })
   .get('/:page', function(req, res){
       respondWithMarkdown(req, res, req.params.page);
   })    
   .listen(PORT);

console.log('started on port', PORT.cyan);