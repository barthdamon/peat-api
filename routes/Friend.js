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

exports.reinitializeFriend = function(req, res) {
	let recipient = req.params.id;
	let reinitializer = req.user._id;
	let currentTime = Date.now();

	Friend.update({'endedBy_Id': reinitializer, $or : [{ sender_Id: reinitializer, recipient_Id: recipient }, { sender_Id: recipient, recipient_Id: reinitializer }]},
		{endedBy_Id: "", sender_Id: reinitializer, recipient_Id: recipient}, function(err, result){
		if (err) {
			res.status(400).json({ message: "Error occured while reinitializing friend"});
		} else {
			console.log("friend reinitialization result: " + result);
			res.status(200).json({ message: "Friend reinitialized"});
		}
	})
}

exports.confirmFriend = function(req, res) {
	//user confirming must have recieved
	let sender = req.params.id;
	let recipient = req.user._id;
	let currentTime = Date.now();

	Friend.update({ 'sender_Id' : sender, 'recipient_Id' : recipient }, { 'confirmed' : true, 'timestamp' : currentTime, 'endedBy_Id' : "" }, function(err, result) {
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
	Friend.find({$or : [{ sender_Id: user_Id}, {recipient_Id: user_Id}]}).exec()
		.then(function(friends){
			console.log("friends: " + friends);
			let unconfirmedRelationships = [];
			friends.forEach(function(friend){
				if (friend.confirmed) {
					user_Ids.push(friend.sender_Id != user_Id ? friend.sender_Id : friend.recipient_Id);
				} else {
					unconfirmedRelationships.push(friend);
				}
			});
			req.unconfirmedRelationships = unconfirmedRelationships;
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
			res.status(200).json({friends: req.friends, unconfirmedRelationships: req.unconfirmedRelationships});
		})
		.catch(function(err){
			res.status(400).json({message: "Error getting friends: " + err});
		})
	.done();
}

//when user denies request same as destroying friendship. NO it should be an update that changes confirmed to false.
//We need an ended by field on the friendship, or do we? YES. THen if that doesnt exist and the friendship is false that means the user still needs to confirm the friend request
exports.destroyFriendship = function(req, res) {
	//either sender or recipient must be able to destroy
	let destructor = req.user._id;
	let destructed = req.params.id;
	console.log("Friendship being destroyed, destructor: "+ destructor + " destructed: " + destructed);
	Friend.update({ $or : [{ sender_Id: destructor, recipient_Id: destructed }, { sender_Id: destructed, recipient_Id: destructor }]},
		{confirmed: false, endedBy_Id: req.user._id},
		function(err, result) {
		if (err) {
			console.log("Error destroying friend: "+ err);
			res.status(400).json({ message: "Error occured while destroying friend"});
		} else {
			console.log("friend destruction result: " + result);
			res.status(200).json({ message: "Friend destroyed"});
		}		
	});
}

