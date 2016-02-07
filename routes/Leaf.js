'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Leaf = require('../models/LeafSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var Media = require('./Media.js');

exports.newLeaf = function(req, res) {
	let currentTime = Date.now();
	let leafId = req.body.leafId;

	var newLeaf = new Leaf({
		user_Id: req.user._id,
		activityName: req.body.activityName,
		leafId: req.body.leafId,
		layout: {
			coordinates: {
				x: req.body.layout.coordinates.x,
				y: req.body.layout.coordinates.y
			},
			groupingId: req.body.layout.grouping
		},
		completionStatus: req.body.completionStatus,
		title: req.body.title,
		description: req.body.description,
		timestamp: currentTime
	});

	newLeaf.save(function(err) {
		if(err) {
			res.status(400).json({ message: "leaf create failure: " + err });
		} else {
			res.status(201).json({message: "leaf created"});
		}
	});
}

//returns all the media, coments, and witness events for the leaf (the contents for the drilldown)
exports.getLeafData = function(req, res) {
	let leafId = req.params.leafId;
	let user_Id = req.user._id;

	var leafInfo = {mediaInfo:{}};

	Leaf.findOne({ user_Id: user_Id, leafId: leafId }).exec()
		.then(function(leaf){
			leafInfo.leaf = leaf;
			return Witness.find({leafId: leafId}).exec()
		})
		.then(function(witnesses){
			leafInfo.witnesses = witnesses;
			console.log("Searching media with leafId: " +leafId + ", user_Id: " + user_Id);
			return Media.getMediaForLeaf(leafId)
		})
		.then(function(mediaInfo){
			leafInfo.mediaInfo = mediaInfo;
			res.status(200).json(leafInfo);
		})
		.catch(function(err){
			console.log("Error generating leaf data: " + err);
			res.status(400).json({message : "Error generating leaf data: " +err});
		})
	.done();

}

exports.updateLeaf = function(req, res) {
	console.log("LEAF UPDATE REQUEST: " + JSON.stringify(req.body));
	Leaf.update({leafId: req.body.leafId, user_Id: req.user._id}, {layout: req.body.layout, completionStatus: req.body.completionStatus, title: req.body.title, description: req.body.description}, function(err, result){
		if (err) {
			res.status(400).json({message: "Error updating leaf"});
		} else {
			res.status(200).json({message: "Leaf update successful"});
		}
	});
}


// exports.changeLeafStatus = function(req, res) {
// 	let completionStatus = req.body.completionStatus;
// 	if (status == "Completed" || status == "Learning" || status == "Goal") {
// 		Leaf.update({leafId: req.body.leafId, user_Id: req.user._id}, {completionStatus: completionStatus}, function(err, result) {
// 			if (err) {
// 				res.status(400).json({message: "Error updating completion status"});
// 			} else {
// 				res.status(200).json({message: "Completion status update successful"});
// 			}
// 		});
// 	} else {
// 		res.status(400).json({message: "Invalid completion status"});
// 	}
// }

