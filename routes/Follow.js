'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Follow = require('./../models/FollowSchema.js');
var User = require('./User.js');
var Mailbox = require('./Mailbox.js');

exports.newFollow = function(req, res) {
	let follower = req.user._id;
	let following = req.body.following_Id;
	//TODO
	// let followingActivities = req.body.followingActivities;
	let currentTime = Date.now();

	let newFollow = new Follow({
		follower_Id: follower,
		following_Id: following,
		timestamp: currentTime
	});

	newFollow.save()
		.then(follow => {
			return Mailbox.createNotification(following, follower, "follow", null)
		})
		.then(notification => {
			res.status(200).json({message: "Follow created Successfully"});
		})
		.catch(err => {
			console.log(`Error creating follow ${err}`);
			res.status(400).json({message: "Follow creation failure " + err});
		})
	.done();
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

exports.getFollowing = function(req, res) {
	var user_Ids = [];
	let user_Id = req.params.id;
	console.log("Id: "+ user_Id);
	//This is where the user asks for all their friends
	Follow.find({ follower_Id: user_Id }).exec()
		.then(function(follow){
			console.log("follows: " + follow);
			follow.forEach(function(follow){
				user_Ids.push(follow.following_Id);
			});
			return User.userProfilesForIds(user_Ids)
		})
		.then(function(users){
			res.status(200).json({following: users});
		})
		.catch(function(err){
			res.status(400).json({message: "Error getting following: " + err});
		})
	.done();
}

