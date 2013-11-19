
var express = require('express'),
    app = express();

app
   .get('/', function(req, res){
      res.sendfile('statics/html/index.html');
   })
   .use(express.static('statics'))
   .use(express.static('components/oboe/dist'))
   .use(express.static('components/jquery'))
   .use(express.static('components/d3'))
   .listen(8888);