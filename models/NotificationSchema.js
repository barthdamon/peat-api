'use strict';

/*
Description: a dynamic multipurpose notification that gets 'seen' by users
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var notificationSchema = mongoose.Schema({
	userToNotify_Id: String,
	userNotifying_Id: String,
	seen: Boolean,
	type: String,
	mediaId: String,
	timestamp: Number
});

mongoose.model('Notification', notificationSchema);
var Notification = db.model('Notification');

module.exports = Notification;