'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var User = require('./User.js');
var UserModel = require('./../models/UserSchema.js');

exports.getRequests = function(req, res) {
	let user_Id = req.user._id;
	var user_Ids = [];
	Friend.find({$or : [{recipient_Id: user_Id}], confirmed: false}).exec()
		.then(function(friends){
			console.log("Friends: " + friends);
			req.unconfirmedFriends = friends;
			friends.forEach(function(friend){
				user_Ids.push(friend.sender_Id != user_Id ? friend.sender_Id : friend.recipient_Id);
			});
			return Witness.find({witnessed_Id: user_Id, confirmed: false}).exec()
		}).then(function(witnesses){
			req.unconfirmedWitnesses = witnesses;
			witnesses.forEach(function(witness){
				user_Ids.push(witness.witness_Id);
			})
			return UserModel.find({"_id": {$in: user_Ids}}).exec()
		})
		.then(function(users){
			var requestUsers = [];
			users.forEach(function(user){
				requestUsers.push({userInfo: User.userInfo(user)});
			});
			requestUsers.forEach(function(requestUser){
				let _id = requestUser._id;
				req.unconfirmedFriends.forEach(function(friendship){
					if (_id == friendship.sender_Id) {
						requestUser.unconfirmedFriendship = friendship;
					}
				});
				req.unconfirmedWitnesses.forEach(function(witness){
					if (_id == witness.witnessId) {
						requestUser.unconfirmedWitness = witness;
					}
				});
			})
			res.status(200).json({requestUsers: requestUsers});
		})
		.catch(function(err){
			res.status(400).json({message: "Error getting friends: " + err});
		})
	.done();
}