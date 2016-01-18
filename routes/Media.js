'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');
var Leaf = require('../models/LeafSchema.js');

exports.postMedia = function(req, res) {
	console.log(req.body.mediaInfo.mediaId);
	let currentTime = Date.now();
	//Leaf structure MUST be the stableId of the leaf
	let leafId = req.body.leafId;
	let mediaId = req.body.mediaId;

	//For each variationId on the medias variations array check if there is a variation with the variationId. If not, create it with a custom field of true.
	//Then post the media with the variations array of the request, assuming the variations on the request are all created or valid (are found)

	//in the future may want audio files too
	//all leaves store references to the leafIds, which get pulled in later
	var postedMedia = new Media({
		user_Id: req.user._id,
		mediaId: mediaId,
		leafId: leafId,
		mediaInfo: {
			url: req.body.mediaInfo.url,
			mediaType: req.body.mediaInfo.mediaType
		},
		description: req.body.description,
		location: req.body.location,
		timestamp: currentTime
	});

	postedMedia.save(function(err){
		if (err){
			res.status(400).json({ message: "media post failure: " + err });
		} else {
			res.status(201).json({message: "media posted"});			
		}
	});
}