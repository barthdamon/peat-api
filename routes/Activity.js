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
Newsfeed:


Activity:
	- perhaps in the future allow people to add whatever they want, but to start only have a few on there?
	- activity review process? make sure nobody adds sex or anything like that. Or just literally have a massive list of activities. 
	- Then say: If your activity isn't on here let us know! (quick form with activity name and description)

	- hm...... how to do a newsfeed..... 
	ideas:
	- have the links of the media in a chain in the table view cell (previous - NEW)
	- very simple, just list accomplishments and when user clicks it takes them to that tree ^previous new, connections listed in the newsfeed maybe in a mini screenshot or something?
	

	- will want to follow pros
	- will want to witness pros' stunts
	- theres gotta be a difference between crew and following? Or does there....... hmmmmmmm........
	- yes, only your crew can be witnesses (so and so says he has witnessed you do this) - witness on a leaf or media? - probably the leaf, media gets likes
	- will want to follow and witness their friends stunts.....

Tree:
	- based on a user
	- activity
	- totally customizable
	- tap on screen to create a new leaf, tap and hold then drag to another box to connect leaves.
	- lines can have directions, or they can be neutral (like you did one thing then the next)
	- need to be able to group abilities, then draw lines from the group to other abilities or groups
	- tap and hold on the line to reverse directions
	- coordinates based on center

	- saved when you upload media to an ability, or when user clicks save button


Leaf:
	- [media] (all doing the same thing - in the users eyes, its totally up to them)
	- Coordinates
	- connections

	- when you clump leaves, the media get combined into an array within the leaf.
	Media:
		- description
		- location
		- timestamp
		- comments
		- witness requests (you send to person who uploaded with a message. need to be their friend)

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
				return Media.find({user: user, leafStructure: {$in: structureIds}}).exec()
			})
			.then(function(media){
				req.media = media;
				var variationIds = [];
				for (var i = 0; i < media.length; i++) {
					mediaIds.push(media[i].mediaId);
					variationIds.push.apply(variationIds, media.variations);
				}
				console.log("media: " + media);
				console.log("structureIds: " + structureIds + " mediaIds: " + mediaIds);									
				return Variation.find({ $or : [{ custom: false, leafStructure: { $in: structureIds } }, { variationId : { $in: variationIds }, leafStructure: { $in: structureIds } }] }).exec()
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
