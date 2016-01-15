'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');

exports.postMedia = function(req, res) {
	console.log(req.body.mediaInfo.mediaId);
	let currentTime = Date.now();
	//Leaf structure MUST be the stableId of the leaf
	let leafStructure = req.body.leafStructure;
	let viewing = req.body.viewing;
	let user = viewing != null ? viewing : req.user._id;
	let mediaId = req.body.mediaId;
	let variationIds = req.body.variationIds;

	//For each variationId on the medias variations array check if there is a variation with the variationId. If not, create it with a custom field of true.
	//Then post the media with the variations array of the request, assuming the variations on the request are all created or valid (are found)

	//in the future may want audio files too

	var postedMedia = new Media({
		user_id: user,
		mediaId: mediaId,
		variations: variationIds,
		mediaInfo: {
			url: req.body.mediaInfo.url,
			mediaType: req.body.mediaInfo.mediaType
		},
		meta: {
			timestamp: currentTime,
			description: req.body.meta.description
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