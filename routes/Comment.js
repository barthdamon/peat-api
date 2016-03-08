'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Comment = require('../models/CommentSchema.js');
var Leaf = require('../models/LeafSchema.js');
var Media = require('../models/MediaSchema.js');
var Like = require('../models/LikeSchema.js');
var Witness = require('../models/WitnessSchema.js');
var Mailbox = require('./Mailbox.js');

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

	var user_Ids = [];

	newComment.save()
		.then(comment => {
			return Media.findOne({mediaId: req.body.mediaId }).exec()
		})
		.then(media=> {
			if (media.taggedUserIds != null) {
				media.taggedUserIds.forEach(id => {
					user_Ids.push(id);
				})
			}
			user_Ids.push(media.uploaderUser_Id);
			return Comment.find({ mediaId: req.body.mediaId }).exec()
		})
		.then(comments => {
			comments.forEach(comment => {
				if (comment.sender != sender) {
					user_Ids.push(comment.sender);
				}
			})
			let ids = user_Ids.filter(id => { if (id != null) { return id } });
			console.log("Creating notifications for " + JSON.stringify(ids));
			return Mailbox.createNotifications(ids, sender, "comment", req.body.mediaId, null)
		})
		.then(result => {
			res.status(200).json({ message: "comment create success" });
		})
		.catch(err => {
			res.status(400).json({ message: "comment create failure: " + err });
		})
	.done();
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

	newLike.save()
		.then(like => {
			return Media.findOne({mediaId: req.body.mediaId }).exec()
		})
		.then(media=> {
			media.taggedUserIds.forEach(id => {
				user_Ids.push(id);
			})
			user_Ids.push(media.uploaderUser_Id);
			return Mailbox.createNotifications(user_Ids, sender, "like", mediaId, null)
		})
		.then(result => {
			res.status(200).json({ message: "like create success" });
		})
		.catch(err => {
			res.status(400).json({ message: "like create failure: " + err });
		})
	.done();
}