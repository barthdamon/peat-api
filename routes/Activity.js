'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

// var Activity = require('../models/ActivitySchema.js');
var LeafStructure = require('./../models/LeafStructureSchema.js');
var LeafData = require('./../seed/LeafData.js');
var Variation = require('./../models/VariationSchema.js');
var Media = require('../models/MediaSchema.js');
var Friend = require('./../models/FriendSchema.js');
var Comment = require('./../models/CommentSchema.js');

/*
Tree:
	-activity (name)
	-leafStructure (instructional videos, coordinates) - has id of an activity
	-leafMedia (media and comments (both of which have users attached)) - has id of a leaf structure

/*
FIRST the tree data structure is loaded. Then the activity fillers are loaded, 
which are generated for either a user, or a users friends
*/

exports.getActivity = function(req, res) {
	let activityType = req.params.type;
	let user = req.body.viewing != null ? req.body.viewing : req.user._id;

	var structureIds = [];
	var mediaIds = [];

	if (activityType && LeafData.isActivity(activityType)) {

		LeafStructure.find({ activityType: activityType }).exec()
			.then(function(structures){
				req.structures = structures;
				for (var i = 0; i < structures.length; i++) {
					structureIds.push(structures[i].stableId);
				}
				return Media.find({user: user, activity: activityType}).exec()
			})
			.then(function(media){
				req.media = media;
				for (var i = 0; i < media.length; i++) {
					mediaIds.push(media[i].mediaId);
				}
				console.log("media: " + media);
				console.log("structureIds: " + structureIds + " mediaIds: " + mediaIds);									
				return Variation.find({ $or : [{ custom: false, leafStructure: { $in: structureIds } }, { mediaId : { $in: mediaIds }, leafStructure: { $in: structureIds } }] }).exec()
			})
			.then(function(variations){
				req.variations = variations;
				return Comment.find({media: { $in: mediaIds }}).sort({timestamp: -1}).exec()
			})
			.then(function(comments){
				res.status(200).json({activity: activityType, leafInfo: { structures : req.structures, variations: req.variations }, mediaInfo: { media: req.media, comments: comments }});
			})
			.catch(function(err){
				console.log("Error generating activity" + err);
				res.status(400).json({message : "Error generating activity"});
			})
		.done();
	} else {
		res.status(400).json({message : "Invalid activity type"});
	}
}


exports.getActivityNewsfeed = function(req, res) {
	let activityType = req.params.type;
	let user = req.body.viewing != null ? req.body.viewing : req.user._id;

	var structureIds = [];
	var mediaIds = [];

	/*
	no need to add user at first cause user asking gets plopped in here too
	cause they are either the sender/recipient on every friend document
	*/
	var userIds = [];

	if (activityType && LeafData.isActivity(activityType)) {

		Friend.find({ $or : [{ sender: user }, { recipient: user }] }).exec()
			.then(function(friends){
				for (var i = 0; i < friends.length; i++) {
					userIds.push(friends[i].recipient);
					userIds.push(friends[i].sender);
				}
				return LeafStructure.find({ activityType: activityType }).exec()
			})	
			.then(function(structures){
				req.structures = structures;
				for (var i = 0; i < structures.length; i++) {
					structureIds.push(structures[i].stableId);
				}
				return Media.find({user: {$in: userIds}, activity: activityType}).exec()
			})
			.then(function(media){
				req.media = media;
				for (var i = 0; i < media.length; i++) {
					mediaIds.push(media[i].mediaId);
				}
				console.log("media: " + media);
				console.log("structureIds: " + structureIds + " mediaIds: " + mediaIds);									
				return Variation.find({ $or : [{ custom: false, leafStructure: { $in: structureIds } }, { mediaId : { $in: mediaIds }, leafStructure: { $in: structureIds } }] }).exec()
			})
			.then(function(variations){
				req.variations = variations;
				return Comment.find({media: { $in: mediaIds }}).sort({timestamp: -1}).exec()
			})
			.then(function(comments){
				res.status(200).json({activity: activityType, leafInfo: { structures : req.structures, variations: req.variations }, mediaInfo: { media: req.media, comments: comments }});
			})
			.catch(function(err){
				console.log("Error generating activity" + err);
				res.status(400).json({message : "Error generating activity"});
			})
		.done();

	} else {
		res.status(400).json({message : "Invalid activity type"});
	}
}
