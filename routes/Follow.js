'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Follow = require('./../models/FollowSchema.js');
var User = require('./User.js');

exports.newFollow = function(req, res) {
	let follower = req.user._id;
	let following = req.params.id;
	let followingActivity = req.params.activity;
	let currentTime = Date.now();

	let newFollow = new Follow({
		follower_Id: sender,
		following_Id: recipient,
		followingActivity: followingActivity,
		timestamp: currentTime
	});

	newFollow.save(function(err) {
		if (err) {
			res.status(400).json({ message: "follow create failure: " + err });
		} else {
			res.status(200).json({ message: "follow create success" });
		}
	});
}

//d
exports.removeFollow = function(req, res) {
	//either sender or recipient must be able to destroy
	let remover = req.user._id;
	let removed = req.params.id;

	console.log("Follow being removed by: "+ remover + " of: " + removed);
	Follow.remove({ follower_Id: remover, following_Id: removed}, function(err, result) {
		if (err) {
			console.log("Error removing follow: "+ err);
			res.status(400).json({ message: "Error occured while removing follow"});
		} else {
			console.log("Follow remove result: " + result);
			res.status(200).json({ message: "Follow removed"});
		}		
	});
}

