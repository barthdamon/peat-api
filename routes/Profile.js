'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

/*
profile page should just be the users picture, their summary of themselves, their contact info, 
their friends and who they are following
and then their activities and how many leaves they have completed in each one.
*/
var Friend = require('./../models/FriendSchema.js');
var Follow = require('./../models/FollowSchema.js');
var Profile = require('./../models/ProfileSchema.js');
var User = require('./../models/UserSchema.js');
var UserRoute = require('./User.js');

exports.userProfile = function(req, res) {
	let userData = {};
	let user_Id = req.params.id != null ? req.params.id : req.user._id;
	console.log("Generating User Profile For: " +user_Id);

	User.find({"_id": user_Id}).exec()
		.then(function(user){
			userData.userInfo = UserRoute.userInfo(user);
			return Profile.find({"user_Id": user_Id}).exec()
		})
		.then(function(profile){
			//Profile NEEDS to be updated every time an activity is saved.
			userData.profile = profile;
			return Friend.find({ $or: [{ sender_Id: user_Id }, { recipient_Id: user_Id }] }).exec()
		})
		.then(function(friends){
			userData.friends = friends;
			return Follow.find({"follower_Id": user_Id}).exec()
		})
		.then(function(following){
			userData.following = following;
			return Leaf.find({"user_Id": user_Id}).exec()
		})
		.then(function(leaves){
			//Need to parse through.
			// var activities = {};
			leaves.forEach(function(leaf){
				// if (activities[leaf.activityName]) {
				// 	let activity = activities[leaf.activityName];
				// 	activity[leaf.completionStatus] += 1;
				// } else {
					userData.activities[leaf.activityName][leaf.completionStatus] += 1;
				// }
			});
			//want an array. Each item has an activity name and a number of leaves completed, learning, and goal field.
			//first for each leaf add the activity name and 
			// userData.progress = friends;
			// return Follow.find({"follower_Id": user_Id}).exec()
			res.status(200).json({ userData: userData});
		}).catch(function(err){
			console.log("Error fetching user profile for " +user_Id + ": " + err);
			res.status(400).json({ message: "Error fetching user profile"});
		})
	.done();
}

exports.uploadAvatar = function(req, res) {
	Profile.update({ 'user_Id' : req.user._id }, { 'avatarId' : req.body.avatarId }, function(err, result) {
		if (err) {
			res.status(400).json({ message: "Error occured updating profile"});
		} else {
			console.log("profile update result: " + result);
			res.status(200).json({ message: "Profile updated"});
		}
	});
}

exports.uploadContact = function(req, res) {
	Profile.update({ 'user_Id' : req.user._id }, { 'contact' : req.body.contact }, function(err, result) {
		if (err) {
			res.status(400).json({ message: "Error occured updating profile"});
		} else {
			console.log("profile update result: " + result);
			res.status(200).json({ message: "Profile updated"});
		}
	});
}

exports.uploadSummary = function(req, res) {
	Profile.update({ 'user_Id' : req.user._id }, { 'summary' : req.body.summary }, function(err, result) {
		if (err) {
			res.status(400).json({ message: "Error occured updating profile"});
		} else {
			console.log("profile update result: " + result);
			res.status(200).json({ message: "Profile updated"});
		}
	});	
}