'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var leafSchema = mongoose.Schema({
	user_Id: String,
	activityName: String,
	ability_Id: String,
	leafId: String,
	groupingId: String,
	layout: {
		coordinates: {
			x: Number,
			y: Number
		}
	},
	completionStatus: String,
	abilityName: String,
	description: String,
	tip: String,
	timestamp: Number
});

mongoose.model('Leaf', leafSchema);
var Leaf = db.model('Leaf');

module.exports = Leaf;
