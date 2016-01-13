'use strict';

/*
Description: Structure has the coordinates, demos, connections, and shared ability data
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// var Promise = require('bluebird');
var db = require('./../config/db.js');

var leafStructureSchema = mongoose.Schema({
	activityType: String,
	coordinates: {
		x: Number,
		y: Number
	},
	abilityTitle: String,
	stableId: { type: String, unique: true},
	connections: [String],
	demos: [String]
});
mongoose.model('LeafStructure', leafStructureSchema);
var LeafStructure = db.model('LeafStructure');

module.exports = LeafStructure;
