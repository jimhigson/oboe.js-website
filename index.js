
var express = require('express'),
    app = express(),
    consolidate = require('consolidate'),
    readContent = require('./read-content.js');

app.engine('handlebars', consolidate.handlebars);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

function respondWithMarkdown(res, markdownFilename, opts){
    opts = opts || {};

    opts.scripts = [
        "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"
    ,   "/js/jquery.sticky.js"
    ,   "/js/app.js"        
    ];
    
    readContent(markdownFilename, function( outline ){
    
        opts.content = outline.content;
        opts.heading = outline.heading;
        opts.sections = outline.sections;
        
        console.log('making page with options', opts);        
         
        res.status(outline.status);
        res.render('page', opts);
    });
}

app
   .get('/', function(req, res){
       respondWithMarkdown(res, 'index', {
         home:'true'
       });
   })
   .get('/:page', function(req, res){
       respondWithMarkdown(res, req.params.page);
   })
/*  .get('/articles/:article', function(req, res){
        respondWithMarkdown(res, 'articles/' + req.params.article);
    })*/   
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   .listen(8888);