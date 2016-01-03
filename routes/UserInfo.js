'use strict';

let express = require('express');
let app = express();

var Promise = require('bluebird');

var User = require('./User.js');
var Media = require('./Media.js');
var Friend = require('./Friend.js');
var Leaf = require('./Leaf.js');
var Thread = require('./Thread.js');


exports.getUserInfo = function(req, res) {
	//do everything basically.... Have sockets open in the background so if anything changes like comments they get updated

	//Get user info (names, email)
}
