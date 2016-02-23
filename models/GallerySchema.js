'use strict';

/*
Description: Each user has a gallery, where they have the option of sending mediaObjects that they are tagged in.
They can then upload media from their gallery to a leaf.
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var gallerySchema = mongoose.Schema({
	user_Id: String,
	mediaIds: [String]
});

mongoose.model('Gallery', gallerySchema);
var Gallery = db.model('Gallery');

module.exports = Gallery;
