//MARK: DEPENDENCIES
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var jwtauth = require('./jwtauth.js');



//MARK: CONFIG
mongoose.connect('mongodb://localhost/peatAPI');
// app.set('jwtTokenSecret', 'secretStringFTW');




//MARK: MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(jwtauth);


//MARK: ROUTES
app.get('/', function(req, res) {

 res.writeHead(200, {"Content-Type": "application/json"});

  var otherArray = ["item1", "item2"];
  var otherObject = { item1: "item1val", item2: "item2val" };
  var json = JSON.stringify({ 
    anObject: otherObject, 
    anArray: otherArray, 
    another: "FUCK YES"
  });

  res.end(json);

});

app.listen(3000);
