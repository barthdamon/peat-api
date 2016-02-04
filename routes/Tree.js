'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Activity = require('./../models/ActivitySchema.js');
var Leaf = require('./../models/LeafSchema.js');
var Connection = require('./../models/ConnectionSchema.js');
var Grouping = require('./../models/GroupingSchema.js');

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
			req.leaves = leaves
			return Connection.find({user_Id: user_Id, activityName: activityName}).exec()
		})
		.then(function(connections){
			req.connections = connections;
			Grouping.find({user_Id: user_Id, activityName: activityName}).exec()
		})
		.then(function(groupings){
			res.status(200).json({activityName: activityName, user: user_Id, leaves: req.leaves, connections: req.connections, groupings: groupings});
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
	let user_Id = req.user._id;

	let leafUpdates = req.body.updatedLeaves;
	let leafRemovals = req.body.removedLeaves;
	let newLeaves = req.body.newLeaves;

	let connectionUpdates = req.body.updatedConnections;
	let connectionRemovals = req.body.removedConnections;
	let newConnections = req.body.newConnections;

	let groupingUpdates = req.body.updatedGroupings;
	let groupingRemovals = req.body.removedGroupings;
	let newGroupings = req.body.newGroupings;

	console.log("NEW LEAVES: " + JSON.stringify(newLeaves));

	var leafUpd = function updateLeaf(leaf) {
		leafUpdate(leaf, user_Id);
	}
	var connectionUpd = function updateConnection(connection) {
		connectionUpdate(connection, user_Id);
	}
	var groupingUpd = function updateGrouping(grouping) {
		groupingUpdate(grouping, user_Id);
	}

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			if (!activity.approved) {
				throw "Activity not approved";
			}
			let action = leafUpdates.map(leafUpd);
			return Promise.promisifyAll(action, {multiArgs: true})
		})
		.then(function(){
			//leaves sould be updated by here
			var removeLeafIds = [];
			leafRemovals.forEach(function(removal){
				removeLeafIds.push(removal.leafId);
			})
			return Leaf.remove({leafId: {$in: removeLeafIds}}).exec()
		})
		.then(function(){
			return Leaf.collection.insert(newLeaves)
		})
		.then(function(){
			let action = connectionUpdates.map(connectionUpd);
			return Promise.promisifyAll(action, {multiArgs: true})
		})
		.then(function(){
			//leaves sould be updated by here
			var removeConnectionIds = [];
			connectionRemovals.forEach(function(removal){
				removeConnectionIds.push(removal._id);
			})
			return Connection.remove({_id: {$in: removeConnectionIds}}).exec()
		})
		.then(function(){
			return Connection.collection.insert(newConnections)
		})
		.then(function(){
			let action = groupingUpdates.map(groupingUpd);
			return Promise.promisifyAll(action, {multiArgs: true})
		})
		.then(function(){
			//leaves sould be updated by here
			var removeGroupingIds = [];
			groupingRemovals.forEach(function(removal){
				removeGroupingIds.push(removal.groupingId);
			})
			return Grouping.remove({groupingId: {$in: removeGroupingIds}}).exec()
		})
		.then(function(){
			return Grouping.collection.insert(newGroupings)
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




function leafUpdate(leaf, user_Id) {
	console.log("leaf: " + JSON.stringify(leaf) + " user: " + user_Id);
	return new Promise(function(resolve, reject) {
		Leaf.update({leafId: leaf.leafId, user_Id: user_Id}, leaf).exec()
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

function connectionUpdate(connection, user_Id) {
	console.log("connection: " + JSON.stringify(connection) + " user: " + user_Id);
	return new Promise(function(resolve, reject) {
		Connection.update({_id: connection._id, user_Id: user_Id}, connection).exec()
			.then(function(result){
				resolve(result);
				console.log("a connection updated");
			})
			.catch(function(err) {
				reject(err);
			})
		.done();
	});
}

function groupingUpdate(grouping, user_Id) {
	console.log("grouping: " + JSON.stringify(grouping) + " user: " + user_Id);
	return new Promise(function(resolve, reject) {
		Grouping.update({groupingId: grouping.groupingId, user_Id: user_Id}, grouping).exec()
			.then(function(result){
				resolve(result);
				console.log("a grouping updated");
			})
			.catch(function(err) {
				reject(err);
			})
		.done();
	});
}

