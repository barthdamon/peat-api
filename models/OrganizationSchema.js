'use strict';

/*
Description: Organizations can have their own trees, members, among other things
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('../config/db.js');

var organizationSchema = mongoose.Schema({
	organizationId: String,
	name: String,
	memberCount: Number,
	activities: [{type: String, unique: true}]
});

mongoose.model('Friend', organizationSchema);
var Organization = db.model('Organization');

module.exports = Organization;