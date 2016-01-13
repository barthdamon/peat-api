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
	user: String,
	mediaId: { type: String, unique: true},
	leafStructure: String,
	mediaInfo: {
		url: String,
		mediaType: String,
	},
	meta: {
		timestamp: Number,
		description: String,
		variation: String
	}
});

mongoose.model('Media', mediaSchema);
var Media = db.model('Media');

module.exports = Media;