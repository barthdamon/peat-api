//MARK: DEPENDENCIES
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var API_AUTH_PASSWORD = "fartpoop";
var moment = require('moment');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');

//MARK: CONFIG
app.set('jwtTokenSecret', 'secretStringFTW');

//MARK: MODEL
var userSchema = mongoose.Schema({
	email: { type: String, unique: true }, 
	password: String
});
var User = mongoose.model('User', userSchema);

//MARK: EXPORTS
module.exports = function(req, res, next) {
	if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
		switch (req.body.params.auth_type) {
			case "Basic":
					//check if there is a correct user
					// on client need to login during the success callback of the basic auth get request
				User.find({ email: req.body.params.user.email }, function(err, user){
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
				break;
			case "Token":
				if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
					//query the db for the jwt that matches the user
					var token = (req.body && req.body.params.token) || req.headers['token'];
					if (token) {
					  	try {
				   		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
					  	} catch (err) {
					  		res.status(404).json({"message" : "Incorrect Auth Token: "+err});
					  	}
					  	console.log(decoded);

					  	//get user id from the db, check to make sure the exp isn't invalid
					  	if (decoded.iss == user.id && decoded.exp >= moment()) {
					  		// if token expired, send to refresh token function, which sends res informing client they need to basic auth
					  		res.status(200).json({"message" : "Correct auth credentials"});
					  	} else {
					  		res.status(404).json({"message" : "Auth token invalid"});					  		
					  	}

					} else {

					}
				}
				break;
			default:
				res.status(400).json({"message" : "Invalid auth type"});
				break;
		}
	}
};




