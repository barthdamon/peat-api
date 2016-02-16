'use strict';

let express = require('express');
let app = express();
var Promise = require('bluebird');

var Leaf = require('../models/LeafSchema.js');
var Witness = require('./../models/WitnessSchema.js');
var Ability = require('./../models/AbilitySchema.js');
var Media = require('./Media.js');


exports.getNewsfeed = function(req, res) {

}

exports.getLeafFeed = function(req, res) {
	let abilityName = req.params.abilityName;
	let activityName = req.params.activityName;
	let user_Id = req.user._id;

	Activity.findOne({ name: activityName }).exec()
		.then(function(activity){
			// if (!activity.approved) {
			// 	throw "Activity not approved";
			// }
//Maybe need another model here???
			return Ability.findOne({name: abilityName, activityName: activityName}).exec()
		})
		.then(function(ability){
			//todo: have a better algorithm that returns tutorials orgs pay for or whatever
			//promisify all here
			return Media.getMediaForLeafFeed(ability._id)
		})
		.then(function(mediaInfo){
			res.status(200).json({"leafFeed": mediaInfo});
		})
		.catch(function(err){
			res.status(400).json({"message": "Error getting existing ability titles"});
		})
	.done();
}
