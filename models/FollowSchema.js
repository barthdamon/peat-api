'use strict';

/*
Description: Schema for defining follow relationships, which are one way requests that basically
cause a users newsfeed to be populated with the following person
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var followSchema = mongoose.Schema({
	follower_Id: String,
	following_Id: String,
	timestamp: Number
});

mongoose.model('Follow', friendSchema);
var Follow = db.model('Follow');

module.exports = Follow;