'use strict';

/*
Description: Comments are tied to a media object 
They are either a witness event or a actual comment
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var activitySchema = mongoose.Schema({
	name: {type: String, unique: true},
	category: String,
	approved: Boolean
});

mongoose.model('Activity', activitySchema);
var Activity = db.model('Activity');

module.exports = Activity;
