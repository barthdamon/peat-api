'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

// var Activity = require('../models/ActivitySchema.js');
var LeafStructure = require('./../models/LeafStructureSchema.js');
var LeafData = require('./../seed/LeafData.js');
var Variation = require('./../models/VariationSchema.js');
var Media = require('../models/MediaSchema.js');
var Comment = require('./Comment.js');

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
	let users = [user];

	var structureIds = [];
	var mediaIds = [];

	if (activityType && LeafData.isActivity(activityType)) {

		LeafStructure.find({ activityType: activityType }).exec()
			.then(function(structures){
				req.structures = structures;
				for (var i = 0; i < structures.length; i++) {
					structureIds.push(structures[i].stableId);
				}
				return Media.find({user: {$in: users}, activity: activityType}).exec()
			})
			.then(function(media){
				req.media = media;
				for (var i = 0; i < media.length; i++) {
					mediaIds.push(media[i].mediaId);
				}
				console.log("media: " + media);
				console.log("structureIds: " + structureIds + " mediaIds: " + mediaIds);									
				return Variation.find({ $or : [{ custom: false, leafStructure: { $in: structureIds } }, { mediaId : { $in: mediaIds }, leafStructure: { $in: structureIds } }] }).exec()
			})
			.then(function(variations){
				res.status(200).json({activity: activityType, leafInfo: { structures : req.structures, variations: variations }, mediaInfo: { media: req.media, comments: [] }});
			})
			.catch(function(err){
				console.log("Error generating activity" + err);
				res.status(400).json({message : "Error generating activity"});
			})
		.done();

	} else {
		res.status(400).json({message : "Invalid activity type"});
	}
}

	// .then(function(department){
	// 	return Manager.findManager(department);
	// })
	// .then(function(manager){
	// 	return Employee.getEmployeesForManager(manager);
	// })
	// .then(function(employees){
	// 	res.send('employees', {
	// 		employees: employees
	// 	});
	// })
	// .catch(function(error){
	// 	console.log(error);
	// })
	// .done();


















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
				return structures.forEach(function(struct){
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
