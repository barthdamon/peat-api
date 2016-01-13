'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var LeafStructure = require('./../models/LeafStructureSchema.js');
var Variation = require('./Variation.js');

// exports.createStructuresFromSeedJson = function(structureArray) {
// 	return new Promise(function(resolve, reject) {
// 		LeafStructure.create(structureArray, function(err, structures) {
// 			if (err) {
// 				console.log(err);
// 				reject(err);
// 			} else {
// 				resolve();
// 			}
// 		});
// 	});
// }

// exports.clearStructuresForSeed = function() {
// 	return new Promise(function(resolve, reject) {
// 		return LeafStructure.remove({}, function(err, result){
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(result);
// 			}
// 		});
// 	});
// }

// exports.getStructuresForActivity = function(activityType) {
// 	LeafStructure.find({ activityType: activityType }).exec();
// }