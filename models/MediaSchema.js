'use strict';

/*
Description: Media is either a video or photo that is tied to an ability
It has comments, and other information
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('../config/db.js');

var mediaSchema = mongoose.Schema({
	user: String,
	mediaInfo: {
		mediaID: String,
		url: String,
		mediaType: String,
	},
	leaf: String,
	comments: [String],
	meta: {
		timestamp: Number,
		leafPath: String,
		description: String,
	}
});

mongoose.model('Media', mediaSchema);
var Media = db.model('Media');

module.exports = Media;