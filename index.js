
var express = require('express'),
    app = express(),
    cons = require('consolidate'),
    readContent = require('./read-content.js');


app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function respondWithMarkdown(res, markdownFilename, opts){
    opts = opts || {};

    readContent(markdownFilename, function( html ){
        opts.content = html;
        res.render('page', opts);
    });
}

app
   .get('/', function(req, res){
       respondWithMarkdown(res, 'index', {
         contentTitle:'Streaming JSON loading for Node and browsers',
         home:'true'
       });
   })
   .get('/:page', function(req, res){
       respondWithMarkdown(res, req.params.page, {contentTitle:'API'});
   })
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   .listen(8888);