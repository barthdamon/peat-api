//MARK: GLOBAL DEPENDENCIES
var express = require('express');
mongoose = require('mongoose');
app = express();

//MARK: MODULES
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var moment = require('moment');
// var config = require('./config.js');

//MARK: CUSTOM DEPENDENCIES
var jwtauth = require('./jwtauth.js');
var users = require('./models/User.js');


//MARK: CONFIG
app.set('jwtTokenSecret', 'secretStringFTW');
mongoose.connect('mongodb://localhost/peatAPI');



//MARK: MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(jwtauth);


//MARK: ROUTES
app.post('/login', function(req, res) {
	users.User.find({ email: req.body.params.user.email }, function(err, user) {
		if (user) {
			console.log(user);
			var userID = user[0]['id'];
			console.log(userID);
				if (req.body.params.user.password == user[0]['password']) {
					var expires = moment().add(7, 'days').valueOf();
					//encode using the jwt token secret
					var token = jwt.encode({
					  	iss: userID,
					  	exp: expires
					}, app.get('jwtTokenSecret'));

					res.status(200).json({
					  api_authtoken : token,
					  authtoken_expiry: expires,
					  user_email: user.email
					});
				} else {
					res.status(400).json({"message": "User password incorrect"});
				}
		} else {
			res.status(400).json({"message": "User not found"});
		}
	});
});

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
