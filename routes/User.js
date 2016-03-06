'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');
var jwt = require('jwt-simple');

var User = require('../models/UserSchema.js');
var Gallery = require('../models/GallerySchema.js');

//MARK: Internal
exports.userInfo =  userInfo;
function userInfo(user) {
	return {
		_id: user._id,
		name: user.name,
		username: user.username,
		email: user.email,
		type: user.type,
		profile: user.profile
	};
}


//MARK: External
//New
exports.createUser = function(req, res) {
	let name = req.body.name;
	let username = req.body.username;
	let email = req.body.email;
	let password = req.body.password;
	let type = req.body.type;
	let currentTime = Date.now();

	let newUser = new User({
		name: name,
		username: username,
		email: email, 
		password: password,
		type: type,
		joined: currentTime,
		profile: {
			contact: email,
		}
	});

	var user_Id = "";

	newUser.save()
		.then(function(result){
			return User.findOne({email: email}).exec()
		})
		.then(function(user){
			user_Id = user._id;
			let newGallery = new Gallery({
				user_Id: user_Id
			})
			return newGallery.save()
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
	var user_Ids = [];

	User.find({$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {name: {$regex: searchTerm, $options: 'i'}}] }).exec()
		.then(function(userModels){
			var userInfos = [];
			userModels.forEach(function(user){
				userInfos.push({userInfo: userInfo(user)});
			});
	 		res.status(200).json({ users: userInfos});
		})
		.catch(function(err){
			console.log(err);
	 		res.status(400).json({ message: "Error finding users"});
		})
	.done();
}

exports.userProfilesForIds = function(ids) {
	return new Promise(function(resolve, reject) {
		User.find({_id: {$in: ids}}).exec()
		.then(function(users){
			var userInfos = [];
			users.forEach(function(user){
				userInfos.push({userInfo: userInfo(user)});
			});
	 		resolve(userInfos);
		})
		.catch(function(err){
			console.log("ERROR GETTING USER PROFILES: " + err);
	 		reject(err);
		})
	.done();
	});
}

exports.updateUser = function(req, res) {
	let user = req.body.user;
	User.update({_id: req.user._id }, user).exec()
		.then(function(result){
			console.log("user update success");
			res.status(200).json({message: "user update success"});
		})
		.catch(function(err){
			res.status(400).json({message: "Error occured updating user"});
		})
	.done();
}
