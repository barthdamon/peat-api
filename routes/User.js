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
   		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
	  	} catch (err) {
	  		res.status(404).json({"message" : "Incorrect Auth Token: "+err});
	  	}
		// if (decoded.exp < Date.now()) {res.status(300).json({"message" : "Auth Token Expired"})};
	  	User.find({ _id: decoded.iss }, function (err, user) {
	  		if (user) {
	  			// console.log(user[0]);
				return(user[0].email);		  			
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
	let name = req.body.params.user.name;
	let username = req.body.params.user.username;
	let email = req.body.params.user.email;
	let password = req.body.params.user.password;
	let newUser = new User({
		name: name,
		userName: username,
		email: email, 
		password: password,
		friends: []
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
	console.log(req.body.params.user.email);
	User.find({ email: req.body.params.user.email }, function(err, user) {
		if (user) {
			// console.log(user);
			var userID = user[0]['id'];
			// console.log(userID);
				if (req.body.params.user.password == user[0]['password']) {
					var date = Date.now()
					var expires = date + 604800000;
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
					res.status(403).json({"message": "User password incorrect"});
				}
		} else {
			res.status(400).json({"message": "User not found"});
		}
	});
}

//MARK: Friends
exports.putFriend = function(req, res) {
	//find the user in the db and then add the friend sent to that users array of friends
	var newFriendId = req.body.friend;
	var updatedFriends = [];
	var friendExists = false;
	console.log("1");

	if (newFriendId) {
		User.update({ '_id' : req.user._id }, { $addToSet : { 'friends': newFriendId } }, function (err, result) {
			if (err) {
			res.status(400).json({"message": "Error occured while adding friend"});
			} else {
				console.log(result);
				res.status(200).json({"message": "Friend Added"});
			}
	   });
   } else {
   	res.status(400).json({"message": "Could not parse friend to add"});
   }			
}

exports.getFriends = function(req, res) {
	var friends = req.user.friends;
	var fetchedFriends = [];
	User.find( { _id: { $in: friends }}, function(err, users) {
		if (err) {
			console.log(err);
		} else {
			fetchedFriends = users;
			if (fetchedFriends.length > 0) {
				res.status(200).json({"friends": fetchedFriends});
			} else {
				res.status(400).json({"message": "YOU HAVE NO FRIENDS"});
			}
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