'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Activity = require('./../models/ActivitySchema.js');
var Leaf = require('./../models/LeafSchema.js');
var LeafRoute = require('./Leaf.js');
var Connection = require('./../models/ConnectionSchema.js');
var Grouping = require('./../models/GroupingSchema.js');

exports.getTree = function(req, res) {
	let activityName = req.params.activityName;
	let user_Id = req.params.id;

	var mediaIds = [];

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			// if (!activity.approved) {
			// 	throw "Activity not approved";
			// }
			return Leaf.find({user_Id: user_Id, activityName: activityName}).exec()
		})
		.then(function(leaves){
			req.leaves = leaves
			var leafIds = [];
			leaves.forEach(leaf=> {
				leafIds.push(leaf.leafId);
			})
			return LeafRoute.generateLeafData(leafIds)
		})
		.then(function(leafData){
			leafData.forEach(data=> {
				req.leaves.forEach(leaf=> {
					if (leaf.leafId == data.leafId) {
						leaf._doc.contents = data;
					}
				})
			})
			return Connection.find({user_Id: user_Id, activityName: activityName}).exec()
		})
		.then(function(connections){
			req.connections = connections;
			return Grouping.find({user_Id: user_Id, activityName: activityName}).exec()
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
	// let newLeaves = req.body.newLeaves;

	let connectionUpdates = req.body.updatedConnections;
	let connectionRemovals = req.body.removedConnections;
	let newConnections = req.body.newConnections;

	let groupingUpdates = req.body.updatedGroupings;
	let groupingRemovals = req.body.removedGroupings;
	let newGroupings = req.body.newGroupings;

	console.log("NEW CONNECTIONS:" + JSON.stringify(newConnections));

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
			console.log("here1");
		})
		.then(function(){
			//leaves sould be updated by here
			var removeLeafIds = [];
			leafRemovals.forEach(function(removal){
				removeLeafIds.push(removal.leafId);
			})
						console.log("here2");
			return Leaf.remove({leafId: {$in: removeLeafIds}}).exec()
		})
		// .then(function(){
		// 				console.log("here3");
		// 	if (newLeaves.length > 0) {
		// 		return Leaf.collection.insert(newLeaves)
		// 	} else {
		// 		return
		// 	}
		// })
		.then(function(){
			let action = connectionUpdates.map(connectionUpd);
						console.log("here4");
			return Promise.promisifyAll(action, {multiArgs: true})
		})
		.then(function(){
			//leaves sould be updated by here
			var removeConnectionIds = [];
			connectionRemovals.forEach(function(removal){
				removeConnectionIds.push(removal.connectionId);
			})
						console.log("here5");
			return Connection.remove({connectionId: {$in: removeConnectionIds}}).exec()
		})
		.then(function(){
						console.log("here6");
			if (newConnections.length > 0) {
				return Connection.collection.insert(newConnections)
			} else {
				return
			}
		})
		.then(function(){
									console.log("here7");
			let action = groupingUpdates.map(groupingUpd);
			return Promise.promisifyAll(action, {multiArgs: true})
		})
		.then(function(){
			var removeGroupingIds = [];
			groupingRemovals.forEach(function(removal){
				removeGroupingIds.push(removal.groupingId);
			})
						console.log("here8");
			return Grouping.remove({groupingId: {$in: removeGroupingIds}}).exec()
		})
		.then(function(){
						console.log("here9");
			if (newGroupings.length > 0) {
				return Grouping.collection.insert(newGroupings)
			} else {
				return
			}
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
		Connection.update({connectionId: connection.connectionId, user_Id: user_Id}, connection).exec()
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

