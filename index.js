
var express = require('express'),
    gzippo = require('gzippo'),
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
        
    LATEST_TAG = 'v1.12.3',
    ANALYTICS_ID = 'UA-47871814-1',
    RAW_REPO_LOCATION = 'https://raw.github.com/jimhigson/oboe.js',
    REPO_LOCATION = 'https://github.com/jimhigson/oboe.js';

require('colors');

console.log('starting up for environment', environment.blue );

app.engine('handlebars', consolidate.handlebars);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

/* create <template> elements to send to the client side so it can
 * make visualisations by cloning them */
function renderClientSideDemoTemplates(res, callback){
    var DEMO_TEMPLATE_OPTIONS = {packetRadius: 15};

    res.render('demoTemplate', DEMO_TEMPLATE_OPTIONS,
        function(err, demoContentHtml) {
            callback(demoContentHtml);
        });
}

function defaultOpts(opts) {
    opts = opts || {};
    opts.scripts     = SCRIPTS;
    opts.stylesheets = CSS_STYLESHEETS;
    opts.latestTag   = LATEST_TAG;
    opts.analyticsId = ANALYTICS_ID;
    opts.repo = REPO_LOCATION;
    opts.rawRepo = RAW_REPO_LOCATION;
    opts.logoSize = 64;
    opts.releasedJs = RAW_REPO_LOCATION + '/' + LATEST_TAG + '/dist';
    
    return opts;
}

function respondWithMarkdown(req, res, getContentFn, opts){
    
    var view = req.query.mode == 'raw'? 'raw' : 'page',
        pageName = req.params.page || 'index';

    opts = defaultOpts(opts);
        
    var bar = barrier(function(){
        res.render(view, opts);
        console.log('html page', pageName.blue, 'created in', String(bar.duration).blue, 'ms');
    });
    
    
    readPagesList(bar.add(function(pages){
        // mark one as current:
        pages.forEach(function(page){
            page.current = ( page.path == pageName ); 
        });
        
        opts.pages = pages;
    }));

    getContentFn(req, opts, bar.add(function( outline ){

        opts.content = outline.content;
        opts.heading = outline.heading;
        opts.sections = outline.sections;
        res.status(outline.status);
    }));

    renderClientSideDemoTemplates(res, bar.add(function(templateHtml) {
        
        opts.templates = templateHtml;
    }));
}

function readMarkdownFromFile(req, opts, callback) {
   var mdFile = req.params.page || 'index';

   readContent(mdFile, opts, callback);
}

app
   .use(gzippo.staticGzip('statics')) // gzip for static
   .use(gzippo.staticGzip('pdf'))
   .use(gzippo.staticGzip('bower_components')) // gzip for static
   .use(express.compress()) // gzip for dynamic
   .get('/', function(req, res){
        respondWithMarkdown(req, res, readMarkdownFromFile,
            {   home: true,
                twitter: true
            });
   })
   .get('/:page', function(req, res){
       respondWithMarkdown(req, res, readMarkdownFromFile);
   });

// allow single demos to be viewed but only if we are in dev:
if( environment == 'dev' ) {
   app.get('/demo/:demo', function(req, res){
        
       function generateMarkdownForSingleDemo(req, opts, callback){
           var demoName = req.params.demo;
           
           callback({
               content:'<figure data-demo="' + demoName  + '"></figure>'
           ,   heading: {text:'Demo: ' + demoName}
           ,   sections:[]
           ,   status:200
           });
       }
        
       respondWithMarkdown( req, res, generateMarkdownForSingleDemo);
   })
}

// As a catch-all generate a 404.
app.use(function(req,res){
   req.params = {page:'404'};
   respondWithMarkdown(req, res, readMarkdownFromFile);
});

app.listen(PORT);

console.log('started on port', PORT.blue);
