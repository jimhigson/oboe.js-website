
var express = require('express'),
    app = express(),
    cons = require('consolidate'),
    fs = require('fs');

app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function readMarkdown(markdownFileName, callback, errCallback) {
    fs.readFile('content/' + markdownFileName + '.md', function(err, markdownBuffer){
        var markdownStr = markdownBuffer.toString();

        require('marked')(markdownStr, function( err, html ){

            callback(html);
        });
    });
}

function respondWithMarkdown(res, markdownFilename, opts){
    opts = opts || {};

    readMarkdown(markdownFilename, function( html ){
        opts.content = html;
        res.render('page', opts);
    });
}

app
   .get('/', function(req, res){
       respondWithMarkdown(res, 'index', {contentTitle:'Streaming JSON loading for Node and browsers'});
   })
   .get('/api', function(req, res){
       respondWithMarkdown(res, 'api', {contentTitle:'API'});
   })
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   .listen(8888);