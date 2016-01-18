'use strict';

/*
Description: Schema for defining follow relationships, which are one way requests that basically
cause a users newsfeed to be populated with the following person
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var witnessSchema = mongoose.Schema({
	witness_Id: String,
	witnessed_Id: String,
	leafId: String,
	confirmed: Boolean,
	timestamp: Number
});

mongoose.model('Witness', witnessSchema);
var Witness = db.model('Witness');

module.exports = Witness;