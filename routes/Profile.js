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
	let needsMailbox = req.params.id != null ? false : true;
	console.log("Generating User Profile For: " +user_Id);

	User.findOne({"_id": user_Id}).exec()
		.then(function(user){
			userData.userInfo = UserRoute.userInfo(user);
			return Profile.find({"user_Id": user_Id}).exec()
		})
		.then(function(profile){
			//Profile NEEDS to be updated every time an activity is saved.
			userData.profile = profile;
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

exports.uploadAvatar = function(req, res) {
	Profile.update({ 'user_Id' : req.user._id }, { 'avatarUrl' : req.body.avatarUrl }, function(err, result) {
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