'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');
var jwt = require('jwt-simple');

var User = require('../models/UserSchema.js');

exports.findUser = function (req) {
	var token = req.get('token');
	if (token) {
	  	try {
   		var decoded = jwt.decode(token, process.env.JWT_SECRET_TOKEN);
	  	} catch (err) {
	  		res.status(404).json({"message" : "Incorrect Auth Token: "+err});
	  	}
		// if (decoded.exp < Date.now()) {res.status(300).json({"message" : "Auth Token Expired"})};
	  	User.findOne({ _id: decoded.iss }, function (err, user) {
	  		if (user) {
	  			// console.log(user[0]);
				return(user.email);		  			
	  		} else {
				res.status(400).json({"message": "Token not matched to user"});					  			
	  		}
	  	});
	} else {
	res.status(400).json({"message" : "Invalid tokenAuth request format"});
	}
}

exports.attachUser = function(req, id) {
	return new Promise(function(resolve, reject) {
	  	User.findOne({ _id: id }, function (err, user) {
	  		if (user) {
	  			console.log("<<<USER FOUND THROUGH TOKEN AUTH: " + user + ">>>");
	  			req.user = user;
	  			resolve(user);		  							  			
	  		} else {
				reject(err);			  			
	  		}
	  	});
	});
}

//MARK: New
exports.createUser = function(req, res) {
	let first = req.body.user.first;
	let last = req.body.user.last;
	let username = req.body.user.username;
	let email = req.body.user.email;
	let password = req.body.user.password;

	let newUser = new User({
		first: first,
		last: last,
		username: username,
		email: email, 
		password: password
	});

	newUser.save(function(err) {
		if (err) {
			res.status(400).json({ "message": "user create failure: " + err });
		} else {
			res.status(200).json({ "message": "user create success" });
		}
	});
}

//MARK: Basic Auth
exports.login = function(req, res) {
	console.log(req.body.user.email);
	User.findOne({ email: req.body.user.email }, function(err, user) {
		if (user) {
			// console.log(user);
			var userId = user['id'];
			// console.log(userID);
			user.comparePassword(req.body.user.password, function(err, isMatch) {
        		if (err) {
        			res.status(403).json({"message": "User password incorrect"});
        		} else {
					var date = Date.now();
					var expires = date + 604800000;
					//encode using the jwt token secret
					var token = jwt.encode({
					  	iss: userId,
					  	exp: expires
					}, process.env.JWT_SECRET_TOKEN);

					res.status(200).json({
					  api_authtoken : token,
					  authtoken_expiry: expires,
					  user: user.userId
					});
        		}
   		});
		} else {
			res.status(400).json({"message": "User not found"});
		}
	});
}

exports.searchUsers = function(req, res) {
	var searchTerm = req.body.searchTerm
	console.log("User Search Term: " +searchTerm);
	User.find( {$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {name: {$regex: searchTerm, $options: 'i'}} ] }, function(err, users) {
		if (users) {
			res.status(200).json({"users": users});
		} else {
			res.status(400).json({"message": "Error finding users"});
		}
	});
}