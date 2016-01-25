'use strict';

/*
Description: Schema for defining friend relationships, which can be confirmed
sender and recipient are the ids of users

progress NEEDS to be updated every time a users activity gets saved!

timestamp is date requested until it is confirmed, then it becomes date confirmed
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var profileSchema = mongoose.Schema({
	user_Id: {type: String, unique: true},
	summary: String,
	avatarUrl: String,
	contact: String,
});

mongoose.model('Profile', profileSchema);
var Friend = db.model('Profile');

module.exports = Friend;