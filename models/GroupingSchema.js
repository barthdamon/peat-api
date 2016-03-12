'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var groupingSchema = mongoose.Schema({
	user_Id: String,
	groupingId: String,
	name: String,
	colorString: String,
	width: Number,
	height: Number,
	layout: {
		coordinates: {
			x: Number,
			y: Number
		},
	}
});

mongoose.model('Grouping', groupingSchema);
var Grouping = db.model('Grouping');

module.exports = Grouping;
