'use strict';
/*
Description: Comments are tied to a media object 
They are either a witness event or a actual comment
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('./../config/db.js');

var commentSchema = mongoose.Schema({
	sender: String,
	media: String,
	witnessEvent: Boolean,
	text: String,
	timestamp: Number
});

mongoose.model('Comment', commentSchema);
var Comment = db.model('Comment');

module.exports = Comment;
