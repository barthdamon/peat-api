
'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');
var Comment = require('./Comment.js');
var LeafFiller = require('./LeafFiller.js');

exports.postMedia = function(req, res) {
	console.log(req.body.mediaInfo.mediaId);
	let currentTime = Date.now();
	//Leaf structure MUST be the stableId of the leaf
	let leafStructure = req.body.leafStructure;
	let viewing = req.body.viewing;
	let user = viewing != null ? viewing : req.user._id;

	var postedMedia = new Media({
		user: user,
		mediaInfo: {
			mediaId: req.body.mediaInfo.mediaId,
			url: req.body.mediaInfo.url,
			mediaType: req.body.mediaInfo.mediaType,
		},
		meta: {
			timestamp: currentTime,
			description: req.body.meta.description,
		}	
	});

	postedMedia.save(function(err) {
		if(err) {
			res.status(400).json({ "message": "media post failure: " + err });
		} else {
			LeafFiller.addMediaToFiller(leafStructure, mediaId, user).then(function(filler) {
				res.status(201).json({ "message": "media created and added to leaf filler" });
			}).catch(function(err) {
				console.log("error adding media to filler: " + err);
				res.status(400).json({ "message": "error adding media to leaf filler" });
			});
		}
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
