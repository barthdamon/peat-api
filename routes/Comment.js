'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Comment = require('../models/CommentSchema.js');

exports.createComment = function(req, res) {
	var currentTime = Date.now();
	var newComment = new Comment({
		sender: req.body.sender,
		media: req.body.media,
		witnessEvent: req.body.witnessEvent,
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

//may need for sockets:
// exports.fetchComments = function(mediaIds) {
// 	debugger;
// 	return new Promise(function(resolve, reject){
// 		Comment.find({media: { $in: mediaIds }}).sort({timestamp: -1}).limit(10).exec(function(err, comments) {
// 			if (err) {
// 				reject(err);
// 			} else if (comments) {
// 				resolve(comments);
// 			} else {
// 				resolve([]);
// 			}
// 		});
// 	});
// }
