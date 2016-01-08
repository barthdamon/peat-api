'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('./../config/db.js');

var leafStructureSchema = mongoose.Schema({
	activityType: String,
	coordinates: {
		x: Number,
		y: Number
	},
	abilityTitle: String,
	stableId: String,
	connections: [String],
	demos: [String]
});

mongoose.model('LeafStructure', leafStructureSchema);
var LeafStructure = db.model('LeafStructure');

module.exports = LeafStructure;
