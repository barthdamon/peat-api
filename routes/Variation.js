'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Variation = require('./../models/VariationSchema.js');

//TODO:
// exports.createCustomVariation = function(req, res) {
// 	return new Promise(function(resolve, reject) {
// 		Variation.create(req.body.variationData, function(err, variations) {
// 			if (err) {
// 				console.log(err);
// 				reject(err);
// 			} else {
// 				resolve();
// 			}
// 		});
// 	});
// }