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
var User = require('./../models/UserSchema.js');
var UserRoute = require('./User.js');

exports.currentUserProfile = function(req, res) {
	let userData = {};
	let user_Id = req.user._id;
	let needsMailbox = req.params.id != null ? false : true;
	console.log("Generating User Profile For: " +user_Id);

	User.findOne({_id: user_Id}).exec()
		.then(function(user){
			console.log(user);
			userData.userInfo = UserRoute.userInfo(user);
			return Friend.find({ $or: [{ sender_Id: user_Id }, { recipient_Id: user_Id }] }).exec()
			//in the future, probably need to get all the friend and follow user_Info just to display
		})
		.then(function(friends){
			userData.friends = friends;
			return Follow.find({"follower_Id": user_Id}).exec()
		})
		.then(function(following){
			userData.following = following;
			res.status(200).json({ userData: userData});
		}).catch(function(err){
			console.log("Error fetching user profile for " +user_Id + ": " + err);
			res.status(400).json({ message: "Error fetching user profile"});
		})
	.done();
}

exports.userProfile = function(req, res) {
	let userData = {};
	let user_Id = req.params.id != null ? req.params.id : req.user._id;
	console.log("Generating User Profile For: " +user_Id);

	User.findOne({_id: user_Id}).exec()
		.then(function(user){
			console.log(user);
			userData.userInfo = UserRoute.userInfo(user);
			return Friend.find({ $or: [{ sender_Id: user_Id }, { recipient_Id: user_Id }] }).exec()
			//in the future, probably need to get all the friend and follow user_Info just to display
		})
		.then(function(friends){
			userData.friends = friends;
			return Follow.find({"follower_Id": user_Id}).exec()
		})
		.then(function(following){
			userData.following = following;
			res.status(200).json({ userData: userData});
		}).catch(function(err){
			console.log("Error fetching user profile for " +user_Id + ": " + err);
			res.status(400).json({ message: "Error fetching user profile"});
		})
	.done();
}

// exports.updateProfile = function(req, res) {
// 	console.log("Updating Profile with:" + JSON.stringify(req.body.profile));
// 	let profile = req.body.profile;
// 	User.update({_id: req.user._id }, {profile: profile}).exec()
// 		.then(function(result){
// 			console.log("Profile update success");
// 			res.status(200).json({message: "activeActivity update success"});
// 		})
// 		.catch(function(err){
// 			res.status(400).json({message: "Error occured update activteActivities for user"});
// 		})
// 	.done();
// }