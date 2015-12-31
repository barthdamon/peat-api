'use strict';

/*
Description: Leaves are nodes associated with activities.
Each leaf is tied within the activity progression to other leaves
It is other completed or isn't, and has media associated with it
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('../config/db.js');

var leafSchema = mongoose.Schema({
	user: String,
	media: [String],
	coordinates: {
		x: Number,
		y: Number
	},
	media: [{ type: String, ref: 'Media' }],
	activity: String,
	abilityTitle: String,
	completionStatus: Boolean,
	connections: [String]
});

mongoose.model('Leaf', leafSchema);
var Leaf = db.model('Leaf');

module.exports = Leaf;