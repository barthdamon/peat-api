'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Gallery = require('../models/GallerySchema.js');
var Media = require('../models/MediaSchema.js');
var MediaRoute = require('./Media.js');

exports.mediaToGallery = function(req, res) {
	console.log("Media to gallery route");
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
		console.log("Adding media to gallery");
		MediaRoute.createMedia(req)
			.then(function(result){
				console.log("Media created for gallery");
				return Gallery.update({user_Id: req.user._id}, {$addToSet: {mediaIds: req.body.mediaId}}).exec()
			})
			.then(function(result){
				console.log("Gallery updated");
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
	console.log("getting gallery for: " + user_Id);
	Gallery.findOne({user_Id: user_Id}).exec()
		.then(function(gallery){
			req.gallery = gallery;
			var mediaIds = [];
			gallery.mediaIds.forEach(function(id){
				mediaIds.push(id);
			})
			return MediaRoute.getMediaWithQuery({mediaId: {$in: mediaIds}})
		})
		.then(function(mediaInfo){
			res.status(200).json({"mediaInfo": mediaInfo, "gallery": req.gallery});
		})
		.catch(function(err){
			res.status(400).json({messiage: "Error getting gallery: " + err});
		})
	.done();
}

exports.removeMediaFromGallery = function(req, res) {
	let mediaId = req.params.id;
	Gallery.update({ $pull: { mediaIds: mediaId }}).exec()
		.then(function(result){
			res.status(200).json({"message": "media removed from gallery"});
		})
		.catch(function(err){
			res.status(400).json({"message": "error removing media from gallery"});
		})
	.done();
}