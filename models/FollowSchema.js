'use strict';

/*
Description: Schema for defining follow relationships, which are one way requests that basically
cause a users newsfeed to be populated with the tree they are following of another user
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var followSchema = mongoose.Schema({
	follower_Id: String,
	following_Id: String,
	followingActivity: String,
	timestamp: Number
});

mongoose.model('Follow', followSchema);
var Follow = db.model('Follow');

module.exports = Follow;