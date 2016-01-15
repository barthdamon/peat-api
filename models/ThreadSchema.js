'use strict';

/*
Description: Threads are administrative messages from one user to the other
Friend requests, notifications, and media completion notifications are counted here for now...
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var threadSchema = mongoose.Schema({
	sender_Id: String,
	recipient_Id: String,
	mediaId: String,
	notification: Boolean,
	request: Boolean,
	text: String,
	recieved: String,
	history_Ids: [String],
	timestamp: Number,
});

mongoose.model('Thread', messageSchema);
var Thread = db.model('Thread');

module.exports = Thread;