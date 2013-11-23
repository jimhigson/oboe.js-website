
var express = require('express'),
    app = express(),
    consolidate = require('consolidate'),
    readContent = require('./read-content.js');

app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function respondWithMarkdown(res, markdownFilename, opts){
    opts = opts || {};

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
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   .listen(8888);