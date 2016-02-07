'use strict';

let express = require('express');
let app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var connectionSchema = mongoose.Schema({
	connectionId: String,
	user_Id: String,
	activityName: String,
	type: String,
	toId: String,
	fromId: String,
});

mongoose.model('Connection', connectionSchema);
var Connection = db.model('Connection');

module.exports = Connection;
