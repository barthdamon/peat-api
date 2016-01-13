
'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');
var Comment = require('./Comment.js');
var Variation = require('./Variation.js');

exports.postMedia = function(req, res) {
	console.log(req.body.mediaInfo.mediaId);
	let currentTime = Date.now();
	//Leaf structure MUST be the stableId of the leaf
	let leafStructure = req.body.leafStructure;
	let viewing = req.body.viewing;
	let user = viewing != null ? viewing : req.user._id;
	let mediaId = req.body.mediaInfo.mediaId;

	var postedMedia = new Media({
		user: user,
		mediaId: mediaId,
		leafStructure: req.body.leafStructure,
		mediaInfo: {
			url: req.body.mediaInfo.url,
			mediaType: req.body.mediaInfo.mediaType,
		},
		meta: {
			timestamp: currentTime,
			description: req.body.meta.description,
			variation: req.body.meta.variation
		}
	});

	postedMedia.save(function(err) {
		if(err) {
			res.status(400).json({ message: "media post failure: " + err });
		} else {
			res.status(201).json({message: "media created"});
		}
	});
}

exports.getMediaForActivity = function(users, activity) {
	Media.find({user: {$in: users}, activity: activity}).exec();
}

// exports.getMediaForActivity = function(users, activity) {
// 	return new Promise(function(resolve, reject) {
// 		Media.find({user: {$in: users}, activity: activity}, function(err, media){
// 			if (err) {
// 				reject(err);
// 			} else if (media) {
// 				var mediaIds = [];
// 				media.forEach(function(media){
// 					mediaIds.push(media.mediaId);
// 				});
// 				console.log("MEDIA: " + media);
// 				return Comment.fetchComments(mediaIds).then(function(comments) {
// 					var mediaInfo = {media: media, comments: comments};
// 					resolve(mediaInfo);
// 				});
// 			} else {
// 				resolve({media: [], comments : []});
// 			}
// 		});
// 	});
// }

//MARK: LOCAL
exports.fetchMediaWithIds = function(mediaIds) {
	return new Promise(function(resolve, reject) {
		Media.find({mediaId: { $in: mediaIds }}, function(err, media) {
			if (err) {
				reject(err);
			} else if (media) {
				Comment.fetchComments(mediaIds).then(function(comments) {
					console.log("Fetching Variations with media Ids: " + mediaIds);
					return Variation.getVariationsForMedia(mediaIds).then(function(variations){
						var mediaInfo = { media: media, variations: variations, comments : comments };
						resolve(mediaInfo);
					});
				});				
			} else {
				resolve({media: [], variations: [], comments : []});
			}
		});
	});
}
