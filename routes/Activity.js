'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

// var Activity = require('../models/ActivitySchema.js');
var LeafStructure = require('./LeafStructure.js');
var LeafFiller = require('./LeafFiller.js');
var LeafData = require('./../seed/LeafData.js');

/*
Tree:
	-activity (name)
	-leafStructure (instructional videos, coordinates) - has id of an activity
	-leafMedia (media and comments (both of which have users attached)) - has id of a leaf structure

/*
FIRST the tree data structure is loaded. Then the activity fillers are loaded, 
which are generated for either a user, or a users friends
*/

exports.getActivity = function(req, res) {
	let activityType = req.params.type;
	let user = req.body.viewing != null ? req.body.viewing : req.user._id;

	if (activityType && LeafData.isActivity(activityType)) {
		//using a callback cause there was a weird bug with promises.....
		LeafStructure.getStructuresForActivity(activityType, function(err, structures){
			if (err) {
				console.log("Error fetching leaf structures" + err);
				res.status(400).json({message : "Error fetching leaf structures"});
			} else {
				var structureIds = [];
				structures.forEach(function(struct){
					structureIds.push(struct.stableId);
				});
				return LeafFiller.getFillersForActivity(user, structureIds).then(function(filling){
					//Note: the filling's leaf structure field is the stableId of the structure
					res.status(200).json({activity: activityType, leafStructures: { data : structures }, leafFilling: { data : filling }});
				}).catch(function(err){
					console.log("Error fetching leaf filling" + err);
					res.status(400).json({message : "Error fetching leaf filling"});
				});
			}
		});
	} else {
		res.status(400).json({message : "Invalid activity type"});
	}
}

exports.getActivityNewsfeed = function(req, res) {
	let activityType = req.params.type;
	let user = req.user._id;

	if (activityType && LeafData.isActivity(activityType)) {
		LeafStructure.getStructuresForActivity(activityType, function(err, structures){
			if (err) {
				console.log("Error fetching leaf structures" + err);
				res.status(400).json({message : "Error fetching leaf structures"});
			} else {
				var structureIds = [];
				structures.forEach(function(struct){
					structureIds.push(struct.stableId);
				});
				return LeafFiller.getFillersForActivityNewsfeed(user, structureIds).then(function(filling){
					//Note: the filling's leaf structure field is the stableId of the structure
					res.status(200).json({activity: activityType, leafStructures: { data : structures }, leafFilling: { data : filling }});
				}).catch(function(err){
					console.log("Error fetching leaf filling" + err);
					res.status(400).json({message : "Error fetching leaf filling"});
				});
			}
		});
	} else {
		res.status(400).json({message : "Invalid activity type"});
	}
}
