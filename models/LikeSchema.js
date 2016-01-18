'use strict';

/*
Description: users post Likes on either media or comments. Anybody can like any media or comment
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var likeSchema = mongoose.Schema({
	user_Id: String,
	mediaId: String,
	comment_Id: String,
	timestamp: Number
});

mongoose.model('Like', likeSchema);
var Like = db.model('Like');

module.exports = Like;