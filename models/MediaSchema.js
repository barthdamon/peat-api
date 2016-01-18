'use strict';

/*
Description: Media is either a video or photo that is tied to an ability
It has comments, and other information
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var mediaSchema = mongoose.Schema({
	user_Id: String,
	mediaId: {type: String, unique: true},
	leafId: String,
	mediaInfo: {
		url: String,
		mediaType: String,
	},
	description: String,
	location: String,
	timestamp: Number
});

mongoose.model('Media', mediaSchema);
var Media = db.model('Media');

module.exports = Media;