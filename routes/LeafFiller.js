'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var LeafFiller = require('../models/LeafFillerSchema.js');
var Friend = require('./Friend.js');
var Media = require('./Media.js');

//Called when posting media
exports.addMediaToFiller = function(leafStructure, mediaId, user) {
	return new Promise(function(resolve, reject) {
		LeafFiller.find({ user: user, leafStructure: leafStructure }, function(err, filler) {
			if (err) {
				console.log("Error finding leaf filler: " + err);
				reject(err);
			} else {

				if (filler.length > 0) {
					console.log('filler found' + filler);
					LeafFiller.update({user: user, leafStructure: leafStructure}, {$push: { media: mediaId }}, function(err, filler) {
						if (err) {
							console.log("Error updating media on leaf filler: " + err);
							reject(err);
						} else {
							resolve(filler);
						}
					});
				} else {
					console.log('creating new filler');
					createFiller(leafStructure, mediaId, user).then(function(err, newFiller){
						resolve(newFiller);
					}).catch(function(err){
						console.log("Error creating filler" + err);
					});
				}
			}
		});
	});
}

function createFiller(leafStructure, mediaId, user) {
	return new Promise(function(resolve, reject) {
		let currentTime = Date.now();
		var newFiller = new LeafFiller({
			leafStructure: leafStructure,
			user: user,
			media: mediaId,
			timestamp: currentTime
		});

		newFiller.save(function(err) {
			if (err) {
				reject(err);
			} else {
				resolve(newFiller);
			}
		});
	});
}



//MARK: Get routes for activity

exports.getFillersForActivity = function(user, structures) {
	return new Promise(function(resolve, reject) {
		var params = {};
		LeafFiller.find({ user: user, leafStructure: { $in: structures }}, function(err, filling) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				getMediaFromFilling(filling).then(function(media){
					resolve({filling: filling, included: media});
				});
			}
		});
	});
}

exports.getFillersForActivityNewsfeed = function(user, structures) {
	return new Promise(function(resolve, reject) {
		console.log('FETCHING FOR ACTIVITY NEWSFEED');
		Friend.findFriends(user).then(function(friends){
			let friendIds = [];
			friends.forEach(function(friend) {
				if (friend.confirmed) {
					friendIds.push(friend.recipient);
					friendIds.push(friend.sender);
				}
			});
			console.log("FRIEND IDS: " +friendIds);
			LeafFiller.find({user: { $in: friendIds }, leafStructure: { $in: structures} }, function(err, filling) {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					console.log('FILLING: '+filling);
					getMediaFromFilling(filling).then(function(media){
						resolve({filling: filling, included: media});
					});
				}			
			});
		}).catch(function(err){
			console.log("Error fetching friends for leaf filling: " + err);
			reject(err);
		});
	});
}


function getMediaFromFilling(filling) {
	return new Promise(function(resolve, reject){
		var mediaIds = [];
		filling.forEach(function(filler){
			filler.media.forEach(function(mediaId){
				mediaIds.push(mediaId);
			});
		});
		Media.fetchMediaWithIds(mediaIds).then(function(media){
			resolve(media);
		}).catch(function(err){
			console.log("Error fetching media for leaf filling");
			reject(err);
		});
	});
}



