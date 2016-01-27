'use strict';

//MARK: DEPENDENCIES
let express = require('express');
let app = express();

var Promise = require('bluebird');

var Friend = require('./../models/FriendSchema.js');
var Witness = require('./../models/WitnessSchema.js');

exports.getRequests = function(req, res) {
	let user_Id = req.user._id;

	Friend.find({recipient_Id: user_Id, confirmed: false}).exec()
		.then(function(friends){
			req.friendRequests = friends;
			return Witness.find({witnessed_Id: user_Id, confirmed: false}).exec()
		})
		.then(function(witnesses){
			res.status(200).json({witnessRequests: witnesses, friendRequests: req.friendRequests});
		})
		.catch(function(err){
			res.status(400).json({message: "Error getting mailbox"});
		})
	.done();
}