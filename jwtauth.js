//MARK: DEPENDENCIES
var API_AUTH_PASSWORD = "fartpoop";
var moment = require('moment');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');
var users = require('./models/User.js');
// var config = require('./config.js');


//MARK: EXPORTS
module.exports = function(req, res, next) {
	if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
		switch (req.get('auth_type')) {

			case "Basic":
				next();
				break;

			case "Token":
				if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
					//query the db for the jwt that matches the user
					var token = req.get('token');
					if (token) {
					  	try {
				   		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
					  	} catch (err) {
					  		res.status(401).json({"message" : "Incorrect Auth Token: "+err});
					  	}
					  	// console.log(decoded);

					  	// get user id from the db, check to make sure the exp isn't invalid
					  	// redirect to login here??
					  	// if (decoded.exp < moment()) {
					  	// 	res.status(300).json({"message" : "Auth Token Expired"})
					  	// } else {
						  	users.User.find({ _id: decoded.iss }, function (err, user) {
						  		if (user) {
						  			console.log(user);
						  			req.user = user[0];		  			
						  			next();					  			
						  		} else {
									res.status(401).json({"message": "Token not matched to user"});					  			
						  		}
						  	});
					  	// }
					} else {
						res.status(400).json({"message" : "Invalid tokenAuth request format"});
					}
					break;
				} else {
					res.status(400).json({"message" : "Invalid post format"});
				}


			default:
				res.status(400).json({"message" : "Invalid auth type"});
				break;
		}
	} else {
		res.status(403).json({"message": "I'ma give you til the count of ten... To get your yella, dirty, no good keister off my property"});
	}
};




