'use strict';

var express    = require('express');
var bodyParser = require('body-parser');
var morgan     = require('morgan');

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

var PORT = process.env.PORT || 6265;

app.use(express.static(__dirname+'/www/'));

app.use(function(req,res){
  console.log(404,req.originalUrl)
  res.sendFile(__dirname+'/www/index.html');
})

app.listen(PORT);
console.log('Frontend Web Server started on localhost:'+PORT);
