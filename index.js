
var express = require('express'),
    app = express(),
    cons = require('consolidate');

app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app
   .get('/', function(req, res){
      res.render('index', {content:'woo'});
   })
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   /* app.use(function(err, req, res, next){
        if( err ){
            res.status(500);
            res.render('error', { error: err });
        }
    }) */
   .listen(8888);