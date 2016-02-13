'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');
var jwt = require('jwt-simple');

var User = require('../models/UserSchema.js');
var Profile = require('./../models/ProfileSchema.js');

//MARK: Internal
exports.userInfo =  userInfo;
function userInfo(user) {
	return {
		_id: user._id,
		first: user.first,
		last: user.last,
		username: user.username,
		email: user.email,
		type: user.type
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
	let type = req.body.type;
	let currentTime = Date.now();

	let newUser = new User({
		first: first,
		last: last,
		username: username,
		email: email, 
		password: password,
		type: type,
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
	var user_Ids = [];

	User.find({$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {first: {$regex: searchTerm, $options: 'i'}}, {last: {$regex: searchTerm, $options: 'i'}}] }).exec()
		.then(function(userModels){
			var userInfos = [];
			userModels.forEach(function(user){
				userInfos.push({userInfo: userInfo(user)});
				user_Ids.push(user._id);
			});
			req.userInfos = userInfos;
			console.log("user ids: " + user_Ids);
			return Profile.find({"user_Id": {$in: user_Ids}}).exec()
		})
		.then(function(profiles){
			console.log("profiles: " + profiles);
			profiles.forEach(function(profile){
				req.userInfos.forEach(function(user){
					if (user.userInfo._id == profile.user_Id) {
						user.profile = profile;
					}
				})
			})
	 		res.status(200).json({ users: req.userInfos});
		})
		.catch(function(err){
			console.log(err);
	 		res.status(400).json({ message: "Error finding users"});
		})
	.done();
}

exports.userProfilesForIds = function(ids) {
	var userInfos = [];
	return new Promise(function(resolve, reject) {
		User.find({_id: {$in: ids}}).exec()
		.then(function(userModels){
			userModels.forEach(function(user){
				userInfos.push({userInfo: userInfo(user)});
			});
			return Profile.find({"user_Id": {$in: ids}}).exec()
		})
		.then(function(profiles){
			console.log("profiles: " + profiles);
			profiles.forEach(function(profile){
				userInfos.forEach(function(user){
					if (user.userInfo._id == profile.user_Id) {
						user.profile = profile;
					}
				})
			})
			console.log("USERINFOS GENERATED: " + JSON.stringify(userInfos));
	 		resolve(userInfos);
		})
		.catch(function(err){
	 		reject(err);
		})
	.done();
	});
}

// exports.userProfileForId = function(id) {
// 	return new Promise(function(resolve, reject) {
// 		var info = {};

// 		User.findOne({_id: id}).exec()
// 			.then(function(user){
// 				console.log("USER FOUND: ::" + user);
// 				info = userInfo(user);
// 				var user_Id = user._id;
// 				return Profile.findOne({"user_Id": user_Id}).exec()
// 			})
// 			.then(function(profile){
// 				info.profile = profile
// 		 		resolve(info);
// 			})
// 			.catch(function(err){
// 				reject(err);
// 			})
// 		.done();
// 	});
// }
