'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var leafSchema = mongoose.Schema({
	user_Id: String,
	activityName: String,
	leafId: {type: String, unique: true},
	layout: {
		coordinates: {
			x: Number,
			y: Number
		},
		connections: [{leafId: String, type: String,}],
		groupings: [{name: String, color: String, zIndex: Number}]
	},
	completionStatus: String,
	title: String,
	description: String,
	timestamp: Number
});

mongoose.model('Leaf', leafSchema);
var Leaf = db.model('Leaf');

module.exports = Leaf;
