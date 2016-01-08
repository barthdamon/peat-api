'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var LeafStructure = require('../models/LeafStructureSchema.js');

exports.createStructureFromJson = function(json) {
	let activityType = json.activityType;
	let coordinates = json.coordinates;
	let abilityTitle = json.abilityTitle;
	//need your own id in order to connect
	let connectionId = json.connectionId;
	let connections = json.connections;
	let demos = json.demos;

	var newStructure = new LeafStructure({
		activityType: activityType,
		coordinates: coordinates,
		abilityTitle: abilityTitle,
		connectionId: connectionId,
		connections: connections,
		demos: demos
	});

	newStructure.save(function(err) {
		if (err) {
			console.log("structure create FAILURE: activityType: " + activityType + " abilityTitle: " + abilityTitle);
		} else {
			console.log("structure create SUCCESS: activityType: " + activityType + " abilityTitle: " + abilityTitle);
		}
	});
}

exports.getStructuresForActivity = function(activityType) {
	return new Promise(function(resolve, reject) {
		LeafStructure.find({ activityType: activityType }, function(err, structures) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(structures);
			}
		});
	});
}