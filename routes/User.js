'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');
var jwt = require('jwt-simple');

var User = require('../models/UserSchema.js');
var Profile = require('./../models/ProfileSchema.js');
var ProfileRoute = require('./Profile.js');
var LocalUser = require('./User.js');
var Friend = require('./Friend.js');

//MARK: Internal
exports.userInfo = function(user) {
	return {
		_id: user._id,
		first: user.first,
		last: user.last,
		username: user.username,
		email: user.email
	};
}


//MARK: External
//New
exports.createUser = function(req, res) {
	let first = req.body.first;
	let last = req.body.last;
	let username = req.body.username;
	let email = req.body.email;
	let password = req.body.password;
	let currentTime = Date.now();

	let newUser = new User({
		first: first,
		last: last,
		username: username,
		email: email, 
		password: password,
		joined: currentTime
	});

	var user_Id = "";

	//When new user is created a user profile needs to be created as well
	newUser.save()
		.then(function(result){
			return User.findOne({email: email}).exec()
		})
		.then(function(user){
			user_Id = user._id;
			let newProfile = new Profile({
				user_Id: user_Id,
			});
			return newProfile.save()
		})
		.then(function(result){
			let token = generateToken(user_Id);
			res.status(200).json(token);
		})
		.catch(function(err){
			res.status(400).json({ message: "user create failure: " + err });
		})
	.done();
}

//Basic Auth
exports.login = function(req, res) {
	console.log(req.body.emailUsername);
	User.findOne({ $or: [{email: req.body.emailUsername}, {username: req.body.emailUsername}] }, function(err, user) {
		if (user) {
			console.log("User account exists, attempting login for " + req.body.emailUsername);
			var user_Id = user._id;
			user.comparePassword(req.body.password, function(err, isMatch) {
        		if (err) {
        			res.status(403).json({"message": "User password incorrect"});
        		} else {
        			var token = generateToken(user_Id);
					res.status(200).json(token);
        		}
   		});
		} else {
			res.status(400).json({ message: "User not found"});
		}
	});
}

function generateToken(user_Id) {
	var date = Date.now();
	var expires = date + 604800000;
	//encode using the jwt token secret
	var token = jwt.encode({
	  	iss: user_Id,
	  	exp: expires
	}, process.env.JWT_SECRET_TOKEN);

	let tokenResponse = {
	  api_authtoken : token,
	  authtoken_expiry: expires		
	} 

	return tokenResponse
}

exports.searchUsers = function(req, res) {
	var searchTerm = req.params.term;
	console.log("User Search Term: " +searchTerm);
	User.find( {$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {name: {$regex: searchTerm, $options: 'i'}} ] }, function(err, users) {
		if (users) {
			let info = [];
			users.forEach(function(user){
				info.push(LocalUser.userInfo(user));
			});
			res.status(200).json({ users: info});
		} else {
			res.status(400).json({ message: "Error finding users"});
		}
	});
}
