'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var leafSchema = mongoose.Schema({
	user_Id: String,
	activityName: String,
	leafId: String,
	layout: {
		coordinates: {
			x: Number,
			y: Number
		},
		groupingId: String
	},
	completionStatus: String,
	title: String,
	description: String,
	timestamp: Number
});

mongoose.model('Leaf', leafSchema);
var Leaf = db.model('Leaf');

module.exports = Leaf;
