'use strict';

/*
Description: Variation is linked to media as a variation of the leaf structure.
Users can add their own variations if they want to but they need to be
part of a valid grouping.

variations without mediaIds are the default variations seeded from json

structure is the stableId of the structure
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var variationSchema = mongoose.Schema({
	activity: String,
	leafStructure: String,
	mediaId: String,
	meta : {
		grouping: String,
		title: String
	},
	custom: Boolean
});

mongoose.model('Variation', variationSchema);
var Variation = db.model('Variation');

module.exports = Variation;