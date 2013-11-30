
var express = require('express'),
    app = express(),
    consolidate = require('consolidate'),
    readContent = require('./read-content.js'),
    
    PORT = '8888',

    UNMINIFIED_SCRIPTS = [
        "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"
    ,   "/js/jquery.sticky.js"
    ,   "/js/internalNav.js"
    ],

    CSS_STYLESHEETS = [
        "all.css"
    ],
    
    LATEST_TAG = 'v1.11.0';

require('colors');

app.engine('handlebars', consolidate.handlebars);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

function respondWithMarkdown(req, res, markdownFilename, opts){

    function getMarkupView(req){
        return req.query.mode == 'raw'? 'raw' : 'page';
    }
    
    opts = opts || {};
    opts.scripts     = UNMINIFIED_SCRIPTS;
    opts.stylesheets = CSS_STYLESHEETS;
    opts.latestTag   = LATEST_TAG;
    
    readContent(markdownFilename, function( outline ){
    
        opts.content = outline.content;
        opts.heading = outline.heading;
        opts.sections = outline.sections;
        res.status(outline.status);
        res.render(getMarkupView(req), opts);
    });
}

app
   .get('/demo/', function(req, res){
      renderDemo(1, res);
   })    
   .get('/demo/:scenarioNumber', function(req, res){
      renderDemo(parseInt(req.params.scenarioNumber), res);
   })    
   .get('/', function(req, res){
        respondWithMarkdown(req, res, 'index', {
            home:'true'
        });
   })
   .get('/:page', function(req, res){
       respondWithMarkdown(req, res, req.params.page);
   })   
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   .listen(PORT);

function renderDemo(scenarioNumber, res){
    var DEMO_TEMPLATE_OPTIONS = {packetRadius: 15};

    res.render('demo', DEMO_TEMPLATE_OPTIONS,
        function(err, demoContentHtml) {
            res.render('page', {
                scripts:     UNMINIFIED_SCRIPTS
                    .concat([
                        "/js/demo/functional.js"
                        ,   "/js/demo/lists.js"
                        ,   "/js/demo/singleEventPubSub.js"
                        ,   "/js/demo/pubSub.js"
                        ,   '/js/demo/scenarios.js'
                        ,   '/js/demo/demoModel.js'
                        ,   "/js/demo/demoView.js"
                        ,   "/js/demo/wire.js"
                    ]),
                initScript:"loadScenario( " + scenarioNumber + ")",
                stylesheets: CSS_STYLESHEETS,
                content: demoContentHtml
            });
        });
}

console.log('started on port', PORT.cyan);