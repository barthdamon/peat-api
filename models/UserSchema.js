'use strict';
/*
Description: Base user schema
*/

let express = require('express');
let app = express();
var mongoose = require('mongoose');
var db = require('../config/db.js');

var userSchema = mongoose.Schema({
	name: String,
	userName: { type: String, unique: true},
	email: { type: String, unique: true }, 
	password: String,
	friends: [String]
});

mongoose.model('User', userSchema);
var User = db.model('User');

exports.User = User;