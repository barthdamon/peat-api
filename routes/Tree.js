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

	Activity.find({ name: activityName }).exec()
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
}