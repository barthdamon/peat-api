'use strict';

/*
Description: Threads are administrative messages from one user to the other
Friend requests, notifications, and media completion notifications are counted here for now...
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('../config/db.js');

var threadSchema = mongoose.Schema({
	sender: String,
	recipient: String,
	media: String,
	notification: Boolean,
	request: Boolean,
	text: String,
	recieved: String,
	history: [{ type: String, ref: 'Thread' }],
	timestamp: Number,
});

mongoose.model('Thread', messageSchema);
var Thread = db.model('Thread');

exports.Thread = Thread;