'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Leaf = require('../models/LeafSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var Media = require('../models/MediaSchema.js');
var Comment = require('./../models/CommentSchema.js');
var Like = require('./../models/LikeSchema.js');

exports.newLeaf = function(req, res) {
	let currentTime = Date.now();
	let leafId = req.body.leafId;

	var newLeaf = new Leaf({
		user_Id: req.user._id,
		activityName: req.body.activityName,
		leafId: req.body.leafId,
		mediaIds: null,
		layout: {
			coordinates: {
				x: req.body.layout.coordinates.x,
				y: req.body.layout.coordinates.y
			},
			connections: req.body.layout.connections,
			groupings: req.body.layout.groupings
		},
		completionStatus: req.body.completionStatus,
		title: req.body.title,
		description: req.body.description,
		timestamp: currentTime
	});

	newLeaf.save(function(err) {
		if(err) {
			res.status(400).json({ message: "leaf create failure: " + err });
		} else {
			res.status(201).json({message: "leaf created"});
		}
	});
}

//returns all the media, coments, and witness events for the leaf (the contents for the drilldown)
exports.getLeafData = function(req, res) {
	let leafId = req.params.leafId;
	let user_Id = req.user._id;

	var leafInfo = {mediaInfo:{}};

	var commentIds = [];
	var mediaIds = [];

	Leaf.findOne({ user_Id: user_Id, leafId: leafId }).exec()
		.then(function(leaf){
			leafInfo.leaf = leaf;
			return Witness.find({leafId: leafId}).exec()
		})
		.then(function(witnesses){
			leafInfo.witnesses = witnesses;
			console.log("Searching media with leafId: " +leafId + ", user_Id: " + user_Id);
			return Media.find({leafId: leafId}).exec()
		})
		.then(function(media){
			console.log("MEDIA FOUND: " + media);
			leafInfo.mediaInfo.media = media;
			media.forEach(function(media){
				mediaIds.push(media._id);
			});
			return Comment.find({mediaId: {$in: mediaIds}}).exec()
		})
		.then(function(comments){
			leafInfo.mediaInfo.comments = comments;
			comments.forEach(function(comment){
				commentIds.push(comment._id);
			});
			return Like.find({mediaId: {$in: mediaIds}, commentId: {$in: commentIds} })
		})
		.then(function(likes){
			leafInfo.mediaInfo.likes = likes;
			res.status(200).json(leafInfo);
		})
		.catch(function(err){
			console.log("Error generating leaf data: " + err);
			res.status(400).json({message : "Error generating leaf data: " +err});
		})
	.done();

}


exports.changeLeafStatus = function(req, res) {
	let completionStatus = req.body.completionStatus;
	if (status == "Completed" || status == "Learning" || status == "Goal") {
		Leaf.update({leafId: req.body.leafId, user_Id: req.user._id}, {completionStatus: completionStatus}, function(err, result) {
			if (err) {
				res.status(400).json({message: "Error updating completion status"});
			} else {
				res.status(200).json({message: "Completion status update successful"});
			}
		});
	} else {
		res.status(400).json({message: "Invalid completion status"});
	}
}

