
'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');
// var Comment = require('./Comment.js');
// var Variation = require('./Variation.js');

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
