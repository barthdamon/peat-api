'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var User = require('./User.js');

//MARK: Friends
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

exports.confirmFriend = function(req, res) {
	let sender = req.user._id;
	let recipient = req.body.recipient;
	let currentTime = Date.now();

	Friend.update({ 'sender' : sender, 'recipient' : recipient }, { 'confirmed' : true }, function (err, result) {
		if (err) {
		res.status(400).json({"message": "Error occured while confirming friend"});
		} else {
			console.log("friend confirmation result: " + result);
			res.status(200).json({"message": "Friend confirmed"});
		}
	});
}

exports.getFriends = function(req, res) {
	let user = req.body.user;
	var fetchedFriends = [];
	User.find( { sender: user, recipient: user }, function(err, friends) {
		if (err) {
			console.log(err);
			res.status(400).json({"message": "Error getting friends: " + err});
		} else {
			fetchedFriends = friends;
			res.status(200).json({"friends": fetchedFriends});
		}
	});
}
