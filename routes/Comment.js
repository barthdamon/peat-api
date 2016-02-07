'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Comment = require('../models/CommentSchema.js');
var Leaf = require('../models/LeafSchema.js');
var Media = require('../models/MediaSchema.js');
var Like = require('../models/LikeSchema.js');
var Witness = require('../models/WitnessSchema.js');

exports.createComment = function(req, res) {
	console.log("HERE");
	console.log(req.user);
	var sender = req.user._id;
	var currentTime = Date.now();
	var newComment = new Comment({
		sender_Id: sender,
		mediaId: req.body.mediaId,
		text: req.body.text,
		timestamp: currentTime		
	});

	newComment.save(function(err) {
		if (err) {
			res.status(400).json({ message: "comment create failure: " + err });
		} else {
			res.status(200).json({ message: "comment create success" });
		}
	});
}

//MARK: Like
exports.newLike = function(req, res) {
	var currentTime = Date.now();
	var sender = req.user._id;
	//leaf.update
	//User has to be one of the other users friends though
	var newLike = new Like({
		user_Id: sender,
		mediaId: req.body.mediaId,
		comment_Id: req.body.comment_Id,
		timestamp: currentTime
	});

	newLike.save(function(err) {
		if (err) {
			res.status(400).json({ message: "like create failure: " + err });
		} else {
			res.status(200).json({ message: "like create success" });
		}
	});

}