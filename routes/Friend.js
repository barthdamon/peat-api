'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var User = require('./User.js');

exports.createFriend = function(req, res) {
	let sender = req.user._id;
	let recipient = req.body.recipient;
	let currentTime = Date.now();

	let newFriend = new Friend({
		sender_id: sender,
		recipient_id: recipient,
		confirmed: false,
		timestamp: currentTime
	});

	newFriend.save(function(err) {
		if (err) {
			res.status(400).json({ message: "friend create failure: " + err });
		} else {
			res.status(200).json({ message: "friend create success" });
		}
	});
}

exports.confirmFriend = function(req, res) {
	//user confirming must have recieved
	let sender = req.body.sender;
	let recipient = req.user._id;
	let currentTime = Date.now();

	Friend.update({ 'sender_Id' : sender, 'recipient_Id' : recipient }, { 'confirmed' : true, 'timestamp' : currentTime }, function(err, result) {
		if (err) {
		res.status(400).json({ message: "Error occured while confirming friend"});
		} else {
			console.log("friend confirmation result: " + result);
			res.status(200).json({ message: "Friend confirmed"});
		}
	});
}

exports.destroyFriendship = function(req, res) {
	//either sender or recipient must be able to destroy
	let destructor = req.user._id;
	let destructed = req.body.destructed;
	console.log("Friendship being destroyed, destructor: "+ destructor + " destructed: " + destructed);
	Friend.remove({ $or : [{ sender_Id: destructor, recipient_Id: destructed }, { sender_Id: destructed, recipient_Id: destructor }]}, function(err, result) {
		if (err) {
			console.log("Error destroying friend: "+ err);
			res.status(400).json({ message: "Error occured while destroying friend"});
		} else {
			console.log("friend destruction result: " + result);
			res.status(200).json({ message: "Friend destroyed"});
		}		
	});
}

