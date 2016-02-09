'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Media = require('../models/MediaSchema.js');
var Comment = require('./../models/CommentSchema.js');
var Like = require('./../models/LikeSchema.js');
var User = require('./User.js');


exports.postMedia = function(req, res) {
	let currentTime = Date.now();
	//Leaf structure MUST be the stableId of the leaf
	let leafId = req.body.leafId;
	let mediaId = req.body.mediaId;

	//For each variationId on the medias variations array check if there is a variation with the variationId. If not, create it with a custom field of true.
	//Then post the media with the variations array of the request, assuming the variations on the request are all created or valid (are found)

	//in the future may want audio files, they shouldnt be able to just stick a link in. Media would get lost that way... unreliable and unprofessional
	//all leaves store references to the leafIds, which get pulled in later
	var postedMedia = new Media({
		user_Id: req.user._id,
		mediaId: mediaId,
		leafId: leafId,
		source: {
			url: req.body.source.url,
			mediaType: req.body.source.mediaType
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

exports.getMediaForLeaf = function(leafId) {
	var mediaInfo = {};

	// var commentProfiles = function attachCommentProfiles(comment) {
	// 	return new Promise(function(resolve, reject) {
	// 		User.userProfileForId(comment.sender_Id)
	// 			.then(function(userProfile){
	// 				comment.userProfile = userProfile;
	// 				resolve(comment);
	// 			})
	// 			.catch(function(err){
	// 				reject(err);
	// 			})
	// 		.done();
	// 	});
	// }

	var commentIds = [];
	var mediaIds = [];
	var user_Ids = [];
		
	return new Promise(function(resolve, reject) {

		Media.find({$query: {leafId: leafId}, $orderby: { timestamp : -1 }}).exec()
			.then(function(media){
				// console.log("MEDIA FOUND: " + JSON.stringify(media));
				mediaInfo.media = media;
				media.forEach(function(media){
					mediaIds.push(media.mediaId);
				});
				return Comment.find({$query: {mediaId: {$in: mediaIds}}, $orderby: { timestamp : -1 }}).exec()
			})
			.then(function(comments){
				console.log("DECORATED COMMENTS: " + comments);
				comments.forEach(function(comment){
					commentIds.push(comment._id);
					mediaInfo.media.forEach(function(media){
						if (comment.mediaId == media.mediaId) {
							if (media._doc.comments) {
								media._doc.comments.push(comment);
							} else {
								media._doc.comments = [comment];
							}
							// console.log("mediaCommentss: " + JSON.stringify(media._doc.comments));
						}
					})
				});
				return Like.find({$or: [{mediaId: {$in: mediaIds}}, {commentId: {$in: commentIds}}] }).exec()
			})
			.then(function(likes){
				likes.forEach(function(like){
					mediaInfo.media.forEach(function(media){
						if (like.mediaId == media.mediaId) {
							user_Ids.push(like.user_Id);
							if (media._doc.likes) {
								media._doc.likes.push(like);
							} else {
								media._doc.likes = [like];
							}
						}
						media._doc.comments.forEach(function(comment){
							if (like.comment_Id == comment._id) {
								user_Ids.push(comment.sender_Id);
								media.likes.push(like);
							}
						})
					})
				})
				// console.log("likes: " + JSON.stringify(likes));
				return User.userProfilesForIds(user_Ids)
			})
			.then(function(userInfos){
				userInfos.forEach(function(info){
					mediaInfo.media.forEach(function(media){
						media._doc.comments.forEach(function(comment){
							if (comment.sender_Id == info.userInfo._id) {
								comment._doc.userInfo = info;
							}
						})
						media._doc.likes.forEach(function(like){
							if (like.user_Id == info.userInfo._id) {
								like._doc.userInfo = info;
							}
						})
					})
				})
				// console.log("MEDIA SENT: " + JSON.stringify(mediaInfo));
				resolve(mediaInfo);
			})
			.catch(function(err){
				reject(err);
			})
		.done();
	});
}