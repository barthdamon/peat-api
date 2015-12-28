'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();
var jwt = require('jwt-simple');

let API_AUTH_PASSWORD = process.env.API_PASSWORD;
var users = require('./../models/UserSchema.js');

//MARK: EXPORTS
module.exports = function(req, res, next) {
	console.log("hitting jtw auth");
	if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
		switch (req.get('auth_type')) {

			case "New":
				//check to make sure its going to create users, throw error if not
				next();
				break;

			case "Basic":
				console.log("BASIC AUTH");
				next();
				break;

			case "Token":
				if (req.get('api_auth_password') == API_AUTH_PASSWORD) {
					//query the db for the jwt that matches the user
					var token = req.get('token');
					var decoded = null;
					if (token) {
					  	try {
				   		decoded = jwt.decode(token, app.get('jwtTokenSecret'));
					  	} catch (err) {
					  		res.status(401).json({"message" : "Incorrect Auth Token: "+err});
					  	}
					  	console.log(decoded);

					  	// get user id from the db, check to make sure the exp isn't invalid
					  	// redirect to login here??
					  	// if (decoded.exp < Date.now()) {
					  	// 	res.status(300).json({"message" : "Auth Token Expired"})
					  	// } else {
						  	users.User.find({ _id: decoded.iss }, function (err, user) {
						  		if (user) {
						  			console.log("<<<USER FOUND THROUGH TOKEN AUTH: " + user[0] + ">>>");
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