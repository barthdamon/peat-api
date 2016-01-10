'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var LeafStructure = require('./../models/LeafStructureSchema.js');

exports.createStructuresFromSeedJson = function(structureArray) {
	return new Promise(function(resolve, reject) {
		LeafStructure.create(structureArray, function(err, structures) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

exports.clearStructuresForSeed = function() {
	return new Promise(function(resolve, reject) {
		LeafStructure.remove({}, function(err, result){
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

//hacky use of a callback, for some reason promises broken...
exports.getStructuresForActivity = function(activityType, cb) {
	LeafStructure.find({ activityType: activityType }, function(err, structures) {
		if (err) {
			console.log(err);
			cb(err, null);
		} else {
			cb(null, structures);
		}
	});
}