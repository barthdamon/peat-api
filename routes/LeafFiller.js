'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var LeafFiller = require('../models/LeafFillerSchema.js');
var Friend = require('./Friend.js');

//Called when posting media
exports.addMediaToFiller = function(leafStructure, mediaId, user) {
	return new Promise(function(resolve, reject) {
		LeafFiller.find({ user: user, leafStructure: leafStructure }, function(err, filler) {
			if (err) {
				console.log("Error finding leaf filler: " + err);
				reject(err);
			} else {
				if (filler) {
					LeafFiller.update({user: user, leafStructure: leafStructure}, {$push: { media: mediaId }}, function(err, filler) {
						if (err) {
							console.log("Error updating media on leaf filler: " + err);
							reject(err);
						} else {
							resolve(filler);
						}
					});
				} else {
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

exports.getFillersForActivity = function(user, viewing, newsfeed) {
	return new Promise(function(resolve, reject) {
		var params = {};

		if (newsfeed != null && newsfeed == true) {
			//fill for the users friends (need to get friends), newsfeed 
			Friend.findFriends(user).then(function(friends){
				let friendIds = [];
				friends.forEach(friend) {
					friendIds.push(friend._id);
				}
				findLeafFillers({user: { $in: friendIds }}).then(function(filling){
					resolve(filling);
				}).catch(function(err){
					console.log("Error leaf filling for friends: " + err);
					reject(err);
				});
			}).catch(function(err){
				console.log("Error fetching friends for leaf filling: " + err);
				reject(err);
			});

		} else if (viewing != null) {
			// fill for the user being viewed (viewing is the id of a user)
			findLeafFillers({ user : viewing }).then(function(filling){
				resolve(filling);
			}).catch(function(err){
				console.log("Error fetching leaf filling for user beging viewed: " + err);
				reject(err);
			});
		} else {
			//Only fill for the user (user is the middleware attached user on the request)
			findLeafFillers({ user : user._id }).then(function(filling){
				resolve(filling);
			}).catch(function(err){
				console.log("Error fetching leaf filling for user: " + err);
				reject(err);
			});
		}
	});
}

function findLeafFillers(params) {
	return new Promise(function(resolve, reject) {
		LeafFiller.find(params, function(err, filling) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(filling);
			}			
		});
	});
}
