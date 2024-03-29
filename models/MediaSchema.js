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
	mediaId: String,
	leafId: String,
	taggedUser_Ids: [String],
	uploaderUser_Id: String,
	ability_Id: String,
	source: {
		url: String,
		mediaType: String,
	},
	description: String,
	location: String,
	purpose: String,
	timestamp: Number
});

mongoose.model('Media', mediaSchema);
var Media = db.model('Media');

module.exports = Media;