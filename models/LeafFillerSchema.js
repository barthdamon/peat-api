'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('./../config/db.js');

var leafFillerSchema = mongoose.Schema({
	leafStructure: String,
	user: String,
	media: [String],
	timestamp: Number
});

mongoose.model('LeafFiller', leafFillerSchema);
var LeafFiller = db.model('LeafFiller');

module.exports = LeafFiller;