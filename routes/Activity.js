'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

// var Activity = require('../models/ActivitySchema.js');
var LeafStructure = require('./LeafStructure.js');
var LeafFiller = require('./LeafFiller.js');

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
	let activityType = req.body.activityType;
	//Sorts between user and viewing and newsfeed on the leaf filler route
	let user = req.user;
	let viewing = req.body.viewing;
	//newsfeed is bool
	let newsfeed = req.body.newsfeed;

	LeafStructure.getStructureForActivity(activityType).then(function(structures) {
		LeafFiller.getFillersForActivity(structures, user, viewing, newsfeed).then(function(filling){
			res.status(200).json({"activity": activityType, "leafStructures": structures, "leafFilling": filling});
		}).catch(function(err){
			console.log("Error fetching leaf filling" + err);
			res.status(400).json({"message" : "Error fetching leaf filling"});
		});
	}).catch(function(err){
		console.log("Error fetching leaf structures" + err);
		res.status(400).json({"message" : "Error fetching leaf structures"});
	});
}
