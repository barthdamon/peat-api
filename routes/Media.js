'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');
var Comment = require('./Comment.js');
var Leaf = require('./Leaf.js');

exports.postMedia = function(req, res) {
	console.log(req.body.params.mediaInfo.mediaID);
	// console.log(req.user._id)
	var currentTime = Date.now();
	var postedMedia = new Media({
		user: req.user.email,
		mediaInfo: {
			mediaID: req.body.params.mediaInfo.mediaID,
			url: req.body.params.mediaInfo.url,
			mediaType: req.body.params.mediaInfo.mediaType,
		},
		leaf: req.body.params.leaf,
		comments: req.body.params.comments,
		meta: {
			timestamp: currentTime,
			leafPath: req.body.params.meta.leafPath,
			description: req.body.params.meta.description,
		}		
	});

	postedMedia.save(function(err) {
		if(err){
			res.status(400).json({ "message": "server media post failure: " + err });
		} else {
			Leaf.putMediaOnLeaf(postedMedia, res);
		}
	});
}

exports.getMedia = function(req, res) {
	//TODO: Add more here to return just the most recent 5 or so. Then in extend make that a post and send down the next most recent 5
	Media.find({ user: req.user.email }).sort({timestamp: -1}).limit(5).exec(function(err, media) {
		if (err) {
			res.status(400).json({"message": "Error finding media"});
		} else if (media) {
			// console.log(media);
			Comment.fetchComments(media).then(function(comments) {
				res.status(200).json({ "media": media, "included" : comments });
			});
		} else {
			res.status(204).json({"message": "No Media for user found"});
		}
	});
}

exports.getUpdate = function(req, res) {
	var lastUpdated = req.body.mostRecent;
	console.log("LAST UPDATED:" +lastUpdated);
	Media.find({timestamp: {$gt: lastUpdated} }).sort({timestamp: -1}).limit(5).exec(function(err, media) {
		if (err) {
			res.status(400).json({"message": "Error fetching media update"});
		} else if (media.length > 0) {
			// console.log(media);
			res.status(200).json({"media": media});
		} else {
			res.status(204).json({"message": "No updates found"});
		}
	});
}

exports.extendNewsfeed = function(req, res) {
	var lastRecieved = req.body.lastRecieved;
	Media.find({timestamp: {$lt: lastRecieved} }).sort({timestamp: -1}).limit(5).exec(function(err, media) {
		if (err) {
			res.status(400).json({"message": "Error fetching media for newsfeed extension"});
		} else if (media.length >0) {
			// console.log(media);
			res.status(200).json({"media": media});
		} else {
			res.status(204).json({"message": "No updates found"});
		}
	});
}

exports.fetchMediaForLeaves = function(leaves) {
	return new Promise(function(resolve, reject) {
		var mediaIds = [];

		for (var i = 0; i < leaves.length; i++) {
			if (leaves[i].media.length > 0) {
				leaves[i].media.forEach(function(media){
					mediaIds.push(media);
				});
			}
		}
		fetchMediaWithIds(mediaIds).then(function(mediaInfo) {
			resolve(mediaInfo);
		});
	});
}

//MARK: LOCAL
function fetchMediaWithIds(mediaIds) {
	return new Promise(function(resolve, reject) {
		Media.find({_id: { $in: mediaIds }}, function(err, media) {
			if (err) {
				reject(err);
			} else if (media) {
				Comment.fetchComments(mediaIds).then(function(comments) {
					var mediaInfo = { "media": media, "included" : comments };
					resolve(mediaInfo);
					debugger;
				});				
			} else {
				resolve({"media": [], "included" : []});
			}
		});
	});
}