'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Variation = require('./../models/VariationSchema.js');

exports.createVariationsFromSeedJson = function(variationArray) {
	return new Promise(function(resolve, reject) {
		Variation.create(variationArray, function(err, variations) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

// exports.createCustomVariation = function(r) {
// 	return new Promise(function(resolve, reject) {
// 		Variation.create(variationArray, function(err, variations) {
// 			if (err) {
// 				console.log(err);
// 				reject(err);
// 			} else {
// 				resolve();
// 			}
// 		});
// 	});
// }

exports.clearDefaultVariationsForSeed = function(cb) {
	Variation.remove({custom: false}, function(err, result){
		if (err) {
			cb(err, null);
		} else {
			cb(null, result);
		}
	});
}

//need to get the default structures variations, and then whatever variations the users involved have.....
exports.getVariationsForStructure = function(structure) {
	return new Promise(function(resolve, reject) {
		Variation.find({custom: false}, function(err, variations){
			if (err) {
				reject(err);
			} else {
				resolve(variations);
			}
		});
	});
}

exports.getVariationsForMedia = function(mediaIds) {
	return new Promise(function(resolve, reject) {
		Variation.find({mediaId: { $in: mediaIds }}, function(err, variations){
			if (err) {
				reject(err);
			} else {
				resolve(variations);
			}
		});
	});
	// Variation.find({ mediaId: mediaId }, function(err, structures) {
	// 	if (err) {
	// 		console.log(err);
	// 		cb(err, null);
	// 	} else {
	// 		cb(null, structures);
	// 	}
	// });
}