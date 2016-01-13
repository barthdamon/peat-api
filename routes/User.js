'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');
var jwt = require('jwt-simple');

var User = require('../models/UserSchema.js');
var LocalUser = require('./User.js');
var Friend = require('./Friend.js');


//MARK: Internal
exports.findUser = function (userId) {
	return new Promise(function(resolve, reject) {
	  	User.findOne({ _id: userId }, function (err, user) {
	  		if (user) {
	  			resolve(user);		  							  			
	  		} else {
				reject(err);			  			
	  		}
	  	});
	});
}

function localFindUser(userId, cb) {
  	User.findOne({ _id: userId }, function (err, user) {
  		if (user) {
  			cb(null, user);		  							  			
  		} else {
			cb(err, null);			  			
  		}
  	});
}

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

//Basic Auth
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
	var searchTerm = req.params.term;
	console.log("User Search Term: " +searchTerm);
	User.find( {$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {name: {$regex: searchTerm, $options: 'i'}} ] }, function(err, users) {
		if (users) {
			let info = [];
			users.forEach(function(user){
				info.push(LocalUser.userInfo(user));
			});
			res.status(200).json({"users": info});
		} else {
			res.status(400).json({"message": "Error finding users"});
		}
	});
}

exports.userProfile = function(req, res) {
	let userData = {};
	let userId = req.params.id != null ? req.params.id : req.user._id;
	console.log("GENERATING USER PROFILE FOR: " +userId);

	localFindUser(userId, function(err, user){
		if (err) {
			console.log("Error fetching user " + user);
			res.status(400).json({message: "Error fetching user"});
		} else {
			userData.userInfo = LocalUser.userInfo(user);
				//Attach friend data
			return Friend.findFriends(userId).then(function(fetchedFriends){
				userData.friends = fetchedFriends;
				res.status(200).json({"userData" : userData});
			}).catch(function(err){
				console.log("Error fetching friends" + err);
			});
		}
	});
}
