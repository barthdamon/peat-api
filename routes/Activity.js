'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Activity = require('./../models/ActivitySchema.js');

exports.requestActivity = function(req, res) {
 var newActivity = new Activity({
 	name: req.body.name,
 	category: req.body.category,
 	approved: false
 });

 newActivity.save(function(err){
 	if (err) {
 		res.status(400).json({message: "Activity request failed"});
 	} else {
 		//TODO: send request to the admin panel for review (maybe its just a slack reference?)
 		res.status(200).json({message: "Activity request successful"});
 	}
 });
}

exports.approveActivity = function(req, res) {
	Activity.find({name: req.body.activityName}, {approved: true}, function(err, result){
		if (err) {
			res.status(400).json({message: "Error approving activity"});
		} else {
			res.status(200).json({message: "Activity approval successful"});
		}
	})
}
