'use strict';
/*
Description: Schema for defining friend relationships, which can be confirmed
sender and recipient are the ids of users

timestamp is date requested until it is confirmed, then it becomes date confirmed
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
var db = require('../config/db.js');

var friendSchema = mongoose.Schema({
	sender: String,
	recipient: String,
	confirmed: Boolean,
	timestamp: Number
});

mongoose.model('Friend', friendSchema);
var Friend = db.model('Friend');

module.exports = Friend;