//MARK: GLOBAL DEPENDENCIES
var express = require('express');
mongoose = require('mongoose');
app = express();

//MARK: MODULES
var bodyParser = require('body-parser');

//MARK: CUSTOM DEPENDENCIES
var jwtauth = require('./jwtauth.js');
var users = require('./models/User.js');
var media = require('./models/Media.js');


//MARK: CONFIG
app.set('jwtTokenSecret', 'secretStringFTW');
mongoose.connect('mongodb://localhost/peatAPI');



//MARK: MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(jwtauth);


//MARK: ROUTES
app.get('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});
app.post('/', function(req, res) {
	res.status(200).json({"message":"Server Online"});
});


app.post('/login', users.login);
app.post('/media', media.postMedia);
app.get('/media', media.getMedia);



app.get('/fart', function(req, res) {
 res.writeHead(200, {"Content-Type": "application/json"});
 // var userObj = req.get('user');
 var userObj = req.user;
 console.log(userObj);
 // var authedUser = userObj[0]['email'];

  var otherArray = ["item1", "item2"];
  var otherObject = { item1: "item1val", item2: "item2val" };
  var json = JSON.stringify({ 
    anObject: otherObject, 
    anArray: otherArray, 
    USER: userObj
  });

  res.end(json);

});

app.listen(3000);
