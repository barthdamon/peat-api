'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Leaf = require('../models/LeafSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var Media = require('./Media.js');
var Ability = require('./../models/AbilitySchema.js');
var Activity = require('./../models/ActivitySchema.js');
var User = require('./User.js');

exports.newLeaf = function(req, res) {
	let currentTime = Date.now();
	let leafId = req.body.leafId;
	let ability_Id = req.body.ability_Id;
	let abilityName = req.body.abilityName;
	let activityName = req.body.activityName;

	console.log("ABILITYNAME: " + abilityName + "ACTIVITYNAMES:" + activityName);
	Ability.update({name: abilityName, activityName: activityName},
		 {name: abilityName, activityName: activityName},
		 {upsert: true}).exec()
		.then(function(success){
			return Ability.findOne({name: abilityName, activityName: activityName}).exec()
		})
		.then(function(ability){
			if (ability) {
				req.ability_Id = ability._id;
				console.log("ABILITY DONE");
				var newLeaf = new Leaf({
					user_Id: req.user._id,
					activityName: req.body.activityName,
					ability_Id: req.ability_Id,
					leafId: req.body.leafId,
					layout: {
						coordinates: {
							x: req.body.layout.coordinates.x,
							y: req.body.layout.coordinates.y
						},
						groupingId: req.body.layout.grouping
					},
					completionStatus: req.body.completionStatus,
					abilityName: req.body.abilityName,
					description: req.body.description,
					tip: req.body.tip,
					timestamp: currentTime
				});
				return newLeaf.save()
			} else {
				throw "Ability not created"
			}
		})
		.then(function(success){
			res.status(201).json({message: "leaf created", "ability_Id": req.ability_Id});
		})
		.catch(function(err){
			res.status(400).json({ message: "leaf create failure: " + err });
		})
	.done();
}

function abilityCheck(id, abilityName, activityName) {
	return new Promise(function(resolve, reject) {
		//id already exists

	});
}

exports.generateLeafData = generateLeafData;
function generateLeafData(leafId) {
	console.log("Generating leaf data");

	var leafInfo = {mediaInfo:{}};

	return new Promise(function(resolve, reject) {
		Leaf.findOne({ leafId: leafId }).exec()
			.then(function(leaf){
				leafInfo.leaf = leaf;
				return Witness.find({leafId: leafId}).exec()
			})
			.then(function(witnesses){
				leafInfo.witnesses = witnesses;
				var userIds = witnesses.map(witness => { return witness.witness_Id });
				return User.userProfilesForIds(userIds)
			})
			.then(userInfo => {
				leafInfo.witnesses.forEach(witness => {
					userInfo.users.forEach(user => {
						if (witness.witness_Id = user._id) {
							witness._doc.witnessUser = user;
						}
					})
				})
				return Media.getMediaWithQuery({leafId: leafId})
			})
			.then(function(mediaInfo){
				leafInfo.mediaInfo = mediaInfo;
				resolve(leafInfo);
			})
			.catch(function(err){
				console.log("Error generating leaf data: " + err);
				reject(err);
			})
		.done();
	});
}

//returns all the media, coments, and witness events for the leaf (the contents for the drilldown)
exports.getLeafData = function(req, res) {
	let leafId = req.params.leafId;
	let user_Id = req.user._id;

	generateLeafData(leafId)
		.then(leafInfo => {
			res.status(200).json(leafInfo);
		})
		.catch(err => {
			res.status(400).json({message : "Error generating leaf data: " +err});
		})
	.done();
}

exports.updateLeaf = function(req, res) {
	console.log("LEAF UPDATE REQUEST: " + JSON.stringify(req.body));
	Leaf.update({leafId: req.body.leafId, user_Id: req.user._id}, {layout: req.body.layout, completionStatus: req.body.completionStatus, abilityName: req.body.abilityName, description: req.body.description, tip: req.body.tip}, function(err, result){
		if (err) {
			res.status(400).json({message: "Error updating leaf"});
		} else {
			res.status(200).json({message: "Leaf update successful"});
		}
	});
}

exports.findExistingAbility = function(req, res) {
	let abilityTerm = req.params.abilityTerm;
	let activityName = req.params.activityName;

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			// if (!activity.approved) {
			// 	throw "Activity not approved";
			// }
			return Ability.find({name: {$regex : abilityTerm, $options: 'i'}, activityName: activityName}).limit(5).exec()
		})
		.then(function(abilities){
			//just return the names perhaps..... yeah just return the names, then when the leaf feed is generated it will search by the name
			res.status(200).json({"abilities": abilities});
		})
		.catch(function(err){
			res.status(400).json({"message": "Error finding existing abilities"});
		})
	.done();
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

