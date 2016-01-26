'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var User = require('./User.js');
var UserModel = require('./../models/UserSchema.js');
var Profile = require('./../models/ProfileSchema.js');

exports.createFriend = function(req, res) {
	let sender = req.user._id;
	let recipient = req.params.id;
	let currentTime = Date.now();
	console.log("SENDER: " + sender + "Recipient: " + recipient);
	let newFriend = new Friend({
		sender_Id: sender,
		recipient_Id: recipient,
		confirmed: false,
		timestamp: currentTime
	});

	console.log("NEW FRIEND: " + newFriend);

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
	let sender = req.params.id;
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

exports.getFriends = function(req, res) {
	var user_Ids = [];
	let user_Id = req.params.id;
	console.log("Id: "+ user_Id);
	//This is where the user asks for all their friends
	Friend.find({$or : [{ sender_Id: user_Id}, {recipient_Id: user_Id}], confirmed: true}).exec()
		.then(function(friends){
			console.log("friends: " + friends);
			req.friends = friends;
			friends.forEach(function(friend){
				if (friend.sender_Id != user_Id) {
					user_Ids.push(friend.sender_Id);
				} else {
					user_Ids.push(friend.recipient_Id);
				}
			});
			return UserModel.find({"_id": {$in: user_Ids}}).exec()
		})
		.then(function(users){
			var friends = [];
			users.forEach(function(user){
				friends.push({userInfo: User.userInfo(user)});
			});
			req.friends = friends;
			console.log("users: " +users);
			return Profile.find({"user_Id": {$in: user_Ids}}).exec()
		})
		.then(function(profiles){
			console.log("profiles: " + profiles);
			profiles.forEach(function(profile){
				req.friends.forEach(function(friend){
					if (friend.userInfo._id == profile.user_Id) {
						friend.profile = profile;
					}
				})
			})
			res.status(200).json({friends: req.friends});
		})
		.catch(function(err){
			res.status(400).json({message: "Error getting friends: " + err});
		})
	.done();
}

//when user denies request same as destroying friendship
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

