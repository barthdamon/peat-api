'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var User = require('./User.js');

//c (adding a friend)
exports.createFriend = function(req, res) {
	let sender = req.user._id;
	let recipient = req.body.recipient;
	let currentTime = Date.now();

	let newFriend = new Friend({
		sender: sender,
		recipient: recipient,
		confirmed: false,
		timestamp: currentTime
	});

	newFriend.save(function(err) {
		if (err) {
			res.status(400).json({ "message": "friend create failure: " + err });
		} else {
			res.status(200).json({ "message": "friend create success" });
		}
	});
}

//r
exports.getFriends = function(req, res) {
	let user = req.body.user;
	findFriends(user).then(function(fetchedFriends) {
		res.status(200).json({"friends": fetchedFriends});
	}).catch(function(err) {
		res.status(400).json({"message": "Error getting friends: " + err});
	});
}

exports.findFriends = function(user) {
	return new Promise(function(resolve, reject) {
		var fetchedFriends = [];
		User.find({ $or : [{ sender: user }, { recipient: user }] }, function(err, friends) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				fetchedFriends = friends;
				resolve(fetchedFriends);
			}
		});
	});
}

//u
exports.confirmFriend = function(req, res) {
	//user confirming must have recieved
	let sender = req.body.sender;
	let recipient = req.user._id;
	let currentTime = Date.now();

	Friend.update({ 'sender' : sender, 'recipient' : recipient }, { 'confirmed' : true, 'timestamp' : currentTime }, function(err, result) {
		if (err) {
		res.status(400).json({"message": "Error occured while confirming friend"});
		} else {
			console.log("friend confirmation result: " + result);
			res.status(200).json({"message": "Friend confirmed"});
		}
	});
}

//d
exports.destroyFriendship = function(req, res) {
	//either sender or recipient must be able to destroy
	let destructor = req.user._id;
	let destructed = req.user.destructed;

	Friend.deleteOne({ $or : [{ sender: destructor, recipient: destructed }, { sender: destructed, recipient: destructor }]}, function(err, result) {
		if (err) {
			res.status(400).json({"message": "Error occured while destroying friend"});
		} else {
			console.log("friend destruction result: " + result);
			res.status(200).json({"message": "Friend destroyed"});
		}		
	});
}

