'use strict';

/*
Description: Abilities are what leaves get tied to. Media and leaves both reference and abilityId...
Used primarily to generate leafFeeds
*/

let express = require('express');
let app = express();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./../config/db.js');

var abilitySchema = mongoose.Schema({
	name: String,
	activityName: String,
});

mongoose.model('Ability', abilitySchema);
var Ability = db.model('Ability');

module.exports = Ability;
