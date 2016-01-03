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
	let userInfo = {
		first: req.user.first,
		last: req.user.last,
		username: req.user.username,
		email: req.user.email
	};

	//Attach friend data
	Friend.findFriends(req.user).then(function(fetchedFriends){
		userInfo.friends = fetchedFriends;
	}).catch(function(err){
		console.log("Error fetching friends" + err);
	});

	//Attach leaf data, but probably without the media in in. When the user drills into a specific leaf it should query for the comments in the leaf


}
