'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Leaf = require('../models/LeafSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var Ability = require('./../models/AbilitySchema.js');
var Activity = require('./../models/ActivitySchema.js');
var Media = require('./Media.js');
var Following = require('./../models/FollowSchema.js');
var User = require('./User.js');


exports.getNewsfeed = function(req, res) {
	let user_Id = req.user._id;
	let activityName = req.params.activityName;

	var user_Ids = [];

	console.log("Generating Newsfeed");
	Following.find({follower_Id: user_Id}).exec()
		.then(function(following){
			following.forEach(function(follow){
				user_Ids.push(follow.following_Id);
			});
			console.log("Followers found for newsfeed: " + JSON.stringify(user_Ids));
			return User.userProfilesForIds(user_Ids)
		})
		.then(function(users){
			req.following = users;
			//TODO: newsfeed algorithm................
			var query = {};
			if (activityName == "all") {
				query = { $or: [{uploaderUser_Id: { $in: user_Ids }}, {taggedUser_Ids: { $in: user_Ids }}] };
			} else {
				query = { activityName: activityName, $or: [{uploaderUser_Id: { $in: user_Ids }}, {taggedUser_Ids: { $in: user_Ids }}] };
			}
			console.log("Following found");
			return Media.getMediaWithQuery(query)
		})
		.then(function(mediaInfo){
			console.log("MEDIA INFO: " + JSON.stringify(mediaInfo));
			res.status(200).json({"newsfeed": mediaInfo, "following": req.following});
		})
		.catch(function(err){
			res.status(400).json({"message": "Error getting newsfeed"});
		})
	.done();
}

exports.getLeafFeed = function(req, res) {
	let abilityName = req.params.abilityName;
	let activityName = req.params.activityName;
	let user_Id = req.user._id;

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			// if (!activity.approved) {
			// 	throw "Activity not approved";
			// }
//Maybe need another model here???
			return Ability.findOne({name: abilityName, activityName: activityName}).exec()
		})
		.then(function(ability){
			//todo: have a better algorithm that returns tutorials orgs pay for or whatever
			//promisify all here
			console.log("Looking for media with abilityName: " + abilityName + " activityName: " + activityName);
			return Media.getMediaWithQuery({abilityName: abilityName, activityName: activityName})
		})
		.then(function(mediaInfo){
			res.status(200).json({"leafFeed": mediaInfo});
		})
		.catch(function(err){
			res.status(400).json({"message": "Error getting leafFeed"});
		})
	.done();
}
