'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Activity = require('./../models/ActivitySchema.js');
var Leaf = require('./../models/LeafSchema.js');

exports.getTree = function(req, res) {
	let activityName = req.params.activityName;
	let user_Id = req.body.viewing != null ? req.body.viewing : req.user._id;

	var mediaIds = [];

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			if (!activity.approved) {
				throw "Activity not approved";
			}
			return Leaf.find({user_Id: user_Id, activityName: activityName}).exec()
		})
		.then(function(leaves){
			res.status(200).json({treeInfo: {activityName: activityName, user: user_Id, leaves: leaves}});
		})
		.catch(function(err){
			console.log("Error generating tree" + err);
			res.status(400).json({message : "Error generating tree: " +err});
		})
	.done();
}

exports.saveTree = function(req, res) {
	//save updated tree
	let activityName = req.params.activityName;
	let updates = req.body.updated;
	let removals = req.body.removed;
	let newLeaves = req.body.newLeaves;
	let user_Id = req.user._id;

	console.log("NEW LEAVES: " + JSON.stringify(newLeaves));

	var upd = function updateLeaf(leaf) {
		update(leaf, user_Id);
	}

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			if (!activity.approved) {
				throw "Activity not approved";
			}
			let action = updates.map(upd);
			return Promise.promisifyAll(action, {multiArgs: true})
		})
		.then(function(){
			//leaves sould be updated by here
			var removeLeafIds = [];
			removals.forEach(function(removal){
				removeLeafIds.push(removal.leafId);
			})
			return Leaf.remove({leafId: {$in: removeLeafIds}}).exec()
		})
		.then(function(){
			return Leaf.collection.insert(newLeaves)
		})
		.then(function(){
			res.status(200).json({message: "Tree update successful"});	
		})
		.catch(function(err){
			console.log("Error updating tree" + err);
			res.status(400).json({message : "Error updating tree: " +err});
		})
	.done();
}




function update(leaf, user_Id) {
	console.log("leaf: " + JSON.stringify(leaf) + " user: " + user_Id);
	return new Promise(function(resolve, reject) {
		Leaf.update({leafId: leaf.leafId, user_Id: user_Id},leaf).exec()
			.then(function(result){
				resolve(result);
				console.log("a leaf updated");
			})
			.catch(function(err) {
				reject(err);
			})
		.done();
	});
}

