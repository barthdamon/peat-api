'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Gallery = require('../models/GallerySchema.js');
var Media = require('../models/MediaSchema.js');
var MediaRoute = require('./Media.js');

exports.mediaToGallery = function(req, res) {
	addMediaToGallery(req)
		.then(function(result){
			res.status(201).json({message: "media successfully added to gallery"});			
		})
		.catch(function(err){
			res.status(400).json({ message: "gallery media post failure: " + err });
		})
	.done();
}

exports.addMediaToGallery = addMediaToGallery;
function addMediaToGallery(req) {
	return new Promise(function(resolve, reject) {
		MediaRoute.createMedia(req)
			.then(function(result){
				return Gallery.update({user_Id: req.user._id, "activityTags.activityName": req.body.activityName}, 
					{$addToSet: {mediaIds: req.body.mediaId}}).exec()
			})
			.then(function(result){
				resolve();
			})
			.catch(function(err){
				reject(err);
			})
		.done();
	});
}

exports.getGallery = function(req, res) {
	let user_Id = req.params.id;

	Gallery.findOne({user_Id: user_Id})
		.then(function(gallery){
			req.gallery = gallery;
			var mediaIds = [];
			gallery.activityTags.forEach(function(activity){
				activity.mediaIds.forEach(function(id){
					mediaIds.push(id);
				})
			})
			return MediaRoute.getMediaWithQuery({mediaId: {$in: mediaIds}})
		})
		.then(function(mediaInfo){
			res.status(200).json({"mediaInfo": mediaInfo, "gallery": gallery});
		})
		.catch(function(err){
			res.status(400).json({messiage: "Error getting gallery: " + err});
		})
}

exports.activityToGallery = function(req, res) {

}

exports.removeMediaFromGallery = function(req, res) {

}